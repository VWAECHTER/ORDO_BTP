/*
  # Create meeting recordings table

  ## Overview
  This migration creates the `meeting_recordings` table to store meeting audio recordings,
  their transcriptions, and generated meeting reports. It supports the full workflow from
  recording to PDF generation.

  ## New Tables
  - `meeting_recordings`
    - `id` (uuid, primary key) - Unique identifier for each recording
    - `user_id` (uuid, required) - Reference to the user who created the recording
    - `title` (text, required) - Title/name of the meeting
    - `audio_url` (text, nullable) - URL to the stored audio file in Supabase Storage
    - `audio_duration` (integer, nullable) - Duration of the recording in seconds
    - `transcript` (text, nullable) - Full transcription of the meeting
    - `summary` (text, nullable) - AI-generated meeting summary/compte-rendu
    - `pdf_url` (text, nullable) - URL to the generated PDF report
    - `status` (text, required) - Processing status: recording, processing, completed, error
    - `created_at` (timestamptz) - Timestamp of recording creation
    - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  - Enable RLS on `meeting_recordings` table
  - Add policy for users to view only their own recordings
  - Add policy for users to insert their own recordings
  - Add policy for users to update their own recordings
  - Add policy for users to delete their own recordings

  ## Indexes
  - Index on `user_id` for efficient user-specific queries
  - Index on `created_at` for date-based sorting
  - Index on `status` for filtering by processing status
*/

CREATE TABLE IF NOT EXISTS meeting_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nouvelle réunion',
  audio_url text,
  audio_duration integer,
  transcript text,
  summary text,
  pdf_url text,
  status text NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'completed', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meeting recordings"
  ON meeting_recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meeting recordings"
  ON meeting_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meeting recordings"
  ON meeting_recordings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meeting recordings"
  ON meeting_recordings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_recordings_user_id 
  ON meeting_recordings(user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_recordings_created_at 
  ON meeting_recordings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meeting_recordings_status 
  ON meeting_recordings(status);

CREATE OR REPLACE FUNCTION update_meeting_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_recordings_updated_at
  BEFORE UPDATE ON meeting_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_recordings_updated_at();
