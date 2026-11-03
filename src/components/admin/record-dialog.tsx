"use client";

import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type RecordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
  submitLabel?: string;
  children: ReactNode;
};

// Add/edit form in a dialog, like the CRM's record dialogs: header, scrolling fields, Cancel and Save.
export function RecordDialog({ open, onOpenChange, title, description, onSubmit, pending, submitLabel = "Save", children }: RecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="grid gap-4 p-6">{children}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
