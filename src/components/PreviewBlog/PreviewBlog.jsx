"use client";

import { startTransition, useContext } from "react";
import { BlogContext } from "@/context/BlogContext";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { postCreate } from "@/app/actions/blog/blog.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { generateBlogId } from "@/lib/utils";

const SeeBlog = ({ userId }) => {
  const router = useRouter();
  const { blogData, setBlogData } = useContext(BlogContext);

  if (!blogData) {
    return (
      <div className='min-h-screen flex items-center justify-center text-muted-foreground'>
        No content to preview yet.
      </div>
    );
  }

  const renderItem = (item) => {
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      if ("content" in item) return item.content;
      if ("text" in item) return item.text;
      return JSON.stringify(item);
    }
    return String(item);
  };

  const renderBlock = (block, index) => {
    if (!block?.type || !block?.data) return null;

    switch (block.type) {
      case "header": {
        const HeaderTag = `h${block.data.level || 2}`;
        return (
          <HeaderTag key={index} className='mb-4 font-semibold text-2xl text-slate-900'>
            {block.data.text}
          </HeaderTag>
        );
      }
      case "paragraph":
        return (
          <p key={index} className='mb-3 text-base leading-relaxed text-slate-700'>
            {block.data.text}
          </p>
        );
      case "list":
        return block.data.items?.length ? (
          <ul key={index} className='mb-3 list-disc space-y-1 pl-5 text-slate-700'>
            {block.data.items.map((item, i) => (
              <li key={i}>{renderItem(item)}</li>
            ))}
          </ul>
        ) : null;
      case "image":
        return block.data?.file?.url ? (
          <div key={index} className='mb-4 overflow-hidden rounded-3xl border border-slate-200'>
            <img src={block.data.file.url} alt={block.data.caption || "Blog"} className='h-auto w-full object-cover' />
            {block.data.caption && (
              <p className='px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400'>
                {block.data.caption}
              </p>
            )}
          </div>
        ) : null;
      case "quote":
        return (
          <blockquote
            key={index}
            className='my-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-base italic text-slate-700'
          >
            <p>{block.data.text}</p>
            {block.data.caption && (
              <cite className='mt-3 block text-sm not-italic text-slate-500'>
                — {block.data.caption}
              </cite>
            )}
          </blockquote>
        );
      case "code":
        return (
          <pre
            key={index}
            className='mb-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-white'
          >
            <code>{block.data.code}</code>
          </pre>
        );
      default:
        return null;
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!blogData.image) {
      toast.error("Upload a banner before publishing.");
      return;
    }

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("postSlug", blogData.postSlug);
    formData.append("bannerAltText", blogData.bannerAltText);
    formData.append("metaTitle", blogData.metaTitle);
    formData.append("metaDescription", blogData.metaDescription);
    formData.append("canonicalUrl", blogData.canonicalUrl);
    formData.append("bannerImage", blogData.image);
    formData.append("authorId", userId);
    formData.append("blogCategoryId", blogData.categoryId);
    formData.append("content", JSON.stringify(blogData.content));

    startTransition(async () => {
      try {
        const response = await postCreate(null, formData);
        if (response?.success) {
          toast.success(response.msg);
          router.push("/dashboard/blog");
          setBlogData({
            title: "",
            content: null,
            image: "/banner.png",
            categories: [],
          });
        } else {
          toast.error(response?.msg || "Failed to publish blog");
        }
      } catch (err) {
        console.error("publish error:", err);
        toast.error("Server error while publishing blog");
      }
    });
  };

  return (
    <section className='min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7_0%,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] py-10'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-0'>
        <header className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.4em] text-slate-400'>
                Preview
              </p>
              <h1 className='mt-2 text-4xl font-semibold text-slate-900'>
                {blogData.title}
              </h1>
            </div>
            <div className='flex gap-2'>
              <Link href={`/dashboard/blog/edit/${blogData?.id}`}>
                <Button variant='outline' size='sm'>
                  <ArrowLeft className='h-4 w-4' /> Back to edit
                </Button>
              </Link>
              <Button onClick={handlePublish} disabled={!blogData.image}>
                Publish <ArrowUpRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </header>

        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between rounded-[28px] border border-slate-200 bg-white/80 px-6 py-4 shadow-sm'>
            <div>
              <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Status</p>
              <p className='text-lg font-semibold text-slate-900'>{blogData.status || "Pending"}</p>
            </div>
            <span className='rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>
              {blogData.status === "DECLINE" ? "Needs tweaks" : "Ready to review"}
            </span>
          </div>
          <div className='relative h-[360px] overflow-hidden rounded-[36px] border border-slate-200 bg-slate-100'>
            <img
              src={blogData.image || "/banner.png"}
              alt={blogData.title}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent' />
            <div className='absolute inset-0 flex flex-col justify-end p-6 text-white'>
              <span className='self-start rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em]'>
                Draft preview
              </span>
              <h2 className='text-4xl font-semibold'>{blogData.title}</h2>
            </div>
          </div>
          <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
            <article className='rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='space-y-6'>
                {blogData.categories?.length ? (
                  <div className='flex flex-wrap gap-2'>
                    {blogData.categories.map((cat) => (
                      <span key={cat.id} className='rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
                        {cat.name}
                      </span>
                    ))}
                  </div>
                ) : null}
                {blogData.content?.blocks?.map((block, index) =>
                  renderBlock(block, index)
                )}
              </div>
            </article>

            <aside className='space-y-4 rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
              <div>
                <h3 className='text-lg font-semibold text-slate-900'>Details</h3>
                <p className='text-sm text-slate-500'>Meta + slug info</p>
              </div>
              <div className='space-y-3 text-sm text-slate-600'>
                <div>
                  <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Meta title</p>
                  <p>{blogData.metaTitle || "Add a meta title"}</p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Meta description</p>
                  <p>{blogData.metaDescription || "Add a summary or snooze"}</p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Canonical URL</p>
                  <p className='text-slate-500'>{blogData.canonicalUrl || generateBlogId(blogData.title)}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeeBlog;
