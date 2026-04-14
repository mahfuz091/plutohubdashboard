"use client";

import React, { useState, useContext, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BlogContext } from "@/context/BlogContext";
import {
  ArrowUpRight,
  ImagePlus,
  Link2,
  Loader2,
  ScanText,
  Type,
} from "lucide-react";
import { Button } from "../ui/button";
import { Spin } from "antd";
import { generateBlogId } from "@/lib/utils";
// import AddBlogEditorTwo from "./AddBlogEdittorTwo";

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const META_TITLE_MAX = 160;

const AddBlogEditor = dynamic(() => import("./AddBlogEditor"), {
  ssr: false,
});

export default function AddBlog() {
  const { blogData, setBlogData } = useContext(BlogContext);

  const [title, setTitle] = useState(blogData.title || "");
  const [slug, setSlug] = useState(blogData.postSlug || "");
  const [preview, setPreview] = useState(blogData.image || "/banner.png");
  const [uploading, setUploading] = useState(false);
  const [bannerAlt, setBannerAlt] = useState(blogData.bannerAltText || "");
  const [metaTitle, setMetaTitle] = useState(blogData.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    blogData.metaDescription || ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(blogData.canonicalUrl || "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [canonicalEdited, setCanonicalEdited] = useState(false);
  const fileInputRef = useRef();

  // const updateTitleContext = useRef(
  //   debounce((value) => {
  //     const generatedSlug = generateBlogId(value);
  //     setSlug((prev) => (prevEdited ? prev : generatedSlug));
  //     setBlogData((prev) => ({
  //       ...prev,
  //       title: value,
  //       postSlug: generatedSlug,
  //     }));
  //   }, 300)
  // ).current;
  const updateTitleContext = useRef(
    debounce((value) => {
      const generatedSlug = generateBlogId(value);
      setSlug((prev) => (slugEdited ? prev : generatedSlug)); // ← use slugEdited here
      setCanonicalUrl((prev) => (canonicalEdited ? prev : generatedSlug)); // ← use slugEdited here
      setBlogData((prev) => ({
        ...prev,
        title: value,
        postSlug: slugEdited ? prev.postSlug : generatedSlug,
        canonicalUrl: canonicalEdited ? prev.canonicalUrl : generatedSlug,
      }));
    }, 300)
  ).current;

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    updateTitleContext(value);
  };

  const handleTitleResize = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempPreview = URL.createObjectURL(file);
    setPreview(tempPreview);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const finalUrl = data.url || tempPreview;
      setPreview(finalUrl);

      setBlogData((prev) => ({ ...prev, image: finalUrl }));
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const handleSlugChange = (e) => {
    const value = e.target.value;
    setSlug(value);
    setSlugEdited(true); // mark as manually edited
    setBlogData((prev) => ({ ...prev, postSlug: value }));
  };
  const handleBannerAltChange = (e) => {
    const value = e.target.value;
    setBannerAlt(value);
    setBlogData((prev) => ({ ...prev, bannerAltText: value }));
  };

  const handleMetaTitleChange = (e) => {
    const value = e.target.value.slice(0, META_TITLE_MAX);
    setMetaTitle(value);
    setBlogData((prev) => ({ ...prev, metaTitle: value }));
  };

  const META_DESC_MAX = 200;

  const handleMetaDescriptionChange = (e) => {
    const value = e.target.value.slice(0, META_DESC_MAX);
    setMetaDescription(value);
    setBlogData((prev) => ({ ...prev, metaDescription: value }));
  };

  const handleCanonicalUrlChange = (e) => {
    const value = e.target.value;

    setCanonicalEdited(true);
    setCanonicalUrl(value);
    setBlogData((prev) => ({ ...prev, canonicalUrl: value }));
  };

  console.log(blogData, "blogData add");

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#065f46_100%)] px-6 py-7 text-white md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Blog composer
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Build the article shell before you preview it.
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
            Title, SEO, banner, and content all in one flow.
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 md:p-8">
        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <ImagePlus className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Hero banner
            </h3>
          </div>

          <div
            className="group relative mb-5 h-[260px] cursor-pointer overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-white md:h-[420px]"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={preview}
              alt="Blog Banner"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent p-5 text-white">
              <p className="text-sm font-medium">
                Click to upload or replace banner image
              </p>
              <p className="mt-1 text-xs text-white/75">
                Use a crisp, high-contrast image that matches the article tone.
              </p>
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
                <Spin size="large" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <div>
            <label
              htmlFor="bannerAlt"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Banner Alt Text
            </label>
            <input
              id="bannerAlt"
              type="text"
              placeholder="Describe the banner image for accessibility"
              value={bannerAlt}
              onChange={handleBannerAltChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <Type className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Article identity
              </h3>
            </div>

            <div>
              <label
                htmlFor="blogTitle"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Blog Title
              </label>
              <textarea
                id="blogTitle"
                placeholder="Enter a sharp, readable article title"
                value={title}
                onChange={handleTitleChange}
                onInput={handleTitleResize}
                className="min-h-[132px] w-full resize-none rounded-[24px] border border-slate-300 bg-slate-50 px-5 py-4 text-2xl font-semibold leading-tight text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Post Slug
              </label>
              <input
                type="text"
                placeholder="enter-post-slug"
                value={slug}
                onChange={handleSlugChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <ScanText className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                SEO snapshot
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Enter meta title"
                  value={metaTitle}
                  maxLength={160}
                  onChange={handleMetaTitleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
                <div className="mt-1 flex justify-end text-xs text-slate-500">
                  {metaTitle.length}/160
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Description
                </label>
                <textarea
                  placeholder="Enter meta description"
                  value={metaDescription}
                  maxLength={200}
                  onChange={handleMetaDescriptionChange}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
                <div className="mt-1 flex justify-end text-xs text-slate-500">
                  {metaDescription.length}/200
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Canonical URL
                </label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="https://example.com/blog/article"
                    value={canonicalUrl}
                    onChange={handleCanonicalUrlChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Article Content
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Draft the body with headings, paragraphs, lists, quotes, images,
                and code blocks.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:p-5">
            <AddBlogEditor preview={preview} />
          </div>
        </section>

        <div className="flex justify-end">
          <Link href="/dashboard/blog/preview">
            <Button
              type="submit"
              className="h-12 rounded-full px-6 text-white shadow-lg shadow-emerald-500/25"
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Continue to Preview <ArrowUpRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
