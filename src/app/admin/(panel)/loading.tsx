import { PageBody } from "@/components/admin/page-header";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Shown the moment an admin link is clicked, inside the sidebar layout, while the page's data loads.
export default function AdminPageLoading() {
  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Skeleton className="h-4 w-36" />
      </div>
      <PageBody>
        <Skeleton className="mb-4 h-4 w-72 max-w-full" />
        <div className="space-y-2" aria-busy="true" aria-label="Loading">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </PageBody>
    </>
  );
}
