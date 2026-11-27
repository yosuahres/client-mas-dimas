import { KeyRound, SlidersHorizontal, Users } from "lucide-react";
import type { ElementType } from "react";

export type SettingsPage = {
  href: string;
  title: string;
  icon: ElementType;
};

export type SettingsGroup = {
  title: string;
  pages: SettingsPage[];
};

/** Where the "Settings" link in the main sidebar lands. */
export const SETTINGS_HOME = "/admin/settings/account";

/** sessionStorage key for the last page visited outside settings, so "Back to admin" returns there. */
export const LAST_PANEL_PATH_KEY = "lastAdminPath";

// The settings area's own sidebar, and the heading of each of its pages.
export const settingsGroups: SettingsGroup[] = [
  {
    title: "Akun saya",
    pages: [
      {
        href: "/admin/settings/account",
        title: "Akun",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Website",
    pages: [
      {
        href: "/admin/settings/business",
        title: "Data usaha",
        icon: SlidersHorizontal,
      },
      {
        href: "/admin/settings/users",
        title: "Pengguna admin",
        icon: Users,
      },
    ],
  },
];

export const settingsPages = settingsGroups.flatMap((group) => group.pages);
