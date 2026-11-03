"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { deleteItem, reorder, setPublished, type ListName } from "@/app/admin/(panel)/list-actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ActionResult } from "@/lib/admin/action-result";

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
export function ItemList({ list, items, emptyText, onEdit, deleteNote }: ItemListProps) {
  const [, startTransition] = useTransition();
  const [optimisticItems, applyOptimistic] = useOptimistic(items);
  const [toDelete, setToDelete] = useState<ListItem | null>(null);

  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= optimisticItems.length) return;
    const next = [...optimisticItems];
    [next[index], next[target]] = [next[target], next[index]];
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

  if (optimisticItems.length === 0) {
    return <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <>
      <ul className="overflow-hidden rounded-xl border">
        {optimisticItems.map((item, index) => (
          <li key={item.key} className="flex items-center gap-2 border-b px-2 py-2 last:border-b-0 sm:gap-3 sm:px-3">
            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === optimisticItems.length - 1}
                onClick={() => move(index, 1)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              {item.href ? (
                <Link href={item.href} className="block rounded-md hover:text-primary">
                  {item.content}
                </Link>
              ) : (
                item.content
              )}
            </div>

            {item.published !== undefined ? (
              <label className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">{item.published ? "Shown" : "Hidden"}</span>
                <Switch
                  checked={item.published}
                  onCheckedChange={(checked) => togglePublished(item, checked)}
                  aria-label={`Show ${item.label} on the website`}
                />
              </label>
            ) : null}

            {item.href ? (
              <Button asChild variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Edit ${item.label}`}>
                <Link href={item.href}>
                  <Pencil />
                </Link>
              </Button>
            ) : onEdit ? (
              <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Edit ${item.label}`} onClick={() => onEdit(item.key)}>
                <Pencil />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${item.label}`}
              onClick={() => setToDelete(item)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

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
