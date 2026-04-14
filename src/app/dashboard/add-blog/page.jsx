import { redirect } from "next/navigation";

export default function LegacyAddBlogPage() {
  redirect("/dashboard/blog/add");
}
