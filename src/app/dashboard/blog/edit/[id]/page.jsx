"use client";

import { getPostById } from "@/app/actions/blog/blog.actions";
import EditBlog from "@/components/EditBlog/EditBlog";
import { BlogContext } from "@/context/BlogContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { ChevronLeft, MagicWand, ShieldCheck } from "lucide-react";

export default function EditBlogPage() {
  const { id } = useParams();
  const { blogData, setBlogData } = useContext(BlogContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      const result = await getPostById(id);
      if (result.success) {
        setBlogData(result.post);
      } else {
        alert(result.msg);
      }
      setLoading(false);
    };

    if (blogData?.id === id) {
      setLoading(false);
      return;
    }

    fetchBlog();
  }, [id, setBlogData, blogData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_26%),radial-gradient(circle_at_top_right,#fde68a_0%,transparent_22%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
          <div className="pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />
          <div className="pointer-events-none absolute right-8 top-[-20px] h-28 w-28 rounded-full bg-emerald-100 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_280px] lg:items-center">
            <div>
              <Link
                href="/dashboard/blog"
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to all blogs
              </Link>
              <div className="flex items-center gap-4">
                <div className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Edit flow
                </div>
                <div className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Draft mode
                </div>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Fine-tune every blog detail before publishing.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Update the title, banner, SEO metadata, and article content
                inside the same polished workspace used to create new posts.
              </p>
            </div>

            <div className="hidden rounded-[30px] border border-slate-200 bg-slate-50 p-5 text-slate-700 shadow-[0_15px_35px_rgba(15,23,42,0.08)] lg:block">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Editing checklist
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    Confirm the headline
                  </p>
                  <p className="text-slate-500">
                    Make it descriptive and aligned with the new direction.
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    Refresh the body
                  </p>
                  <p className="text-slate-500">
                    Update sections, add media, and re-run the editor save flow.
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">
                    Preview before publish
                  </p>
                  <p className="text-slate-500">
                    Jump to preview mode to ensure layout, images, and SEO look
                    together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-4 md:gap-6">
          <div className="w-full">
            <EditBlog id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
