import PostDetailClient from "./page.client";
import { Metadata } from "next";
import { getPostById } from "@/lib/firestore/communityFirestore";

type MetadataProps = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: MetadataProps;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPostById(id);
  const post = result.status === "success" ? result.data : null;
  const authorName = post?.posts?.author?.data.name || "User";
  const title = post ? `${authorName}'s Post` : "Community Post";
  const description =
    post?.posts?.content?.replace(/\r?\n|\r/g, " ").slice(0, 160) ?? "";

  return {
    title: `${title} | Petster`,
    description,
    keywords: ["Petster", "Community", authorName].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `https://petster.com/community/${id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type PageProps = {
  params: PageParams;
};

type PageParams = Promise<{ id: string }>;

export default async function Page(props: PageProps) {
  const { id } = await props.params;
  return <PostDetailClient id={id} />;
}
