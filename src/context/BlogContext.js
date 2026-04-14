"use client";
import { createContext, useCallback, useState } from "react";

export const BlogContext = createContext();

const createEmptyBlogState = () => ({
  id: "",
  title: "",
  postSlug: "",
  bannerImage: "/banner.png",
  bannerAltText: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  shortDesc: "",
  content: null,
  categoryId: "",
  categories: [],
  status: "DRAFT",
  declineNote: "",
});

const parseContentValue = (content) => {
  if (!content) return null;
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.warn("Failed to parse blog content", error);
      return null;
    }
  }
  return content;
};

export const normalizeBlogPayload = (payload = {}) => {
  const base = createEmptyBlogState();
  const normalizedContent = parseContentValue(payload.content || payload.body);

  return {
    ...base,
    ...payload,
    bannerImage: payload.bannerImage || payload.image || base.bannerImage,
    categories:
      payload.categories ||
      payload.blogCategories ||
      payload.category ||
      base.categories,
    content: normalizedContent ?? base.content,
    status: payload.status || base.status,
  };
};

export const BlogProvider = ({ children }) => {
  const [blogData, setBlogData] = useState(createEmptyBlogState());
  const resetBlogData = useCallback(
    () => setBlogData(createEmptyBlogState()),
    []
  );

  return (
    <BlogContext.Provider value={{ blogData, setBlogData, resetBlogData }}>
      {children}
    </BlogContext.Provider>
  );
};
