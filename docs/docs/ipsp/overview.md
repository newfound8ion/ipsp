# Overview

IPSP is the missing link required to turn the Internet into an open graph. When Open Graph Protocol was introduced by Facebook at the F8 conference in 2010, it offered a standardized way to represent nodes, especially web pages so any social network, search engine or messaging app would be able to display a widget representing the link.

But a graph has two key components: the nodes and the edges, which are the relationships between the nodes. Currently, the relationships between nodes, meaning the likes, ratings, feedback, follow relationships are stored on proprietary servers, making the Open Graph ensnared within proprietary platforms. If we want to see a truly open graph, we have to make those edges between users, content, apps etc. agent centric, portable, user-controlled running on public rails.

Fast forward to 2024, most graphs are no longer relying on the mechanism of graph queries to display content: plafforms like X, Instagram or Spotify are using those relationships to train machine learning models that predict what you should see next, rather than showing you the users you follow.

What if graph relationships could be protocolized? What if instead of private companies accumulating this data about our preference, what we value, this data would become agent-centric.

We would travel across the Internet with the list of things we relate to, and would be able to switch platforms.

And all platforms would be able to read and understand those relationships regardless of the programing language, stack, blockchain, protocol... in the same way emails or verifiable credentials can be issued and verified without the need for a centralized database to store them.

IPSP is the open-spource data construct that makes it possible.

The most powerful use case for IPSP is the decentralization of AI. It unlocks the power of coordination and interoperability across systems and computational layers.

**Technology Agnosticism:** IPSP allows various applications, whether they are AI models, smart contracts, or human interfaces, to communicate effectively by adhering to a standardized data format. This standardization ensures that despite differing underlying technologies, all participants can interact seamlessly within the Newcoin network.

**Data Standardization and Representation:** By quantifying relationships and interactions in a consistent format, IPSP enables a clear representation of value and context across different agents. This feature is fundamental in aligning diverse systems towards common goals and decision-making processes, facilitating a more integrated and efficient network.

**Interoperability Across Agents:** Applications written to comply with the IPSP standard can easily interact with other IPSP-compatible agents. This not only includes other applications but extends to smart contracts and backend systems, thus broadening the scope of interaction and functionality within the Newcoin ecosystem. Such interoperability is critical for enhancing the network's capability to process and utilize data effectively.

**Facilitating Complex Relationships Analysis:** Through IPSP, agents can quantify and track the value flow within the network. This capability is crucial for understanding and analyzing the dynamics of decentralized networks, which can involve numerous agents interacting in multifaceted ways. Newgraph, a component of Newcoin, leverages IPSP to index and query these complex relationships, further enhancing the system's analytical capabilities.

**Enabling Decentralized Decision-Making:** By standardizing how value and decisions are quantified, IPSP supports a decentralized decision-making process across the Newcoin network. This approach diminishes central points of control or failure, distributing authority and autonomy across the network, which aligns with the decentralized and open-source philosophy of Newcoin.

With IPSP, humans and machines have a shared language to represent value. Machines can discern good content fromn noise, real users from bots, by having access to verifiable digital footprints in the form of anonymous numerical values, or points.

IPSP brings the fungibility and universality of money, with the utility of graphs and attestations to unlock the next frontier for a decentralized Internet.

With IPSP, you can travel the Internet with your own graph and have it recoignized by any application which can use it to better understand you, your taste, preferences, how you see the world and how the world sees you, in an agent-centric, privacy-preserving way.

The IPSP data construct is derived from the verifiable credentials and blockchain assets primitives and take sthe best of Schema.org and ActivityStreams which are well known W3C standards. 

It looks like this:

![image](https://github.com/newfound8ion/developer/assets/112469623/2c68aa64-5258-48db-9355-2d9b9b4ba086)




Now where it gets fascinating is that it not only unlocks a fully interoperable and open Agent Graph fixing cold-starts problems, vendor lock-ins and sunk cost for users, it also creates a massive dataset of behavioural data and a shared language between machine learning agents, unlocking a truly decentralized and intelligent hypernetwork on top of which decentralized AI (DeAI) can thrive, alongside many powerful use cases such as reputation, sybil resistance, collaborative filtering, data science and many more.

IPSP has currently two implementations:

- **[Onchain Points](/docs/ipsp/onchain-points/overview)**
Onchain Points are non-transferable (soulbound) numerical (fungible) tokens that can be read by smart contracts using the rails of ERC-20 to unlock a wide range of use cases for onchain applications.

- **[Verifiable Points](/docs/ipsp/verifiable-points/overview)**
Verifiable Points are offchain but cryptographically signed and therefore verifiable, using the rails of SSI and attestations. You can query them from Ceramic via OrbisDB.
