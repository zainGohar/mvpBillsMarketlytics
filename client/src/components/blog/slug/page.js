import React from "react";
import Link from "next/link";
import { config } from "../../../../config";

const Slug = ({ params }) => {
  const urlR = /\s/g;
  const blog = config.blogs?.find(
    (b) =>
      b.title?.replace(urlR, "-").replace("?", "").toLowerCase() == params.slug
  );
  return (
    <div className="container pt-sm-5 light">
      <div className="d-flex justify-content-center">
        <div className="col-12 px-lg-5 px-md-5 px-sm-0">
          <div className="d-flex justify-content-center row">
            <img
              className="display-blog-box col-12 mb-5"
              src={blog?.image}
              alt={blog?.title}
            />
          </div>

          <div className=" d-flex justify-content-center">
            <h1 className="blog-preview-heading">{blog?.title}</h1>
          </div>

          <div className="d-flex flex-column align-items-center">
            <span className="text-center Blogtextcolor py-3">
              {blog?.create_at}
            </span>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center ">
        <div className="d-flex display-blog-content-row justify-content-center row">
          <div className=" col-12 ">
            <div
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{ __html: blog?.content ?? `<div/>` }}
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <strong>By {blog?.author}</strong>
      </div>

      <div className="my-3">
        <Link href="/blog">&lt; Back to blog</Link>
      </div>
    </div>
  );
};

export default Slug;
