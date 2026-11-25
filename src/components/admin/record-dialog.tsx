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

// On phones the dialog fills the screen like an app page: it can't hide behind the keyboard, and the title and
// Cancel/Save stay pinned while the fields scroll between them.
const phoneScreen =
  "max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:shadow-none max-sm:slide-in-from-left-0 max-sm:slide-in-from-top-0 max-sm:slide-out-to-left-0 max-sm:slide-out-to-top-0";
const phoneFrame = "max-sm:min-h-full max-sm:w-full max-sm:max-w-none max-sm:overflow-visible max-sm:rounded-none max-sm:border-0";

// Add/edit form in a dialog, like the CRM's record dialogs: header, scrolling fields, Cancel and Save.
export function RecordDialog({ open, onOpenChange, title, description, onSubmit, pending, submitLabel = "Simpan", children }: RecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${phoneFrame}`} positionClassName={phoneScreen}>
        <form onSubmit={onSubmit} noValidate className="flex flex-col">
          <DialogHeader className="z-10 bg-background p-4 pr-12 max-sm:sticky max-sm:top-0 sm:p-6">
            <DialogTitle className="leading-snug">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div className="grid flex-1 content-start gap-4 p-4 sm:p-6">{children}</div>
          <DialogFooter className="z-10 flex-row bg-background p-4 max-sm:sticky max-sm:bottom-0 sm:p-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1 sm:flex-none">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
              {pending ? "Menyimpan…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
