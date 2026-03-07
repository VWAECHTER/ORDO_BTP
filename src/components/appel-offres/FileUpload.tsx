import { Upload, File, X, Loader } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  projectId: string;
  onFilesUploaded: () => void;
  acceptedFormats?: string;
}

export function FileUpload({ projectId, onFilesUploaded, acceptedFormats = '.pdf,.doc,.docx,.xls,.xlsx' }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('project_documents')
          .insert({
            project_id: projectId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath
          });

        if (dbError) throw dbError;

        return {
          id: fileName,
          name: file.name,
          size: file.size,
          type: file.type
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onFilesUploaded();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Erreur lors du téléchargement des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (id: string, fileName: string) => {
    try {
      const filePath = `${projectId}/${id}`;

      await supabase.storage
        .from('project-documents')
        .remove([filePath]);

      await supabase
        .from('project_documents')
        .delete()
        .eq('storage_path', filePath);

      setUploadedFiles(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed border-slate-300 rounded-lg p-8 text-center transition-colors ${
          isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-400 cursor-pointer'
        }`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        )}
        <p className="text-sm text-slate-600 mb-2">
          {isUploading ? 'Téléchargement en cours...' : 'Glissez-déposez vos fichiers ici ou cliquez pour sélectionner'}
        </p>
        <p className="text-xs text-slate-500">
          Formats acceptés : PDF, Word, Excel
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Fichiers téléchargés ({uploadedFiles.length})</h4>
          {uploadedFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id, file.name)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
