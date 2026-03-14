/*
  # Create project-documents storage bucket

  1. Storage
    - Create `project-documents` bucket for storing project files
    - Enable public access for authenticated users
    - Set file size limit to 50MB
    - Allow PDF, Word, and Excel file types
  
  2. Security
    - Add policies for authenticated users to upload files
    - Add policies for users to read their own project files
    - Add policies for users to delete their own project files
*/

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload files to their own project folders
CREATE POLICY "Users can upload project documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can read their own project files
CREATE POLICY "Users can read own project documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own project files
CREATE POLICY "Users can delete own project documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
  );
