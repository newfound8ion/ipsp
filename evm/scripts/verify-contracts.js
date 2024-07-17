const { network, run, ethers } = require("hardhat");

async function verify(spec, contract, args = []) {
  try {
    await run("verify:verify", {
      address: spec.contractAddress,
      contract,
      constructorArguments: args,
    });
  } catch (e) {
    if (
      e.message.includes("Contract source code already verified") ||
      e.message.includes("Already Verified")
    ) {
      console.log(`Contract ${spec.contractAddress} already verified`);
      return;
    }
    throw e;
  }
}

async function main() {
  const contractAddress = network.config.contract;
  const externalScorerContract = network.config.externalScorerContract;
  const powerUpScorerContract = network.config.powerUpScorerContract;
  const sparksContract = network.config.sparksContract;
  const inviteLinksContract = network.config.inviteLinksContract;
  const profileContract = network.config.profileContract;

  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  if (profileContract) {
    await verify(
      { contractAddress: profileContract },
      "contracts/Profile.sol:Profile",
      []
    );
  }

  if (inviteLinksContract) {
    await verify(
      { contractAddress: inviteLinksContract },
      "contracts/InviteLinks.sol:InviteLinks",
      []
    );
  }

  if (powerUpScorerContract) {
    await verify(
      { contractAddress: powerUpScorerContract },
      "contracts/PowerUpScorer.sol:PowerUpScorer",
      []
    );
  }

  if (externalScorerContract) {
    await verify(
      { contractAddress: externalScorerContract },
      "contracts/ExternalBadgeScorer.sol:ExternalBadgeScorer",
      []
    );
  }

  if (sparksContract) {
    await verify(
      { contractAddress: sparksContract },
      "contracts/Sparks.sol:Sparks",
      []
    );
  }

  await verify({ contractAddress }, "contracts/SafeEnergy.sol:SafeEnergy", []);

  const contract = await ethers.getContractAt("SafeEnergy", contractAddress);
  for (let i = 1; i <= 7; i++) {
    const tokenAddress = await contract.tokenAddresses(i);
    const tokenContract = await ethers.getContractAt("Token", tokenAddress);
    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    await verify(
      { contractAddress: tokenAddress },
      "contracts/Token.sol:Token",
      [name, symbol, contractAddress]
    );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
