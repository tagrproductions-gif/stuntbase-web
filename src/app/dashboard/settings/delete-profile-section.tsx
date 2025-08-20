'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, AlertTriangle } from 'lucide-react'
import { deleteProfileAction } from './actions'

interface DeleteProfileSectionProps {
  profile: any
}

export function DeleteProfileSection({ profile }: DeleteProfileSectionProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== 'DELETE' || !profile) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteProfileAction(profile.id)
      // Redirect to home page with success message
      router.push('/?deleted=true')
      router.refresh()
    } catch (err) {
      console.error('Delete profile error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!profile) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            No profile found to delete.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your StuntBase profile and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-destructive">This action cannot be undone</p>
              <p className="text-sm text-muted-foreground">
                Deleting your profile will permanently remove:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Your complete performer profile</li>
                <li>• All uploaded photos and resume</li>
                <li>• Skills and certifications data</li>
                <li>• Search visibility and contact information</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Your account will remain active for our email updates, and you can create a new profile anytime by signing up again.
              </p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will permanently delete your StuntBase profile for <strong>{profile.full_name}</strong> and remove all your data from our servers.
                </p>
                <p>
                  To confirm deletion, please type <strong>DELETE</strong> in the box below:
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setConfirmText('')
                  setError(null)
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete Profile'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
