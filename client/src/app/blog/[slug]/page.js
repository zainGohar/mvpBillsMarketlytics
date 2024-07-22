import React from "react";
import Slug from "@/components/blog/slug/page";
import { config } from "../../../../config";

export async function generateMetadata({ params, searchParams }, parent) {
  const urlR = /\s/g;
  const slug = params?.slug;
  const product = config.blogs?.find(
    (b) => b.title?.replace(urlR, "-").replace("?", "").toLowerCase() == slug
  );
  return {
    title: product?.title,
  };
}

const Page = ({ params }) => {
  return <Slug params={params} />;
};

export default Page;
