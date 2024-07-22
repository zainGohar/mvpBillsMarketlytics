export const config = {
  icon: "icon.png",
  logo: "logo.png",
  name: "ShipGPT",
  value: "shipgpt",
  url: "shipgpt.ai",
  stripe: {
    plans: [
      {
        planDisplayName: "FREE",
        planName: "free",
        price: "0",
        features: ["free feature 1", "free feature 2", "free feature 3"],
      },
      {
        planDisplayName: "BASIC",
        planName: "BasicMonth",
        stripePriceId: process.env.NODE_ENV === "development" ? "price_id" : "",
        price: "20",
        duration: "month",
        features: ["basic feature 1", "basic feature 2", "basic feature 3"],
      },
      {
        planDisplayName: "BASIC",
        planName: "BasicYear",
        stripePriceId: process.env.NODE_ENV === "development" ? "price_id" : "",
        price: "200",
        duration: "year",
        features: [
          "premium feature 1",
          "premium feature 2",
          "premium feature 3",
        ],
      },
      {
        recommended: true,
        planDisplayName: "PREMIUM",
        planName: "PremiumMonth",
        stripePriceId: process.env.NODE_ENV === "development" ? "price_id" : "",
        price: "50",
        duration: "month",
        features: [
          "premium feature 1",
          "premium feature 2",
          "premium feature 3",
        ],
      },
      {
        recommended: true,
        planDisplayName: "PREMIUM",
        planName: "PremiumYear",
        stripePriceId: process.env.NODE_ENV === "development" ? "price_id" : "",
        price: "500",
        duration: "year",
        features: [
          "premium feature 1",
          "premium feature 2",
          "premium feature 3",
        ],
      },
    ],
  },
  roadmap: [
    {
      title: "Title",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel, nam! Nam eveniet ut aliquam ab asperiores, accusamus iure veniam corporis incidunt reprehenderit accusantium id aut architecto harum quidem dolorem in!",
      date: "00-00-0000",
      icon: "diagram-3",
    },
    {
      title: "Title",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel, nam! Nam eveniet ut aliquam ab asperiores, accusamus iure veniam corporis incidunt reprehenderit accusantium id aut architecto harum quidem dolorem in!",
      date: "00-00-0000",
      icon: "diagram-3",
    },
    {
      title: "Title",
      content:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel, nam! Nam eveniet ut aliquam ab asperiores, accusamus iure veniam corporis incidunt reprehenderit accusantium id aut architecto harum quidem dolorem in!",
      date: "00-00-0000",
      icon: "diagram-3",
    },
  ],
  seo: {
    root: {
      title: {
        template: "%s | Ship your startup in days",
        default: "ShipSaaS",
      },
      description:
        "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app and make your first $ online fast.",
    },
    home: {
      title: "ShipSaaS | Ship your startup in days",
    },
    roadmap: {
      title: "Roadmap",
    },
    privacy_policy: {
      title: "Privacy Policy",
    },
    auth: {
      signin: { title: "Signin" },
      signup: { title: "Signup" },
      verify: { title: "Verify" },
      verifymail: { title: "Verifymail" },
      forgot_password: {
        title: "Forgot Password",
      },
      reset_password: { title: "Reset Password" },
    },
    payment: {
      pricing: { title: "Signin" },
      payment_success: { title: "Signup" },
    },
    blog: {
      title: "Blogs",
    },
  },
  blogs: [
    {
      id: 1,
      image:
        "https://techcrunch.com/wp-content/uploads/2024/03/Satgana.jpeg?resize=1200,674",
      title:
        "Climate tech VC Satgana closes first fund that targets early-stage startups in Africa, Europe",
      description:
        "Satgana, emerging from stealth in 2022, has invested in 13 startups, aiming for 30 in Europe and Africa.",
      category: "technology",
      author: "Annie Njanja",
      create_at: "2024-03-28",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
    {
      id: 2,
      image:
        "https://techcrunch.com/wp-content/uploads/2024/03/Copy-of-Prayank-Swaroop.jpg?resize=1200,800",
      title: "Accel earnestly rethinks early-stage startup investing in India",
      description:
        "Accel, with nearly two dozen Indian unicorn startups, focuses on AI and Industry 5.0 with Atoms.",
      category: "business",
      author: "Manish Singh",
      create_at: "2024-03-28",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
    {
      id: 3,
      image:
        "https://techcrunch.com/wp-content/uploads/2022/08/GettyImages-1197780051.jpg?resize=1200,800",
      title:
        "StealthMole raises $7M Series A for its AI-powered dark web intelligence platform",
      description:
        "StealthMole, specializing in monitoring cyber threats, announces a $7 million Series A funding.",
      category: "cybersecurity",
      author: "Kate Park",
      create_at: "2024-03-28",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
    {
      id: 1,
      image: "https://images.wsj.net/im-930328/social",
      title: "Nvidia Keynote Fills 11,000-Seat SAP Center",
      description:
        "Nvidia's latest chip unveiling at a packed event shows the growing frenzy over AI.",
      category: "technology",
      author: "John Gruber",
      create_at: "2024-03-20",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
    {
      id: 2,
      image: "https://images.wsj.net/im-936721/social",
      title: "Govts Across Nation Handing Residents Cash",
      description:
        "A look into U.S. governments' initiatives to provide residents with direct financial aid.",
      category: "policy",
      author: "www.wsj.com",
      create_at: "2024-03-19",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
    {
      id: 3,
      image: "https://images.wsj.net/im-938358/social",
      title:
        "Starting a Vending Machine Business Sounds Easy. The Reality Is a Lot More Complicated.",
      description:
        "The complexities behind what seems like a straightforward venture into the vending machine business.",
      category: "business",
      author: "Joe Pinsker",
      create_at: "2024-03-18",
      content: `<div>
      What is Lorem Ipsum?
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text
        ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged. It was popularised in the 1960s
        with the release of Letraset sheets containing Lorem Ipsum passages,
        and more recently with desktop publishing software like Aldus
        PageMaker including versions of Lorem Ipsum. Why do we use it? It is
        a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution
        of letters, as opposed to using 'Content here, content here', making
        it look like readable English.
      </p>
      Many desktop publishing packages and web page editors now use Lorem
      Ipsum as their default model text, and a search for 'lorem ipsum' will
      uncover many web sites still in their infancy. Various versions have
      evolved over the years, sometimes by accident, sometimes on purpose
      (injected humour and the like). Where does it come from? Contrary to
      popular belief, Lorem Ipsum is not simply random text. It has roots in
      a piece of classical Latin literature from 45 BC, making it over 2000
      years old. Richard McClintock, a Latin professor at Hampden-Sydney
      College in Virginia, looked up one of the more obscure Latin words,
      consectetur, from a Lorem Ipsum passage, and going through the cites
      of the word in classical literature, discovered the undoubtable
      source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de
      Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
      written in 45 BC. This book is a treatise on the theory of ethics,
      very popular during the Renaissance. The first line of Lorem Ipsum,
      "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
    </div>`,
    },
  ],
};
