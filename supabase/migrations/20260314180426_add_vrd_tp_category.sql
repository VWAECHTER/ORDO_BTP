/*
  # Add vrd-tp to projects category constraint

  ## Changes
  - Drops the existing category check constraint on the projects table
  - Adds a new constraint that includes 'vrd-tp' alongside existing categories
  
  ## Modified Tables
  - `projects`: category column now accepts 'gros-oeuvre', 'genie-civil', 'ouvrages-art', 'vrd-tp'
*/

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects ADD CONSTRAINT projects_category_check
  CHECK (category = ANY (ARRAY['gros-oeuvre'::text, 'genie-civil'::text, 'ouvrages-art'::text, 'vrd-tp'::text]));
