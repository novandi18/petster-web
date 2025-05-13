import { getAllPetIds, getPetById } from "@/lib/firestore/petFirestore";
import { Metadata } from "next";
import PetClient from "./page.client";

type MetadataProps = Promise<{ id: string }>;

export async function generateStaticParams() {
  const ids = await getAllPetIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: MetadataProps;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPetById(id);
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

type PageProps = {
  params: PageParams;
};

type PageParams = Promise<{ id: string }>;

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  return <PetClient id={id} />;
}
