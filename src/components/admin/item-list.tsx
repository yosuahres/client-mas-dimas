"use client";

import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Ellipsis, Pencil, Trash2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { deleteItem, reorder, setPublished, type ListName } from "@/app/admin/(panel)/list-actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/lib/admin/action-result";
import { cn } from "@/lib/utils";

export type ListItem = {
  key: string;
  /** Shown in the delete confirmation. */
  label: string;
  content: ReactNode;
  published?: boolean;
  /** Edit page; otherwise onEdit is called. */
  href?: string;
};

type ItemListProps = {
  list: ListName;
  items: ListItem[];
  emptyText: string;
  onEdit?: (key: string) => void;
  /** e.g. "Reviews of this package stay, without the package name." */
  deleteNote?: string;
};

function report(result: ActionResult) {
  if (result.ok) toast.success(result.message ?? "Saved.");
  else toast.error(result.error);
}

// A bordered list in the CRM's panel style. Order, visibility and deletes save straight away.
// Tapping a row edits it. On phones the small arrow, edit and delete buttons give way to one "more" button that opens
// a bottom sheet with thumb-sized actions.
export function ItemList({ list, items, emptyText, onEdit, deleteNote }: ItemListProps) {
  const [, startTransition] = useTransition();
  const [optimisticItems, applyOptimistic] = useOptimistic(items);
  const [toDelete, setToDelete] = useState<ListItem | null>(null);
  // Kept by key so the sheet follows the item as it moves.
  const [actionsKey, setActionsKey] = useState<string | null>(null);
  const actionsIndex = optimisticItems.findIndex((item) => item.key === actionsKey);
  const actionsItem = actionsIndex === -1 ? null : optimisticItems[actionsIndex];

  function moveTo(index: number, target: number) {
    if (target < 0 || target >= optimisticItems.length || target === index) return;
    const next = [...optimisticItems];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    startTransition(async () => {
      applyOptimistic(next);
      report(await reorder(list, next.map((item) => item.key)));
    });
  }

  function togglePublished(item: ListItem, published: boolean) {
    startTransition(async () => {
      applyOptimistic(optimisticItems.map((candidate) => (candidate.key === item.key ? { ...candidate, published } : candidate)));
      report(await setPublished(list, item.key, published));
    });
  }

  function remove(item: ListItem) {
    startTransition(async () => {
      applyOptimistic(optimisticItems.filter((candidate) => candidate.key !== item.key));
      report(await deleteItem(list, item.key));
    });
  }

  const canEdit = (item: ListItem) => Boolean(item.href || onEdit);

  if (optimisticItems.length === 0) {
    return <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <>
      <ul className="overflow-hidden rounded-xl border">
        {optimisticItems.map((item, index) => (
          <li key={item.key} className="flex items-center gap-1 border-b py-1 pr-1 pl-3 last:border-b-0 sm:gap-3 sm:px-3 sm:py-0.5">
            <div className="hidden shrink-0 flex-col sm:flex">
              <button
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => moveTo(index, index - 1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === optimisticItems.length - 1}
                onClick={() => moveTo(index, index + 1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              {item.href ? (
                <Link href={item.href} className="block rounded-md py-1.5 hover:text-primary">
                  {item.content}
                </Link>
              ) : onEdit ? (
                <button type="button" onClick={() => onEdit(item.key)} className="block w-full rounded-md py-1.5 text-left">
                  {item.content}
                </button>
              ) : (
                <div className="py-1.5">{item.content}</div>
              )}
            </div>

            {item.published !== undefined ? (
              <label className="flex shrink-0 items-center gap-2 px-2 sm:px-0">
                <span className="hidden text-xs text-muted-foreground sm:inline">{item.published ? "Shown" : "Hidden"}</span>
                <Switch
                  checked={item.published}
                  onCheckedChange={(checked) => togglePublished(item, checked)}
                  aria-label={`Show ${item.label} on the website`}
                />
              </label>
            ) : null}

            <div className="hidden shrink-0 items-center sm:flex">
              {item.href ? (
                <Button asChild variant="ghost" size="icon" className="size-8" aria-label={`Edit ${item.label}`}>
                  <Link href={item.href}>
                    <Pencil />
                  </Link>
                </Button>
              ) : onEdit ? (
                <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${item.label}`} onClick={() => onEdit(item.key)}>
                  <Pencil />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${item.label}`}
                onClick={() => setToDelete(item)}
              >
                <Trash2 />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground sm:hidden"
              aria-label={`More for ${item.label}`}
              onClick={() => setActionsKey(item.key)}
            >
              <Ellipsis />
            </Button>
          </li>
        ))}
      </ul>

      <Sheet
        open={actionsItem !== null}
        onOpenChange={(open) => {
          if (!open) setActionsKey(null);
        }}
      >
        <SheetContent side="bottom" className="gap-0 rounded-t-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgb(0_0_0/0.12)]">
          {actionsItem ? (
            <>
              <SheetHeader className="border-b pr-12">
                <SheetTitle className="truncate text-sm">{actionsItem.label}</SheetTitle>
                <SheetDescription className="text-xs">
                  Number {actionsIndex + 1} of {optimisticItems.length} on the list
                </SheetDescription>
              </SheetHeader>
              <div className="grid py-1">
                {canEdit(actionsItem) ? (
                  actionsItem.href ? (
                    <SheetRow icon={Pencil} label="Edit" href={actionsItem.href} />
                  ) : (
                    <SheetRow
                      icon={Pencil}
                      label="Edit"
                      onClick={() => {
                        setActionsKey(null);
                        onEdit?.(actionsItem.key);
                      }}
                    />
                  )
                ) : null}
                {/* The sheet stays open while moving, so the item can be nudged several places in a row. */}
                <SheetRow icon={ArrowUp} label="Move up" disabled={actionsIndex === 0} onClick={() => moveTo(actionsIndex, actionsIndex - 1)} />
                <SheetRow
                  icon={ArrowDown}
                  label="Move down"
                  disabled={actionsIndex === optimisticItems.length - 1}
                  onClick={() => moveTo(actionsIndex, actionsIndex + 1)}
                />
                <SheetRow icon={ArrowUpToLine} label="Move to the top" disabled={actionsIndex === 0} onClick={() => moveTo(actionsIndex, 0)} />
                <SheetRow
                  icon={ArrowDownToLine}
                  label="Move to the bottom"
                  disabled={actionsIndex === optimisticItems.length - 1}
                  onClick={() => moveTo(actionsIndex, optimisticItems.length - 1)}
                />
                <SheetRow
                  icon={Trash2}
                  label="Delete"
                  destructive
                  onClick={() => {
                    setActionsKey(null);
                    setToDelete(actionsItem);
                  }}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDelete
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title={`Delete "${toDelete?.label ?? ""}"?`}
        description={`This removes it from the website and can't be undone.${deleteNote ? ` ${deleteNote}` : ""}`}
        onConfirm={() => {
          if (toDelete) remove(toDelete);
          setToDelete(null);
        }}
      />
    </>
  );
}

type SheetRowProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

function SheetRow({ icon: Icon, label, href, onClick, disabled, destructive }: SheetRowProps) {
  const className = cn(
    "flex h-12 items-center gap-3 px-4 text-left text-sm font-medium active:bg-accent disabled:opacity-35",
    destructive && "text-destructive",
  );
  const body = (
    <>
      <Icon className={cn("size-4", destructive ? "text-destructive" : "text-muted-foreground")} />
      {label}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {body}
    </button>
  );
}
