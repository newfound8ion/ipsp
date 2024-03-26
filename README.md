# Newcoin IPSP (Immutable Points Standard Protocol)

## Overview
Newcoin IPSP represents an innovative approach in the Ethereum blockchain ecosystem, introducing a protocol for the issuance and management of non-fungible, merit-based point systems. This decentralized protocol leverages smart contract functionality to automate point distribution based on predefined criteria, integrating advanced concepts like composability, modularity, and algorithmic processing.

## Core Concepts

### Modular Architecture
IPSP's architecture is designed for high composability and modularity, allowing developers to tailor the protocol to specific use cases. It utilizes templates and parameterization to automate point issuance, aligning with various decentralized applications (dApps) requirements.

### Triggers
Triggers are fundamental mechanisms that initiate the point issuance process in IPSP:
- **Wallet Triggers**: Keypair-based triggers allowing distribution based on off-chain decisions, supported by human interaction or API integration.
- **Smart Contract Triggers**: On-chain, rule-based triggers responding to blockchain events like NFT transactions or DAO participations.
- **Oracle-Based Triggers**: These triggers extend functionality to off-chain or cross-chain data, leveraging oracle networks for diverse point issuance criteria.

### Points System
- **Issuance**: IPSP enables permissionless point creation, mirroring token balance mechanisms but emphasizing their non-transferable and non-tradeable nature.
- **Contextualization**: Points in IPSP are contextually relevant, representing specific merits. Each issuance links to a context file providing detailed information about the points, including intent, trigger parameters, and issuer credentials.

### Composability with Smart Contracts
IPSP's smart contracts can be seamlessly integrated into existing blockchain ecosystems, offering flexibility in terms of multi-signature implementations, dependency configurations, and other mechanism designs.

### Algorithmic Interactions
Points can be aggregated and processed using decentralized compute networks, enabling sophisticated computations from network centrality measures to machine learning applications.

## Repository Structure

- **[pointsBase.sol](https://github.com/newfound8ion/ipsp/blob/main/contracts/pointsBase.sol)**: The foundational smart contract for point management and activation function integration.
- **[BulkMintAF.sol](https://github.com/newfound8ion/ipsp/blob/main/contracts/BulkMintAF.sol)**: A contract facilitating bulk minting operations.
- **[Trigger Smart Contracts](https://github.com/newfound8ion/ipsp/tree/main/contracts/trigger-smart-contract)**: Directory for smart contract-based triggers.
- **[Trigger Smart Contract Oracle](https://github.com/newfound8ion/ipsp/tree/main/contracts/trigger-smart-contract-oracle)**: Directory for oracle-integrated trigger contracts.

### Key Functionalities

#### Points Balance Query
```solidity
// Solidity snippet for querying points balance
function getPointsBalance(address account) public view returns (uint256) {
    return _pointsBalances[account];
}
```

### Deployment process

Available networks: polygon, base, optimism

#### Configure developer environment

Setup Node and install requirements
```bash
nvm install v18
yarn install
```

Init network creds (for example for polygon)
```bash
export POLYGON_URL='...'
export PROD_PRIVATE_KEY='...'
```

#### Run deployment script

```bash
npx hardhat run scripts/deploy-points.js --network polygon
```

In console you will see addresses of the contracts where code deployed like
```
Contract deployed to: 0x.....
```
