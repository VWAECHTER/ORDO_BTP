import { FileText, Download, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface TechnicalMemoSectionProps {
  projectId: string;
  hasAnalysis: boolean;
  onMemoGenerated?: (content: string) => void;
}

export function TechnicalMemoSection({ projectId, hasAnalysis, onMemoGenerated }: TechnicalMemoSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [memoContent, setMemoContent] = useState('');
  const [memoVersion, setMemoVersion] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-technical-memo`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Échec de la génération du mémoire technique');
      }

      const { content, version } = await response.json();
      setMemoContent(content);
      setMemoVersion(version);
      setHasGenerated(true);

      if (onMemoGenerated) {
        onMemoGenerated(content);
      }
    } catch (err) {
      console.error('Error generating technical memo:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du mémoire technique');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading memo as PDF...');
  };

  const handleDownloadWord = () => {
    console.log('Downloading memo as Word...');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Mémoire technique</h3>
        {!hasGenerated && (
          <Button
            onClick={handleGenerate}
            disabled={!hasAnalysis || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Générer le mémoire
              </>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!hasAnalysis && !hasGenerated && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Veuillez d'abord effectuer l'analyse pour générer le mémoire technique
          </p>
        </div>
      )}

      {hasGenerated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Version {memoVersion}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadWord}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger Word
              </Button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-8 bg-white max-h-[600px] overflow-y-auto">
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: memoContent.replace(/\n/g, '<br/>').replace(/##/g, '<h3 class="font-bold text-base mt-4 mb-2">').replace(/#/g, '<h2 class="font-bold text-lg mt-6 mb-3">') }}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Structure du mémoire :</strong> 1) Préambule • 2) Synthèse de l'offre • 3) Enjeux & préparation • 4) Modes opératoires • 5) Phasage & maintien circulation • 6) Organisation & moyens • 7) QSE & environnement • Conclusion avec actions clés
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
