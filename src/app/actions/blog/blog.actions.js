"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateBlogId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** ---------- Helpers ---------- */
function getString(v) {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Accepts `content` as:
 * 1) multiple inputs with the same name: formData.getAll("content")
 * 2) a single JSON string: '["para1","para2"]'
 * 3) a single newline-separated string
 */
function parseContent(formData) {
  const all = formData.getAll("content");
  if (all.length > 1) {
    return all
      .map((v) => (typeof v === "string" ? v : ""))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const single = getString(formData.get("content"));
  if (!single) return [];
  try {
    const parsed = JSON.parse(single);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    // not JSON — fall through
  }
  // newline-separated fallback
  return single
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** ---------- List Posts ---------- */

// export const postList = async () => {
//   try {
//     const posts = await prisma.post.findMany({
//       orderBy: { createdAt: "desc" },
//       include: {
//         author: {
//           select: { id: true, name: true, email: true, profileImage: true },
//         },
//         BlogCategory: { select: { id: true, name: true } },
//         Comment: {
//           orderBy: { createdAt: "asc" }, // optional: oldest first
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             content: true,
//             createdAt: true,
//             updatedAt: true,
//           },
//         },
//       },
//     });
//     // Convert content string to object
//     const postsWithContentObj = posts.map((post) => ({
//       ...post,
//       content: post.content ? JSON.parse(post.content) : null,
//     }));

//     return {
//       success: true,
//       msg: "Posts fetched successfully",
//       postsWithContentObj,
//     };
//   } catch (err) {
//     console.error("postList error:", err);
//     return { success: false, msg: "Failed to fetch posts" };
//   }
// };

export const postList = async () => {
  try {
    // Get logged-in user session
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, msg: "Unauthorized" };
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id, // ✅ only this author’s posts
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        BlogCategory: { select: { id: true, name: true } },
        Comment: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Parse content string → object
    const postsWithContentObj = posts.map((post) => ({
      ...post,
      content: post.content ? JSON.parse(post.content) : null,
    }));

    return {
      success: true,
      msg: "Posts fetched successfully",
      postsWithContentObj,
    };
  } catch (err) {
    console.error("postList error:", err);
    return { success: false, msg: "Failed to fetch posts" };
  }
};
/** ---------- Create Post ---------- */
export const postCreate = async (_prevState, formData) => {
  try {
    const title = getString(formData.get("title"));
    const postSlug = getString(formData.get("postSlug"));
    const bannerAltText = getString(formData.get("bannerAltText"));
    const metaTitle = getString(formData.get("metaTitle"));
    const metaDescription = getString(formData.get("metaDescription"));
    const canonicalUrl = getString(formData.get("canonicalUrl"));
    // const shortDesc = getString(formData.get("shortDesc"));
    const bannerImage = getString(formData.get("bannerImage")); // ✅ now stored
    // const content = parseContent(formData);
    // const contentRaw = formData.get("content");
    const contentRaw = getString(formData.get("content"));
    const authorId = getString(formData.get("authorId")); // optional
    const blogCategoryId = getString(formData.get("blogCategoryId")); // optional

    if (!title) {
      return {
        success: false,
        msg: "title, shortDesc and content are required",
      };
    }

    const existing = await prisma.post.findFirst({ where: { title } });
    if (existing) {
      return { success: false, msg: "Post with this title already exists" };
    }

    // 🔍 Check existing slug
    const existingSlug = await prisma.post.findUnique({ where: { postSlug } });
    if (existingSlug) {
      return {
        success: false,
        msg: "This post slug is already in use. Please choose a different one.",
      };
    }

    let content;
    try {
      content = JSON.parse(contentRaw); // <-- parse JSON once
    } catch (err) {
      console.error("Invalid JSON content:", err);
      return { success: false, msg: "Content is invalid JSON" };
    }

    const created = await prisma.post.create({
      data: {
        title,
        postSlug, // store generated slug
        // shortDesc,
        bannerImage,
        bannerAltText,
        metaTitle,
        metaDescription,
        canonicalUrl,
        content: contentRaw,
        authorId: authorId,
        blogCategoryId: blogCategoryId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        BlogCategory: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      msg: "Post created successfully",
      post: created,
    };
  } catch (err) {
    console.error("postCreate error:", err);
    return { success: false, msg: "Failed to create post" };
  }
};

/** ---------- Update Post ---------- */
export const postUpdate = async (_prevState, formData) => {
  try {
    const id = getString(formData.get("id"));
    if (!id) return { success: false, msg: "Post id is required" };

    const title = getString(formData.get("title"));
    // const shortDesc = getString(formData.get("shortDesc"));
    const bannerImage = getString(formData.get("bannerImage")); // ✅ now stored
    // const content = parseContent(formData);
    // const contentRaw = formData.get("content");
    const contentRaw = getString(formData.get("content"));
    const authorId = getString(formData.get("authorId")); // optional
    const blogCategoryId = getString(formData.get("blogCategoryId")); // optional

    const data = {};
    if (title) data.title = title;
    // if (shortDesc) data.shortDesc = shortDesc;
    if (contentRaw) data.content = contentRaw;
    if (bannerImage) data.bannerImage = bannerImage;
    // if (authorId) data.authorId = authorId;
    // if (blogCategoryId) data.blogCategoryId = blogCategoryId;

    // if (formData.has("authorId") && !authorId) data.authorId = null;
    // if (formData.has("blogCategoryId") && !blogCategoryId)
    //   data.blogCategoryId = null;

    if (Object.keys(data).length === 0) {
      return { success: false, msg: "Nothing to update" };
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        BlogCategory: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      msg: "Post updated successfully",
      post: updated,
    };
  } catch (err) {
    console.error("postUpdate error:", err);
    return { success: false, msg: "Failed to update post" };
  }
};

/** ---------- Delete Post ---------- */
export const deletePost = async (id) => {
  try {
    const deleted = await prisma.post.delete({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        BlogCategory: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      msg: "Post deleted successfully",
      post: deleted,
    };
  } catch (err) {
    console.error("deletePost error:", err);
    return { success: false, msg: "Failed to delete post" };
  }
};

/** ---------- Get Single Post ---------- */
// export const getPostById = async (id) => {
//   try {
//     const post = await prisma.post.findUnique({
//       where: { id },
//       include: {
//         author: { select: { id: true, name: true, email: true } },
//         BlogCategory: { select: { id: true, name: true } },
//       },
//     });

//     if (!post) return { success: false, msg: "Post not found" };

//     return {
//       success: true,
//       msg: "Post fetched successfully",
//       post,
//     };
//   } catch (err) {
//     console.error("getPostById error:", err);
//     return { success: false, msg: "Failed to fetch post" };
//   }
// };

export const getPostById = async (id) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        BlogCategory: { select: { id: true, name: true } },
      },
    });

    if (!post) return { success: false, msg: "Post not found" };

    // Parse content if it's a JSON string
    let parsedContent = {};
    try {
      parsedContent = post.content ? JSON.parse(post.content) : {};
    } catch (err) {
      console.warn("Failed to parse post content, returning empty object");
      parsedContent = {};
    }

    return {
      success: true,
      msg: "Post fetched successfully",
      post: {
        ...post,
        content: parsedContent,
      },
    };
  } catch (err) {
    console.error("getPostById error:", err);
    return { success: false, msg: "Failed to fetch post" };
  }
};
