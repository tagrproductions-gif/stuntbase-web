# Orphan Data Prevention in Project Database Management

## Overview
This document outlines how orphaned data is prevented when deleting project databases in the stunt casting platform.

## Database Schema Protection

### Foreign Key Constraints with CASCADE DELETE
The database schema includes proper foreign key relationships with CASCADE DELETE to ensure data integrity:

```sql
-- project_submissions table references project_databases
project_id UUID NOT NULL REFERENCES project_databases(id) ON DELETE CASCADE
```

### What happens when a project is deleted:

1. **Project Database Record**: The main project record is deleted from `project_databases` table
2. **Submission Records**: All related records in `project_submissions` are automatically deleted due to `ON DELETE CASCADE`
3. **Profile Integrity**: Profile records remain intact (only the submission relationships are removed)

## API Implementation

### Delete Endpoint: `/api/projects/[id]`
- **Authorization**: Only the project creator can delete their projects
- **Verification**: Confirms project ownership before deletion
- **Single Operation**: Uses standard Supabase delete operation, relying on database constraints for cascade

### Security Measures
1. **User Authentication**: Validates that the requesting user is authenticated
2. **Ownership Verification**: Ensures only the project creator can delete the project
3. **Project Validation**: Confirms the project exists before attempting deletion

## UI Protection

### ProjectDatabasesWidget Component
- **Confirmation Dialog**: Requires explicit user confirmation before deletion
- **Clear Warning**: Shows exactly what will be deleted (project + submissions count)
- **Loading States**: Prevents multiple deletion attempts during processing
- **Error Handling**: Displays clear error messages if deletion fails

### What Users See Before Deletion:
```
Are you sure you want to delete "Project Name"?

This action will permanently delete:
• The project database
• All X submissions  
• All associated data

This action cannot be undone.
```

## Data Flow Summary

```
User clicks Delete → 
Confirmation Dialog → 
API Call to DELETE /api/projects/[id] → 
Verify User Ownership → 
Delete from project_databases → 
CASCADE DELETE removes all project_submissions → 
Success Response → 
UI Updates
```

## Testing Orphan Prevention

To verify no orphaned data remains after project deletion:

1. Create a test project database
2. Add some submissions to it
3. Delete the project via the UI
4. Query the database to confirm:
   - Project record is removed from `project_databases`
   - All submission records are removed from `project_submissions`
   - Profile records remain intact

## Benefits

1. **Data Integrity**: No orphaned submission records
2. **Performance**: No need for manual cleanup operations
3. **Reliability**: Database-level constraints ensure consistency even if application code fails
4. **User Experience**: Clear feedback about what will be deleted

## Conclusion

The combination of database-level CASCADE DELETE constraints and application-level authorization ensures that:
- No orphaned data is left in the system
- Only authorized users can delete projects
- Users understand the consequences of deletion
- The operation is atomic and reliable
