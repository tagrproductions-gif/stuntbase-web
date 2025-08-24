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
import { deleteCoordinatorAction } from './actions'

interface DeleteCoordinatorSectionProps {
  coordinator: any
}

export function DeleteCoordinatorSection({ coordinator }: DeleteCoordinatorSectionProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== 'DELETE' || !coordinator) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteCoordinatorAction(coordinator.id)
      // Redirect to home page with success message
      router.push('/?deleted=true')
      router.refresh()
    } catch (err) {
      console.error('Delete coordinator error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete coordinator profile')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!coordinator) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            No coordinator profile found to delete.
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
          Permanently delete your StuntPitch coordinator profile and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-destructive">This action cannot be undone</p>
              <p className="text-sm text-muted-foreground">
                Deleting your coordinator profile will permanently remove:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Your coordinator profile and photo</li>
                <li>• All project databases you've created</li>
                <li>• All performer submissions to your projects</li>
                <li>• Project management access and data</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Your account will remain active for our email updates, and you can create a new coordinator profile anytime by signing up again.
              </p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Coordinator Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Profile Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will permanently delete your coordinator profile, all project databases, 
                  and all associated data. This action cannot be undone.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Type <strong>DELETE</strong> to confirm:
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="font-mono"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
