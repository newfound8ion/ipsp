# Overview

Base points are a special kind of Immutable Points. While they follow the exact same technical specification as any other onchain implementation of IPSP, the magic happens in the process that lead to their creation.

By querying Base Points, you are asynchronously querying all the points of a specific user, weighted and measured by the Newkamoto Consensus algorithm, which aggregates all the points from all agents including all the machine learning agents.

This consensus between agents allows you to not only get a full picture of a specific node within the Agent Graph, but to benefit from all the machine learning computations, for free, with a few lines of code.

Since Base Points are onchain, you can use them as parameters within your smart contracts and turn your decentralized application into a, yet immutable and credibly neutral, adaptive learning system.

And because Base Points are designed with the same interface as ERC-20, most of the business logic that used to work with tokens can now work with Base Points.

It means, you can build an Aragon DAO with basic token voting and use Immutable Points and Base Points instead of tokens. 

You can query WATT or IWATT balances to let the Internet decide if a user can mint NFTs and be featured on the homepage, in a fully permissionless way.

All the token-gating primitives can now apply to Base Points.

You can also use Base Points as a layer of protection against abuses and manipulations within your own Points system.

Here is a diagram of how Base Points are calculated:

![image](https://github.com/newfound8ion/developer/assets/112469623/941ebc1a-2257-44d9-82ff-eb645b000c06)
