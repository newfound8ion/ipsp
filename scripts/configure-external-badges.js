const { ethers, network } = require("hardhat");
const { NWATT, VWATT } = require("../test/test-utils");
const { keccak256, toUtf8Bytes } = require("ethers/lib/utils");

async function main() {
  const { config } = network;
  const contractAddress = config.externalScorerContract;
  const externalBadgeSignerAddress = config.externalBadgeSignerAddress;

  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  if (!externalBadgeSignerAddress) {
    throw new Error("No external badge signer address found");
  }

  const contract = await ethers.getContractAt(
    "ExternalBadgeScorer",
    contractAddress
  );
  const badges = [
    {
      sourceId: keccak256(toUtf8Bytes("twitter")),
      energyId: NWATT,
      multiplier: 100000,
      mode: 0,
      signerAddress: externalBadgeSignerAddress,
    },
    {
      sourceId: keccak256(toUtf8Bytes("gitcoin")),
      energyId: VWATT,
      multiplier: 100,
      mode: 0,
      signerAddress: externalBadgeSignerAddress,
    },
    {
      sourceId: keccak256(toUtf8Bytes("twitterVerification")),
      energyId: VWATT,
      multiplier: 1,
      mode: 0,
      signerAddress: externalBadgeSignerAddress,
    },
    {
      sourceId: keccak256(toUtf8Bytes("twitterBlue")),
      energyId: VWATT,
      multiplier: 1,
      mode: 0,
      signerAddress: externalBadgeSignerAddress,
    },
    {
      sourceId: keccak256(toUtf8Bytes("twitterFollowers")),
      energyId: NWATT,
      multiplier: 1,
      mode: 0,
      signerAddress: externalBadgeSignerAddress,
    },
  ];

  for (const {
    sourceId,
    energyId,
    multiplier,
    mode,
    signerAddress,
  } of badges) {
    const [currentEnergyId, currentMultiplier, currentMode] =
      await contract.externalSources(sourceId);
    const isUpToDate =
      currentEnergyId &&
      currentEnergyId === energyId &&
      currentMode === mode &&
      currentMultiplier === multiplier;
    if (!isUpToDate) {
      const tx = await contract.setExternalSource(
        sourceId,
        energyId,
        multiplier,
        mode
      );
      await tx.wait();
      console.log(
        `Badge ${sourceId} added for energy ${energyId} and multiplier ${multiplier}`
      );
    } else {
      console.log(
        `Badge ${sourceId} already added for energy ${energyId} and multiplier ${multiplier}`
      );
    }

    // Add Signers
    const isSignerAdded = await contract.authorizedSigners(
      sourceId,
      signerAddress
    );

    if (!isSignerAdded) {
      const tx = await contract.addAuthorizedSigner(sourceId, signerAddress);
      await tx.wait();
      console.log(`Signer ${signerAddress} added for badge ${sourceId}`);
    } else {
      console.log(
        `Signer ${signerAddress} already added for badge ${sourceId}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
