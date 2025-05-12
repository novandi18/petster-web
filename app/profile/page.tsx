import { Metadata } from "next";
import ProfileClient from "./page.client";

export const metadata: Metadata = {
  title: "Profile | Petster",
  description:
    "Manage your profile on Petster. Update your personal information, contact details, and settings. Connect with our community of volunteers and shelters.",
  keywords: [
    "Petster",
    "profile",
    "user profile",
    "update profile",
    "volunteer",
    "shelter",
    "contact details",
    "settings",
    "user management",
  ].join(", "),
  openGraph: {
    title: "Profile | Petster",
    description:
      "Manage your profile on Petster. Update your personal information, contact details, and settings. Connect with our community of volunteers and shelters.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@petster",
    creator: "@petster",
    title: "Profile | Petster",
    description:
      "Manage your profile on Petster. Update your personal information, contact details, and settings.",
  },
};

export default function Page() {
  return <ProfileClient />;
}
