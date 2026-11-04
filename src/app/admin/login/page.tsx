import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { LoginForm } from "@/app/admin/login/login-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { LogoMark } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { isAdmin } from "@/lib/admin/session";
import { createSessionClient } from "@/lib/supabase/clients";
import { supabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

const notices: Record<string, string> = {
  "not-admin": "This account isn't an admin. Ask the site owner to give you access.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  await connection();
  if (!supabaseConfig()) return <SetupNotice />;

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && isAdmin(user)) redirect("/admin");

  const { error } = await searchParams;
  const notice = typeof error === "string" ? notices[error] : undefined;

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <p className="flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.02em]">
          <LogoMark className="size-6 text-brand" />
          jogja travel
        </p>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="mb-2 text-center">
              <h1 className="text-xl font-semibold">Sign in to the admin panel</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage tours, prices, reviews and the website text.</p>
            </div>
            <LoginForm notice={notice} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
