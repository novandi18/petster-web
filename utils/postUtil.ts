type FirestoreTimestamp = {
  seconds: number;
  nanoseconds?: number;
};

type TimestampInput =
  | FirestoreTimestamp
  | Date
  | string
  | number
  | null
  | undefined;

export const formatDate = (timestamp: TimestampInput): string => {
  if (!timestamp) return "";

  let date: Date;

  if (typeof timestamp === "object" && "seconds" in timestamp) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    try {
      date = new Date(timestamp as string | number);
    } catch {
      return "Unknown date";
    }
  }

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRupiah = (numStr: string) =>
  numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function transformIbbUrl(url: string): string {
  const oldPrefix = "https://i.ibb.co/";
  const newPrefix = "https://i.ibb.co.com/";
  if (url.startsWith(oldPrefix)) {
    return url.replace(oldPrefix, newPrefix);
  }
  return url;
}
