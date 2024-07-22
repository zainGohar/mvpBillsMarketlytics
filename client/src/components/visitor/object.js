export const home = {
  featured: [
    { icon: "/images/home/featured/ph.png", to: "/" },
    { icon: "/images/home/featured/reddit.png", to: "/" },
    { icon: "/images/home/featured/x.png", to: "/" },
  ],
  easyWay: [
    {
      id: "database",
      icon: "bi bi-database-add",
      name: "Database",
      content: {
        id: "database",
        name: "Database",
        list: [
          {
            value: "MySQL Connection Setup",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "MySQL Tables for Easier Management",
            icon: "bi bi-check",
            active: true,
          },
          {
            value: "Saved 2 Hours of Time",
            icon: "bi bi-check",
            active: false,
          },
        ],
        comapny: {
          text: "with",
          link: "MySql",
          to: "https://www.mysql.com/",
        },
      },
    },
    {
      id: "style",
      icon: "bi bi-brush",
      name: "Style",
      content: {
        id: "style",
        name: "Style",
        list: [
          {
            value: "Design Components, Animations, and Sections Like This One",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Enabled Automatic Dark Mode",
            icon: "bi bi-check",
            active: true,
          },
          {
            value: "10 Hours of Time Saved",
            icon: "bi bi-check",
            active: false,
          },
        ],
        comapny: {
          text: "with",
          link: "Bootstrap",
          to: "https://www.bootstrap.com/",
        },
      },
    },
    {
      id: "seo",
      icon: "bi bi-search",
      name: "SEO",
      content: {
        id: "seo",
        name: "SEO",
        list: [
          {
            value: "Complete Blog Structure Example",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Meta Tags for Google Ranking",
            icon: "bi bi-check",
            active: true,
          },
          {
            value: "Rich Snippets with Structured Data Markup",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Saved 8 Hours of Time",
            icon: "bi bi-check",
            active: false,
          },
        ],
        comapny: {
          text: "with",
          link: "NextJs",
          to: "https://nextjs.org/",
        },
      },
    },
    {
      id: "email",
      icon: "bi bi-envelope-at",
      name: "Emails",
      content: {
        id: "email",
        name: "Emails",
        list: [
          {
            value: "Sending Transactional Emails",
            icon: "bi bi-check",
            active: false,
          },
          {
            value:
              "DNS Configuration to Prevent Spam (DKIM, DMARC, SPF in Subdomain)",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Webhook Integration for Email Reception and Forwarding",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "3 Hours of Time Saved",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Zero Headaches",
            icon: "bi bi-check",
            active: true,
          },
        ],
        // comapny: {
        //   text: "with",
        //   link: "Mailgun",
        //   to: "https://www.mailgun.com/",
        // },
      },
    },
    {
      id: "payment",
      icon: "bi bi-credit-card",
      name: "Payments",
      content: {
        id: "payment",
        name: "Payments",
        list: [
          {
            value: "Setup for Creating Checkout Sessions",
            icon: "bi bi-check",
            active: false,
          },
          {
            value:
              "Managing Webhooks for Account Updates (Subscriptions, One-Time Payments, etc.)",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Account Setup Tips and Chargeback Reduction Strategies",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "5 Hours of Time Saved",
            icon: "bi bi-check",
            active: true,
          },
        ],
        comapny: {
          text: "with",
          link: "Stripe",
          to: "https://stripe.com/",
        },
      },
    },
    {
      id: "login",
      icon: "bi bi-box-arrow-in-right",
      name: "Login",
      content: {
        id: "login",
        name: "User authentification",
        list: [
          {
            value: "Setup for Magic Links",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Step-by-Step Google Login Integration",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Storing Users in MongoDB/Supabase",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "Securing Private/Protected Pages & API Calls",
            icon: "bi bi-check",
            active: false,
          },
          {
            value: "4 Hours of Time Saved",
            icon: "bi bi-check",
            active: true,
          },
        ],
        comapny: {
          text: "with",
          link: "NextAuth",
          to: "https://next-auth.js.org/",
        },
      },
    },
  ],
  currentJourney: [
    {
      rows: [
        {
          item_info: "Learn Techstack",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Build Landing pages",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Build Authentication",
          item_data: "",
          direction: "ltr",
        },
      ],
    },
    {
      rows: [
        {
          item_info: "Build & Integrate Pricing (Stripe etc)",
          item_data: "",
          direction: "rtl",
        },
        {
          item_info: "Build Other Pages (Road map, privacy policy)",
          item_data: "",
          direction: "rtl",
        },
        {
          item_info: "Build App Use case",
          item_data: "",
          direction: "rtl",
        },
      ],
    },
    {
      rows: [
        {
          item_info: "Host App",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Make theme responsive",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Host",
          item_data: "",
          direction: "ltr",
        },
      ],
    },
  ],
  shipgptJourney: [
    {
      rows: [
        {
          item_info: "Provide Envs",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Write content for your SaaS",
          item_data: "",
          direction: "ltr",
        },
        {
          item_info: "Create your own use case or choose an existing one.",
          item_data: "",
          direction: "ltr",
        },
      ],
    },
    {
      rows: [
        {
          item_info: "",
          item_data: "",
          direction: "",
        },
        {
          item_info: "Host",
          item_data: "",
          direction: "rtl",
        },
        {
          item_info: "Launch",
          item_data: "",
          direction: "rtl",
        },
      ],
    },
  ],
  planIncludes: [
    {
      tr: [
        { value: "Email Authentication" },
        { value: "Social Sign-in" },
        { value: "Password Reset" },
      ],
    },
    {
      tr: [
        { value: "Stripe Checkout" },
        { value: "Subscription management via Stripe" },
        { value: "Blogs " },
      ],
    },
    {
      tr: [
        { value: "Roadmap" },
        { value: "Pricing Table" },
        { value: "Light and Dark Themes " },
      ],
    },
    {
      tr: [
        { value: "Mobile-friendly" },
        { value: "SEO-optimized" },
        { value: "Pinecone" },
      ],
    },
    {
      tr: [
        { value: "AI APIs" },
        { value: "Admin Dashboard" },
        { value: "Web Scrappers" },
      ],
    },
    {
      tr: [
        { value: "Chat With YouTube Videos" },
        { value: "Whisper API" },
        { value: "GPT Open AI, APIs" },
      ],
    },
    {
      tr: [
        { value: "Google Gemini APIs" },
        { value: "Anthropic APIs" },
        { value: "Langchain js" },
      ],
    },
  ],
};
