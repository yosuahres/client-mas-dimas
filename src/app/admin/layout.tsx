import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AdminToaster } from "@/components/admin/admin-toaster";

import "./admin.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { template: "%s · Jogja Travel admin", default: "Jogja Travel admin" },
  robots: { index: false, follow: false },
};

// Every admin page reads the signed-in session, so none of it can be prerendered.
export const instant = false;

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-svh antialiased">
        {children}
        <AdminToaster />
      </body>
    </html>
  );
}
