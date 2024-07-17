# Immutable Points

Newcoin uses the Immutable Points Standard protocol (IPSP) as a serialization and normalization layer between all the heterogenous value statements on the internet and the Agent Graph, representing agents by their DiDs, units of content are represented by Open Graph objects and edges are Immutable Points as described in the Immutable Points Standard Protocol, which itself is referencing standards from Verifiable Credentials, Activity Streams and Schema.org. 


IPSP is like the RSS feed of how agents relate to other nodes in the Agent Graph, providing a standardized schema for value statements. IPSP is a technology-agnostic standard schema, similar to verifiable credentials, ERC-20 or NFTs, which can be bridged or proven regardless of the platform, programming language or communication protocol. 


Points are verifiable data constructs similar to emails, where both the issuer and the subject have access to the data, and can present it to third parties (verifiers) with a cryptographic signature or the blockchain state itself, making it an overarching trust network that transcends all the technical fragmentation of identity systems, social graphs and blockchains. 

![image](https://github.com/newfound8ion/developer/assets/112469623/7eca9eb8-b12a-47a9-8597-5b8d093f0ae0)


With IPSP, all relationships between nodes are numbers with context files following the JLD semantic formatting. For maximum interoperability, the credential edges are primarily numerical: Immutable Points, and represent how agents value any node in the agent graph, where each agent issues points that represent how they value a node, similar to a like, a rating, a vote, a positive sentiment about such nodes (static or agentic). 


The credentials can link to context files with a standardised and controlled vocabulary made of linked data JLD files that serve as contextual registry for edges. 

This lightweight protocol aims to be more of an open index, akin to the Google knowledge graph, than a platform. It indexes and serialises existing relationships from public data records such as social graphs and blockchains, to establish a map, and allows owners of accounts to claim ownership of their credentials to accrue reputation and claim benefits derived from sybil resistance. 

Application developers can also decide to natively comply with the standard and automatically inherit from the vast amount of nodes and edges that exist, hereby solving the cold start problem and joining a deep inter-platform network effect.
