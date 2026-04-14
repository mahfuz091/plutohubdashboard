"use client";

import AddBlog from "@/components/AddBlog/AddBlog";
import Link from "next/link";
import { ChevronLeft, Feather, Orbit, PenSquare, Sparkles } from "lucide-react";

export default function AddBlogPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_26%),radial-gradient(circle_at_top_right,#fde68a_0%,transparent_22%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#fffdf5_0%,#ffffff_38%,#ecfdf5_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] ">
          <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-0 h-32 w-32 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_320px] lg:items-center">
            <div className="max-w-4xl">
              <Link
                href="/dashboard/blog"
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to all blogs
              </Link>

              <div className="flex w-fit mb-3 items-center gap-2 rounded-full border border-emerald-300 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Create article
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl md:leading-[0.95]">
                Create a story worth opening, scanning, and finishing.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Build your article with a stronger editorial flow. Start with a
                clear headline, shape the metadata, and prepare the post for
                preview without the clutter.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  <Feather className="h-4 w-4 text-emerald-600" />
                  Headline and content first
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  <Orbit className="h-4 w-4 text-sky-600" />
                  SEO and structure in one place
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <PenSquare className="h-4 w-4 text-emerald-600" />
                  Writing Flow
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                      01
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      Set the article frame
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Banner, title, slug, and metadata.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                      02
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      Write the article body
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Use the editor to shape the final reading experience.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-white">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/80">
                      03
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      Review before publish
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Preview everything and publish with confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <AddBlog />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <PenSquare className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Editorial Notes
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Use a clear title, a strong banner image, and a descriptive meta
                summary before moving to preview.
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                Keep the slug short, write meaningful alt text, and make the
                canonical URL final before publishing.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
