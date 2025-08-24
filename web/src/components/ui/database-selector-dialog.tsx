"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { Database, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectDatabase {
  id: string
  project_name: string
  description: string | null
}

interface DatabaseSelectorDialogProps {
  selectedDatabase: string
  userProjects: ProjectDatabase[]
  onDatabaseChange: (databaseId: string) => void
}

const DatabaseSelectorDialog = AlertDialogPrimitive.Root

const DatabaseSelectorTrigger = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
DatabaseSelectorTrigger.displayName = "DatabaseSelectorTrigger"

const DatabaseSelectorOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
DatabaseSelectorOverlay.displayName = "DatabaseSelectorOverlay"

const DatabaseSelectorContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & DatabaseSelectorDialogProps
>(({ className, selectedDatabase, userProjects, onDatabaseChange, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <DatabaseSelectorOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-2 text-center sm:text-left">
        <AlertDialogPrimitive.Title className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Select Database
        </AlertDialogPrimitive.Title>
        <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
          Choose which database to search from
        </AlertDialogPrimitive.Description>
      </div>

      <div className="space-y-2">
        <AlertDialogPrimitive.Action asChild>
          <button
            onClick={() => onDatabaseChange('global')}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
              selectedDatabase === 'global' 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card hover:bg-accent"
            )}
          >
            <div>
              <div className="font-medium">Entire Database</div>
              <div className="text-sm text-muted-foreground">Search all performers</div>
            </div>
            {selectedDatabase === 'global' && <Check className="w-4 h-4" />}
          </button>
        </AlertDialogPrimitive.Action>

        {userProjects.map((project) => (
          <AlertDialogPrimitive.Action asChild key={project.id}>
            <button
              onClick={() => onDatabaseChange(project.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                selectedDatabase === project.id 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-card hover:bg-accent"
              )}
            >
              <div>
                <div className="font-medium">{project.project_name}</div>
                <div className="text-sm text-muted-foreground">Search project submissions</div>
              </div>
              {selectedDatabase === project.id && <Check className="w-4 h-4" />}
            </button>
          </AlertDialogPrimitive.Action>
        ))}
      </div>

      <div className="flex justify-end">
        <AlertDialogPrimitive.Cancel asChild>
          <Button variant="outline">Close</Button>
        </AlertDialogPrimitive.Cancel>
      </div>
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
))
DatabaseSelectorContent.displayName = "DatabaseSelectorContent"

export {
  DatabaseSelectorDialog,
  DatabaseSelectorTrigger,
  DatabaseSelectorContent,
}
