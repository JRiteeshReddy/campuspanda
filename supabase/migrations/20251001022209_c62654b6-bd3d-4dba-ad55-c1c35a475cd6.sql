-- Drop the existing foreign key constraint on notes table
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_subject_id_fkey;

-- Add the foreign key constraint back with CASCADE delete
ALTER TABLE notes 
ADD CONSTRAINT notes_subject_id_fkey 
FOREIGN KEY (subject_id) 
REFERENCES subjects(id) 
ON DELETE CASCADE;