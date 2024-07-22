import React from "react";
import { config } from "../../../config";

export const metadata = {
  title: config.seo.privacy_policy.title,
};

const Privacy = () => {
  const policy = [
    {
      para2: "1. Information We Collect",
      paragraph:
        " This Privacy Policy explains how we collect, use, and disclose your personal information when you visit our website. By using our website, you consent to the terms of this policy.",
    },
    {
      para2: "2. How We Use Your Information",
      paragraph:
        "Your personal information is utilized for the following purposes:",
      par1: "To respond to your inquiries.",
      par2: "To provide you with information about our products and services.",
      par3: "To enhance the content and functionality of our website.",
    },
    {
      para2: "3. Cookies and Other Tracking Technologies",
      paragraph:
        " We employ cookies and other tracking technologies to gather information about your website usage. This information may include your IP address, browser type, operating system, and device details. We use this data to improve our website's content and functionality and to personalize your browsing experience.",
    },
    {
      para2: "4. Sharing Your Information",
      paragraph:
        " We do not sell or share your personal information with third parties, except as required by law or as necessary to fulfill your requests.",
    },
    {
      para2: "5. Security",
      paragraph:
        "We take reasonable measures to safeguard your personal information from unauthorized access, disclosure, or use.",
    },
    {
      para2: "6. Children’s Privacy",
      paragraph:
        " Our website is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under the age of 13.",
    },
    {
      para2: "7. Changes to this Privacy Policy",
      paragraph:
        " We may periodically update this Privacy Policy. Any updates will be posted on our website, along with the date of the most recent revision.",
    },
    {
      para2: "8. Contact Us",
      paragraph:
        " If you have any questions or concerns about this Privacy Policy, please feel free to contact us at team@shipgpt.ai. ",
    },
  ];

  return (
    <div className="container px-5 mt-5">
      <h1 className="mb-5">Privacy Policy</h1>

      <p className="mb-4">
        This Privacy Policy outlines how we gather, utilize, and disclose your
        personal information when you access our website. By using our website,
        you consent to the terms of this policy.
      </p>

      {policy?.map((v) => {
        return (
          <div className="mb-5">
            <p>
              <b>{v.para2}</b>
            </p>
            <p>{v.paragraph}</p>
            <p>{v.par1}</p>
            <p>{v.par2}</p>
            <p>{v.par3}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Privacy;
