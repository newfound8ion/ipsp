// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Newcoin Developer Documentation",
  tagline: "Add algorithmic points to your app, for free.",
  favicon: "img/636cdeb29d8af379852bdd3c_fav1.png",

  // Set the production url of your site here
  url: "https://developer.ipsp.cc",
  baseUrl: "/",

  organizationName: "newfound8ion",
  projectName: "ipsp",

  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/newfound8ion/ipsp/edit/main/",
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/newfound8ion/ipsp/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],

  
  themeConfig: {
    image: "/img/641c37a4fce0f1c717da3692_nco-symbol-black.svg",
    navbar: {
      title: "Developer Docs",
      logo: {
        alt: "Newcoin",
        src: "/img/641c37a4fce0f1c717da3692_nco-symbol-black.svg",
      },
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Newcoin is an open-source project powered by Newfoundation.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
};

module.exports = config;
