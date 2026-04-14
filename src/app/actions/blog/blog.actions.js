"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessDashboard, isAdmin } from "@/lib/access";
import { revalidatePath } from "next/cache";

function getString(v) {
  return typeof v === "string" ? v.trim() : "";
}

async function requireDashboardUser() {
  const session = await auth();

  if (!session?.user?.id || !canAccessDashboard(session.user)) {
    return null;
  }

  return session;
}

async function canAccessPost(session, postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return { ok: false, msg: "Post not found" };
  }

  if (!isAdmin(session.user) && post.authorId !== session.user.id) {
    return { ok: false, msg: "Unauthorized" };
  }

  return { ok: true, post };
}

const STATUS_VALUES = ["DRAFT", "PENDING", "PUBLISH", "DECLINE"];

export const postList = async () => {
  try {
    const session = await requireDashboardUser();
    if (!session) {
      return { success: false, msg: "Unauthorized" };
    }

    const posts = await prisma.post.findMany({
      where: isAdmin(session.user) ? {} : { authorId: session.user.id },
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

export const postCreate = async (_prevState, formData) => {
  try {
    const session = await requireDashboardUser();
    if (!session) {
      return { success: false, msg: "Unauthorized" };
    }

    const title = getString(formData.get("title"));
    const postSlug = getString(formData.get("postSlug"));
    const bannerAltText = getString(formData.get("bannerAltText"));
    const metaTitle = getString(formData.get("metaTitle"));
    const metaDescription = getString(formData.get("metaDescription"));
    const canonicalUrl = getString(formData.get("canonicalUrl"));
    const bannerImage = getString(formData.get("bannerImage"));
    const contentRaw = getString(formData.get("content"));
    const blogCategoryId = getString(formData.get("blogCategoryId"));

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

    const existingSlug = await prisma.post.findUnique({ where: { postSlug } });
    if (existingSlug) {
      return {
        success: false,
        msg: "This post slug is already in use. Please choose a different one.",
      };
    }

    try {
      JSON.parse(contentRaw);
    } catch (err) {
      console.error("Invalid JSON content:", err);
      return { success: false, msg: "Content is invalid JSON" };
    }

    const created = await prisma.post.create({
      data: {
        title,
        postSlug,
        bannerImage,
        bannerAltText,
        metaTitle,
        metaDescription,
        canonicalUrl,
        content: contentRaw,
        status: "PENDING",
        authorId: session.user.id,
        blogCategoryId,
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

export const postUpdate = async (_prevState, formData) => {
  try {
    const session = await requireDashboardUser();
    if (!session) {
      return { success: false, msg: "Unauthorized" };
    }

    const id = getString(formData.get("id"));
    if (!id) return { success: false, msg: "Post id is required" };

    const access = await canAccessPost(session, id);
    if (!access.ok) {
      return { success: false, msg: access.msg };
    }

    const title = getString(formData.get("title"));
    const bannerImage = getString(formData.get("bannerImage"));
    const contentRaw = getString(formData.get("content"));

    const data = {};
    if (title) data.title = title;
    if (contentRaw) data.content = contentRaw;
    if (bannerImage) data.bannerImage = bannerImage;

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

export const deletePost = async (id) => {
  try {
    const session = await requireDashboardUser();
    if (!session) {
      return { success: false, msg: "Unauthorized" };
    }

    const access = await canAccessPost(session, id);
    if (!access.ok) {
      return { success: false, msg: access.msg };
    }

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

export const getPostById = async (id) => {
  try {
    const session = await requireDashboardUser();
    if (!session) {
      return { success: false, msg: "Unauthorized" };
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        BlogCategory: { select: { id: true, name: true } },
      },
    });

    if (!post) return { success: false, msg: "Post not found" };
    if (!isAdmin(session.user) && post.authorId !== session.user.id) {
      return { success: false, msg: "Unauthorized" };
    }

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

export const updatePostStatus = async ({ postId, status, note }) => {
  try {
    const session = await auth();
    if (!isAdmin(session?.user)) {
      return { success: false, msg: "Unauthorized" };
    }

    if (!postId || !STATUS_VALUES.includes(status)) {
      return { success: false, msg: "Invalid status" };
    }
    if (status === "DECLINE" && !note?.trim()) {
      return { success: false, msg: "Enter a decline note" };
    }

    const data = {
      status,
      declineNote: status === "DECLINE" ? note : null,
    };

    await prisma.post.update({
      where: { id: postId },
      data,
    });

    revalidatePath("/dashboard/blog");
    return { success: true, msg: "Status updated" };
  } catch (err) {
    console.error("updatePostStatus error:", err);
    return { success: false, msg: "Failed to update status" };
  }
};
