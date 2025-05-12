import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Petster",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-4 text-black dark:bg-black dark:text-white">
      <Image
        src="/images/404.png"
        alt="404 Not Found"
        width={200}
        height={200}
        className="mb-6 object-contain opacity-75"
      />
      <h1 className="mb-2 text-4xl font-bold">Page Not Found</h1>
      <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link href="/">
        <div className="bg-lime-green hover:bg-lime-green/90 rounded-md px-5 py-2 text-black">
          Go Back Home
        </div>
      </Link>
    </div>
  );
}
