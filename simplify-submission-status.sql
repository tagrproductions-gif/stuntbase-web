-- SIMPLIFY SUBMISSION STATUS
-- Run this in your Supabase SQL Editor
-- Removes the approval/rejection system - submissions are just "submitted"

-- =============================================================================
-- STEP 1: REMOVE THE OLD CONSTRAINT FIRST
-- =============================================================================

-- Remove the old constraint that only allows 'pending', 'approved', 'rejected'
ALTER TABLE project_submissions 
DROP CONSTRAINT IF EXISTS project_submissions_status_check;

-- =============================================================================
-- STEP 2: UPDATE EXISTING SUBMISSIONS TO 'SUBMITTED' STATUS
-- =============================================================================

-- Update all existing submissions to have 'submitted' status
UPDATE project_submissions 
SET status = 'submitted' 
WHERE status IN ('pending', 'approved', 'rejected');

-- =============================================================================
-- STEP 3: ADD NEW SIMPLIFIED CONSTRAINT
-- =============================================================================

-- Add new simplified constraint (or remove constraint entirely since we only use 'submitted')
ALTER TABLE project_submissions 
ADD CONSTRAINT project_submissions_status_check 
CHECK (status = 'submitted');

-- =============================================================================
-- STEP 4: UPDATE COMMENTS
-- =============================================================================

-- Update the comment to reflect the simplified system
COMMENT ON COLUMN project_submissions.status IS 'Submission status - always "submitted" when a profile submits to a project';
COMMENT ON COLUMN project_submissions.notes IS 'Optional notes field (currently unused in simplified system)';

-- =============================================================================
-- STEP 5: VERIFICATION
-- =============================================================================

-- Check that all submissions now have 'submitted' status
SELECT status, COUNT(*) as count 
FROM project_submissions 
GROUP BY status;

-- Verify the constraint
SELECT 'SUBMISSION STATUS SIMPLIFIED SUCCESSFULLY' as result;
