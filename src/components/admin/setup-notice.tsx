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
          jogja travel
        </p>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6 text-sm">
            <div>
              <h1 className="text-xl font-semibold">Hubungkan database</h1>
              <p className="mt-1 text-muted-foreground">
                Panel admin menyimpan kontennya di Supabase. Selama belum terhubung, website menampilkan konten awalnya.
              </p>
            </div>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Buat project Supabase, lalu jalankan <code className="rounded bg-muted px-1">supabase/migrations/*.sql</code>{" "}
                dan <code className="rounded bg-muted px-1">supabase/seed.sql</code> di SQL editor-nya.
              </li>
              <li>
                Salin <code className="rounded bg-muted px-1">.env.example</code> menjadi{" "}
                <code className="rounded bg-muted px-1">.env.local</code> dan isi nilai-nilai Supabase.
              </li>
              <li>Jalankan ulang server dan buka /admin lagi.</li>
            </ol>
            <p className="text-muted-foreground">
              Langkah lengkap, termasuk membuat akun admin pertama, ada di <code className="rounded bg-muted px-1">docs/admin.md</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
