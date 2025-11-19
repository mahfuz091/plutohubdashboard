"use client";
import { BankOutlined } from "@ant-design/icons";
import { createContext, useState } from "react";

export const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogData, setBlogData] = useState({
    title: "",
    postSlug: "",
    bannerAltText: "",
    metaTitle: "",
    metaDescription: "",
    // shortDesc: "",
    content: null,
    image: "/banner.png",
    categoryId: "",
  });

  return (
    <BlogContext.Provider value={{ blogData, setBlogData }}>
      {children}
    </BlogContext.Provider>
  );
};
