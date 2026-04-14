"use client";

import React, { useState, useContext, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BlogContext } from "@/context/BlogContext";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Spin } from "antd";

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const EditBlogEditor = dynamic(() => import("./EditBlogEditor"), {
  ssr: false,
});

export default function EditBlog() {
  const { blogData, setBlogData } = useContext(BlogContext);

  const [title, setTitle] = useState(blogData.title || "");
  const [slug, setSlug] = useState(blogData.postSlug || "");
  const [preview, setPreview] = useState(blogData.bannerImage || "/banner.png");
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

  const updateTitleContext = useRef(
    debounce((value) => {
      setBlogData((prev) => ({ ...prev, title: value }));
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
    setSlugEdited(true);
    setBlogData((prev) => ({ ...prev, postSlug: value }));
  };
  const handleBannerAltChange = (e) => {
    const value = e.target.value;
    setBannerAlt(value);
    setBlogData((prev) => ({ ...prev, bannerAltText: value }));
  };

  const handleMetaTitleChange = (e) => {
    const value = e.target.value;
    setMetaTitle(value);
    setBlogData((prev) => ({ ...prev, metaTitle: value }));
  };

  const handleMetaDescriptionChange = (e) => {
    const value = e.target.value;
    setMetaDescription(value);
    setBlogData((prev) => ({ ...prev, metaDescription: value }));
  };

  const handleCanonicalUrlChange = (e) => {
    const value = e.target.value;

    setCanonicalEdited(true);
    setCanonicalUrl(value);
    setBlogData((prev) => ({ ...prev, canonicalUrl: value }));
  };

  return (
    <div className='bg-white border border-slate-200 rounded-[16px] shadow-sm'>
      <div className='space-y-6 p-6 md:p-8'>
        <div
          className='relative cursor-pointer overflow-hidden rounded-[16px] border border-dashed border-slate-200 bg-slate-50 hover:border-emerald-300'
          style={{ minHeight: 260 }}
          onClick={() => fileInputRef.current.click()}
        >
          <img
            src={preview}
            alt='Blog Banner'
            className='h-full w-full object-cover transition duration-500'
          />
          {uploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-slate-900/60'>
              <Spin size='large' />
            </div>
          )}
          <div className='pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-900/80 to-transparent px-5 py-4 text-xs uppercase tracking-[0.2em] text-white'>
            <span>Change banner</span>
            <span>Drag or paste image</span>
          </div>
        </div>

        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          onChange={handleFileChange}
        />

        <div className='space-y-4'>
          <label className='text-sm font-semibold text-slate-500'>Alt text</label>
          <input
            id='bannerAlt'
            type='text'
            placeholder='Describe the image for accessibility'
            value={bannerAlt}
            onChange={handleBannerAltChange}
            className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-emerald-100'
          />
        </div>

        <div className='space-y-4'>
          <label className='text-sm font-semibold text-slate-500'>Blog title</label>
          <textarea
            id='blogTitle'
            placeholder='Write your blog title'
            value={title}
            onChange={handleTitleChange}
            onInput={handleTitleResize}
            className='w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-3xl font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-emerald-100'
            rows={2}
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-slate-500'>Post slug</label>
            <input
              type='text'
              placeholder='post-slug-example'
              value={slug}
              onChange={handleSlugChange}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-emerald-100'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-semibold text-slate-500'>
              Canonical URL
            </label>
            <input
              type='text'
              placeholder='https://example.com/blog/article'
              value={canonicalUrl}
              onChange={handleCanonicalUrlChange}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-emerald-100'
            />
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-slate-500'>Meta title</label>
            <input
              type='text'
              placeholder='SEO meta title'
              value={metaTitle}
              onChange={handleMetaTitleChange}
              className='w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-emerald-100'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-slate-500'>
              Meta description
            </label>
            <textarea
              placeholder='Meta description'
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              rows={3}
              className='w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-emerald-100'
            />
          </div>
        </div>

        <div className='rounded-[16px] border border-slate-200 bg-slate-50 p-4'>
          <EditBlogEditor preview={preview} />
        </div>

        <div className='flex justify-end'>
          <Link href='/dashboard/blog/edit-preview'>
            <Button variant='default'>
              <span className='flex items-center gap-2'>
                <ArrowUpRight className='h-4 w-4' />
                Preview changes
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
