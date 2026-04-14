import { redirect } from "next/navigation";

export default function LegacyPreviewBlogPage() {
  redirect("/dashboard/blog/preview");
}
