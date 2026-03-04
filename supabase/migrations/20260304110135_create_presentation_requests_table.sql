/*
  # Create presentation requests table

  ## Overview
  This migration creates the `presentation_requests` table to store incoming demo requests
  from the ORDO BTP landing page. It captures prospect information and their specific needs.

  ## New Tables
  - `presentation_requests`
    - `id` (uuid, primary key) - Unique identifier for each request
    - `email` (text, required) - Prospect's email address
    - `first_name` (text, nullable) - Prospect's first name (optional field)
    - `company_name` (text, required) - Name of the prospect's company
    - `structure_type` (text, required) - Type of company structure (TPE, PME, BE, Autre)
    - `use_cases` (text array, required) - Selected use cases/contexts
    - `context` (text, nullable) - Additional context or expectations provided by prospect
    - `created_at` (timestamptz) - Timestamp of request submission

  ## Security
  - Enable RLS on `presentation_requests` table
  - Add policy for public insert (anonymous users can submit requests)
  - Add policy for authenticated users to view all requests (for admin review)

  ## Indexes
  - Index on `created_at` for efficient date-based queries
  - Index on `email` for duplicate checking
*/

CREATE TABLE IF NOT EXISTS presentation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  company_name text NOT NULL,
  structure_type text NOT NULL CHECK (structure_type IN ('tpe', 'pme', 'bureau_etudes', 'autre')),
  use_cases text[] NOT NULL DEFAULT '{}',
  context text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE presentation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on presentation_requests"
  ON presentation_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view presentation_requests"
  ON presentation_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_presentation_requests_created_at 
  ON presentation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_presentation_requests_email 
  ON presentation_requests(email);
