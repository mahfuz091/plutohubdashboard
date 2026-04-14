"use client";

import { startTransition, useContext } from "react";
import { BlogContext } from "@/context/BlogContext";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { postUpdate } from "@/app/actions/blog/blog.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EditSeeBlog = ({ userId }) => {
  const router = useRouter();
  const { blogData, setBlogData } = useContext(BlogContext);

  if (!blogData) {
    return (
      <div className='min-h-screen flex items-center justify-center text-slate-500'>
        No draft available yet.
      </div>
    );
  }

  const renderBlock = (block, index) => {
    if (!block?.type || !block?.data) return null;

    switch (block.type) {
      case "header": {
        const HeaderTag = `h${block.data.level || 2}`;
        return (
          <HeaderTag key={index} className='mb-4 text-2xl font-semibold text-slate-900'>
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
      case "image":
        return block.data?.file?.url ? (
          <div key={index} className='my-4 rounded-3xl border border-slate-200 bg-slate-100 p-2'>
            <img src={block.data.file.url} alt={block.data.caption || "Blog"} className='h-52 w-full object-cover' />
            {block.data.caption && (
              <p className='mt-2 text-xs text-slate-500'>{block.data.caption}</p>
            )}
          </div>
        ) : null;
      case "quote":
        return (
          <blockquote key={index} className='my-4 rounded-2xl border border-slate-200 bg-white p-5 text-slate-800'>
            <p>{block.data.text}</p>
            {block.data.caption && (
              <cite className='mt-3 block text-sm text-slate-500'>— {block.data.caption}</cite>
            )}
          </blockquote>
        );
      default:
        return null;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", blogData.id);
    formData.append("title", blogData.title);
    formData.append("shortDesc", blogData.shortDesc);
    const bannerValue =
      blogData.image || blogData.bannerImage || blogData.bannerImageUrl;
    if (bannerValue) {
      formData.append("bannerImage", bannerValue);
    }
    formData.append("authorId", userId);
    formData.append("blogCategoryId", blogData.categoryId);
    formData.append("content", JSON.stringify(blogData.content));

    startTransition(async () => {
      try {
        const response = await postUpdate(null, formData);
        if (response?.success) {
          toast.success("Draft updated");
          router.push("/dashboard/blog");
          setBlogData({
            title: "",
            content: null,
            image: "/banner.png",
            categories: [],
          });
        } else {
          toast.error(response?.msg || "Update failed");
        }
      } catch (err) {
        console.error("publish error:", err);
        toast.error("Server error while publishing blog");
      }
    });
  };

  return (
    <section className='min-h-screen pb-10'>
      <div className='mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-0'>
        <header className='rounded-[16px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sticky top-8 z-10'>
          <div className='flex flex-col gap-4   lg:justify-between'>
                 <div className='flex gap-2'>
              <Link href={`/dashboard/blog/edit/${blogData?.id}`}>
                <Button variant='outline' >
                  <ArrowLeft className='h-4 w-4' /> Back to edit
                </Button>
              </Link>
              <Button onClick={handleUpdate}>
                Update draft <ArrowUpRight className='h-4 w-4' />
              </Button>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.4em] text-slate-400'>
                Edit preview
              </p>
              <h1 className='mt-2 text-4xl font-semibold text-slate-900'>
                Review before publish
              </h1>
            </div>
       
          </div>
        </header>

        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between rounded-[16px] border border-slate-200 bg-white/80 px-6 py-4 shadow-sm'>
            <div>
              <p className='text-xs uppercase tracking-[0.4em] text-slate-400'>Status</p>
              <p className='text-lg font-semibold text-slate-900'>{blogData.status || "Pending"}</p>
            </div>
            <span className='rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>
              {blogData.status === "DECLINE" ? "Needs tweaks" : "Draft mode"}
            </span>
          </div>
          <div className='relative h-[320px] overflow-hidden rounded-[16px] border border-slate-200 bg-slate-100'>
            <img
              src={blogData.bannerImage || "/banner.png"}
              alt={blogData.title}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent' />
            <div className='absolute inset-0 flex flex-col justify-end p-6 text-white'>
              <span className='self-start rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em]'>
                Edit preview
              </span>
              <h2 className='text-4xl font-semibold'>{blogData.title}</h2>
            </div>
          </div>
        </div>
        <div className='grid gap-6 lg:grid-cols-1'>
          <article className='rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='space-y-6'>
              {blogData.content?.blocks?.map((block, index) =>
                renderBlock(block, index)
              )}
            </div>
          </article>
       
        </div>
      </div>
    </section>
  );
};

export default EditSeeBlog;
