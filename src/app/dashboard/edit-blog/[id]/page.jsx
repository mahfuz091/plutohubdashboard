"use client";

import { redirect, useParams } from "next/navigation";

export default function LegacyEditBlogPage() {
  const { id } = useParams();
  redirect(`/dashboard/blog/edit/${id}`);
}
