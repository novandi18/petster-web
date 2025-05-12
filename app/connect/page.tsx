import { Metadata } from "next";
import ConnectClient from "./page.client";

export const metadata: Metadata = {
  title: "Account Connect | Petster",
  description:
    "Choose how you'd like to connect with our pet adoption community. Connect as a shelter or volunteer to join our network.",
  keywords: [
    "Petster",
    "connect",
    "account connect",
    "shelter connect",
    "volunteer connect",
    "pet adoption",
    "community",
    "login",
    "register",
  ].join(", "),
  openGraph: {
    title: "Account Connect | Petster",
    description:
      "Choose how you'd like to connect with our pet adoption community. Connect as a shelter or volunteer to join our network.",
    siteName: "Petster",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Connect | Petster",
    description:
      "Choose how you'd like to connect with our pet adoption community. Connect as a shelter or volunteer to join our network.",
  },
  alternates: {
    canonical: "/connect",
  },
};

export default function ConnectPage() {
  return <ConnectClient />;
}
