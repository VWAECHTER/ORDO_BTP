/*
  # Update Project Analysis Structure

  1. Changes
    - Add `metadata` column to store AO metadata (objet, maitrise_oeuvre, montant, delais)
    - Add `dce_map` column to store DCE document map (list of pieces with 1-line descriptions)
    - Add `strategic_analysis` column to store the 5 pillars analysis
    - Add `blocking_questions` column to store questions bloquantes
    - Update structure to enforce ordered display: metadata + dce_map first, then analysis + questions

  2. Notes
    - Existing `critical_points` column is replaced by more structured analysis
    - All columns use jsonb for flexibility
    - Data must be displayed in order: A) metadata, B) dce_map, C) strategic_analysis, D) blocking_questions
*/

-- Add new columns to project_analysis table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_analysis' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE project_analysis ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_analysis' AND column_name = 'dce_map'
  ) THEN
    ALTER TABLE project_analysis ADD COLUMN dce_map jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_analysis' AND column_name = 'strategic_analysis'
  ) THEN
    ALTER TABLE project_analysis ADD COLUMN strategic_analysis jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_analysis' AND column_name = 'blocking_questions'
  ) THEN
    ALTER TABLE project_analysis ADD COLUMN blocking_questions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
