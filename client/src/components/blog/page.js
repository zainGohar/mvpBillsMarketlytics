"use client";

import { DropButton } from "@/libs/button/page";
import React, { useState } from "react";
import { config } from "../../../config";
import Link from "next/link";

const blogs = () => {
  const urlR = /\s/g;
  const [filter, setFilter] = useState("All");

  const handleFilter = (value) => {
    setFilter(value);
  };
  const filteredBlogs = config.blogs?.filter(
    (blog) => filter === "All" || blog.category === filter
  );

  let dynamicCategories = [
    "All",
    ...new Set(config.blogs.map((blog) => blog.category)),
  ];

  const categories = dynamicCategories.map((category) => ({
    link: category,
    onClick: () => handleFilter(category),
  }));

  const blogCategory = (item) => (
    <div className="blog col-sm-4 col-12">
      <div className="img-card iCard-style1 ">
        <div className="card-content">
          <div className="card-image">
            <img src={item.image} loading="lazy" alt={item.title} />
          </div>

          <div className="card-text">
            <div className="d-flex mb-3 justify-content-between align-items-start">
              <p className="title mb-0 mt-3">{item.title}</p>
              <span className="category">{item.category}</span>
            </div>
            <p className="mb-0 description">
              {item.description?.slice(0, 150)}
            </p>
          </div>
        </div>

        <div className="card-link">
          <Link
            href={`/blog/${item.title
              .replace(urlR, "-")
              .replace("?", "")
              .toLowerCase()}`}
          >
            <span>{item.read} Read Full</span>
          </Link>
        </div>
      </div>
    </div>
  );
  return (
    <div className="blogs">
      <div className="d-flex justify-content-between">
        <h1 className="ms-3 mb-5">Blog Posts:</h1>
        <DropButton
          text="Select Category"
          textClass="category-box"
          buttonClass="category-box"
          list={categories}
        />
      </div>
      <div className="d-flex row">
        {filteredBlogs.reverse().map(blogCategory)}
      </div>
    </div>
  );
};

export default blogs;
