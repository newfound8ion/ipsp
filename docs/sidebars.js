// @ts-check

const sidebars = {
  tutorialSidebar: [
    "intro",
    {
      type: "category",
      label: "Core Concepts",
      items: [
        "core-concepts/agents",
        "core-concepts/ipsp",
        "core-concepts/newkamoto-consensus",
        "core-concepts/WATT", 
        "core-concepts/base-points",
      ],
      },
    {
      type: "category",
      label: "IPSP",
      items: [
        "ipsp/overview",
      ],

            },
    {
      type: "category",
      label: "Verifiable Points",
      items: [
        "ipsp/verifiable-points/overview",
      ],

      },
    {
      type: "category",
      label: "Onchain Points",
      items: [
        "ipsp/onchain-points/overview",
      ],
      
    },
    {
      type: "category",
      label: "Base Points",
      items: [
        "newcoin-base-points/overview",
        "newcoin-base-points/registry",
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        {
          type: "category",
          label: "Gitcoin, Guild.xyz and Chainlink",
          items: [
            "guides/gitcoin-chainlink-guild/introduction",
            "guides/gitcoin-chainlink-guild/stubbing-the-contract",
            "guides/gitcoin-chainlink-guild/implementing-function-oracle",
            "guides/gitcoin-chainlink-guild/securing-the-contract",
            "guides/gitcoin-chainlink-guild/registering-the-function",
          ],
        },
        {
          type: "category",
          label: "Jokerace Vote Checker",
          items: [
            "guides/joke-vote-race/introduction",
            "guides/joke-vote-race/joke-vote",
            "guides/joke-vote-race/joke-and-checker",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
