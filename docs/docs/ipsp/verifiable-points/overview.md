# Overview

Verifiable Points constitute an offchain implementation of the Immutable Points Standard Protocol (IPSP), ingeniously leveraging the rails of the Self-Sovereign Identity (SSI) stack, particularly Verifiable Credentials (VCs) and JSON-LD. This offchain approach emphasizes privacy, scalability, and user autonomy by leveraging cryptographic verifiability.

## What are Verifiable Points?

Verifiable Points represent a non-monetary marker of value. Unlike onchain points, which are native to blockchain and directly interactable by smart contracts, Verifiable Points operate offchain and utilize SSI principles to ensure user-centric control and privacy. They can be implemented using various SSI stack providers, with the stipulation of adhering to specific data schemas for consistency and verifiability of the points.

The essence of Verifiable Points lies in their cryptographic signatures, which anchor their integrity, allowing for verifiable and selective sharing of credentials without disclosing the entirety of the user's identity or data.

### Implementation with Ceramic and OrbisDB

While Verifiable Points can be instantiated via any SSI framework that complies with their defined schema, our primary implementation leverages Ceramic through OrbisDB. This integration enables decentralized management and interoperable usage of Verifiable Points across platforms, maintaining user privacy and control.

## Advantages of Verifiable Points

### Privacy and Selective Disclosure

Verifiable Points uphold the privacy of the individual, affording them the capacity for selective disclosure. This means that users can prove the possession of certain credentials or points without revealing the credential itself, courtesy of Zero-Knowledge Proofs (ZKPs).

### Scalability and User Control

Since Verifiable Points operate offchain, they sidestep the scalability concerns commonly associated with blockchain transactions. This ensures a seamless and efficient experience, even as the network or user base grows. User control is paramount, with individuals having complete authority over their points and related data.

### Interoperability with Smart Contracts

Verifiable Points, while inherently offchain, can still interact with smart contracts. This interaction is facilitated by ZKPs, allowing users to partake in blockchain-based systems and transactions without compromising their privacy.

### Machine Learning Computation

A futuristic advantage of Verifiable Points is their compatibility with machine learning algorithms. These points can be processed and analyzed by AI to derive insights or patterns without exposing the underlying credentials or sensitive data, thus preserving user anonymity and data confidentiality.

## Choosing Verifiable Points Over Onchain Points

The selection between Verifiable Points and onchain points pivots on the use case at hand:

- **For privacy-sensitive applications** where user autonomy is critical, Verifiable Points are ideal due to their offchain nature, which offers greater control over data sharing and scalability.
  
- **For applications requiring direct blockchain interaction**, such as those leveraging smart contract functionality for automated point allocation or redemption, onchain points may be more suitable.

The IPSP framework is designed to be versatile, accommodating various use cases and preferences, with the ultimate goal of fostering a standardized, open, and interoperable environment for digital points management.

