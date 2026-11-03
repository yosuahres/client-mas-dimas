import { LogoMark } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";

// Shown at /admin until the Supabase environment variables are set. The public site keeps working meanwhile,
// on the content it launched with.
export function SetupNotice() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <p className="flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.02em]">
          <LogoMark className="size-6 text-brand" />
          jogja transport
        </p>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6 text-sm">
            <div>
              <h1 className="text-xl font-semibold">Connect the database</h1>
              <p className="mt-1 text-muted-foreground">
                The admin panel stores its content in Supabase. Until it&apos;s connected, the website shows the content it
                launched with.
              </p>
            </div>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Create a Supabase project, then run <code className="rounded bg-muted px-1">supabase/migrations/*.sql</code>{" "}
                and <code className="rounded bg-muted px-1">supabase/seed.sql</code> in its SQL editor.
              </li>
              <li>
                Copy <code className="rounded bg-muted px-1">.env.example</code> to{" "}
                <code className="rounded bg-muted px-1">.env.local</code> and fill in the Supabase and R2 values.
              </li>
              <li>Restart the server and come back to /admin.</li>
            </ol>
            <p className="text-muted-foreground">
              Full steps, including creating the first admin account, are in <code className="rounded bg-muted px-1">docs/admin.md</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
