import { Metadata } from "next";
import VolunteerLoginClient from "./page.client";

export const metadata: Metadata = {
  title: "Volunteer Login | Petster",
  description:
    "Access your volunteer account on Petster. Login and join our network of compassionate individuals dedicated to pet adoption and animal care.",
  keywords: [
    "Petster",
    "volunteer login",
    "volunteer connect",
    "pet adoption",
    "animal care",
    "login",
    "volunteer account",
  ].join(", "),
  openGraph: {
    title: "Volunteer Login | Petster",
    description:
      "Access your volunteer account on Petster. Login and join our network of compassionate individuals dedicated to pet adoption and animal care.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer Login | Petster",
    description:
      "Access your volunteer account on Petster. Login and join our network of compassionate individuals dedicated to pet adoption and animal care.",
  },
  alternates: {
    canonical: "/connect/volunteer",
  },
};

export default function VolunteerLoginPage() {
  return <VolunteerLoginClient />;
}
