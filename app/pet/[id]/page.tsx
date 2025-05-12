import { getPetById } from "@/lib/firestore/petFirestore";
import { Metadata } from "next";
import PetClient from "./page.client";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const result = await getPetById(params.id);
  const pet = result.status === "success" ? result.data.pet : null;
  const name = pet?.name ?? "Pet";

  return {
    title: `${name} | Petster`,
    description: `Discover details about ${name}, a ${pet?.breed ?? "pet"} listed on Petster. Learn about its age, breed, adoption fee, and more.`,
    keywords: ["Petster", name, pet?.breed, pet?.category]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: `${name} | Petster`,
      description: `Explore ${name}'s profile: age ${pet?.age ?? ""}, breed ${pet?.breed ?? ""}.`,
      siteName: "Petster",
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@petster",
      creator: "@petster",
      title: `${name} | Petster`,
      description: `Learn more about ${name}, a ${pet?.breed ?? "pet"} up for adoption.`,
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  return <PetClient id={params.id} />;
}
