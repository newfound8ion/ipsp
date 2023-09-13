const { ethers, network } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");

async function main() {
  const { config } = network;
  const contractAddress = config.powerUpScorerContract;

  if (!contractAddress) {
    throw new Error("No contract address found");
  }

  const contract = await ethers.getContractAt("PowerUpScorer", contractAddress);

  const powerUpScore = parseEther("1");
  const dailyEnergyScore = parseEther("1");
  const experienceScore = parseEther("1");

  const currentPowerUpScore = await contract.powerUpScore();
  const currentDailyEnergyScore = await contract.dailyEnergyScore();
  const currentExperienceScore = await contract.experienceScore();

  if (!powerUpScore.eq(currentPowerUpScore)) {
    const tx = await contract.setPowerUpScore(powerUpScore);
    await tx.wait();
    console.log(`PowerUpScore set to ${powerUpScore}`);
  } else {
    console.log(`PowerUpScore already set to ${powerUpScore}`);
  }

  if (!dailyEnergyScore.eq(currentDailyEnergyScore)) {
    const tx = await contract.setDailyEnergyScore(dailyEnergyScore);
    await tx.wait();
    console.log(`DailyEnergyScore set to ${dailyEnergyScore}`);
  } else {
    console.log(`DailyEnergyScore already set to ${dailyEnergyScore}`);
  }

  if (!experienceScore.eq(currentExperienceScore)) {
    const tx = await contract.setExperienceScore(experienceScore);
    await tx.wait();
    console.log(`ExperienceScore set to ${experienceScore}`);
  } else {
    console.log(`ExperienceScore already set to ${experienceScore}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
