import { Skeleton } from "@/components/ui/skeleton";

// Shown under the page's heading, inside the settings layout, while the page's data loads.
export default function SettingsPageLoading() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
