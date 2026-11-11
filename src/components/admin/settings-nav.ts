import { KeyRound, SlidersHorizontal, Users } from "lucide-react";
import type { ElementType } from "react";

export type SettingsPage = {
  href: string;
  title: string;
  /** The line under the page's heading. */
  description: string;
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
    title: "My account",
    pages: [
      {
        href: "/admin/settings/account",
        title: "Account",
        description: "Your sign-in email and password.",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Website",
    pages: [
      {
        href: "/admin/settings/business",
        title: "Business details",
        description: "Contact details, links and the exchange rate used across the website.",
        icon: SlidersHorizontal,
      },
      {
        href: "/admin/settings/users",
        title: "Admin users",
        description: "Everyone who can sign in to this admin panel.",
        icon: Users,
      },
    ],
  },
];

export const settingsPages = settingsGroups.flatMap((group) => group.pages);
