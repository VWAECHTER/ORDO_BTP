/*
  # Create Appel d'Offres Tables

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `category` (text) - Type of project: gros-oeuvre, genie-civil, ouvrages-art
      - `name` (text) - Project name
      - `description` (text) - Project description
      - `status` (text) - Status: draft, analyzing, completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `project_documents`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `file_name` (text) - Original file name
      - `file_type` (text) - File MIME type
      - `file_size` (integer) - File size in bytes
      - `storage_path` (text) - Path in Supabase storage
      - `uploaded_at` (timestamptz)

    - `project_analysis`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `critical_points` (jsonb) - Array of critical points identified
      - `analysis_status` (text) - Status: pending, completed, failed
      - `created_at` (timestamptz)

    - `technical_memos`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `content` (text) - Generated memo content
      - `version` (integer) - Version number
      - `created_at` (timestamptz)

    - `memo_conversations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `message` (text) - Message content
      - `role` (text) - user or assistant
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own projects
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('gros-oeuvre', 'genie-civil', 'ouvrages-art')),
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create project_analysis table
CREATE TABLE IF NOT EXISTS project_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  critical_points jsonb DEFAULT '[]'::jsonb,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create technical_memos table
CREATE TABLE IF NOT EXISTS technical_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create memo_conversations table
CREATE TABLE IF NOT EXISTS memo_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memo_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for projects table
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for project_documents table
CREATE POLICY "Users can view documents of own projects"
  ON project_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to own projects"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents from own projects"
  ON project_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policies for project_analysis table
CREATE POLICY "Users can view analysis of own projects"
  ON project_analysis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_analysis.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analysis for own projects"
  ON project_analysis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_analysis.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analysis of own projects"
  ON project_analysis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_analysis.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_analysis.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policies for technical_memos table
CREATE POLICY "Users can view memos of own projects"
  ON technical_memos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = technical_memos.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create memos for own projects"
  ON technical_memos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = technical_memos.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policies for memo_conversations table
CREATE POLICY "Users can view conversations of own projects"
  ON memo_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memo_conversations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own project conversations"
  ON memo_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memo_conversations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analysis_project_id ON project_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_technical_memos_project_id ON technical_memos(project_id);
CREATE INDEX IF NOT EXISTS idx_memo_conversations_project_id ON memo_conversations(project_id);
