const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { PWATT, LWATT, XWATT } = require("./test-utils.js");

describe("PowerUpScorer", function () {
  let EnergyMinter,
    PowerUpScorer,
    energyMinter,
    powerUpScorer,
    deployer,
    user1,
    user2,
    user3,
    user4,
    user5,
    user6,
    user7,
    user8,
    user9,
    user10,
    user11,
    user12;

  before(async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Set the date to tomorrow
    date.setUTCHours(0, 0, 0, 0); // Set the date to midnight
    await time.setNextBlockTimestamp(date.getTime() / 1000);
  });

  beforeEach(async () => {
    [
      deployer,
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
      user12,
    ] = await ethers.getSigners();

    // Deploy and initialize the mock EnergyMinter contract
    EnergyMinter = await ethers.getContractFactory("EnergyMinterMock");
    energyMinter = await EnergyMinter.deploy();
    await energyMinter.deployed();

    // Deploy and initialize the PowerUpScorer contract
    PowerUpScorer = await ethers.getContractFactory("PowerUpScorer");
    powerUpScorer = await upgrades.deployProxy(PowerUpScorer, [
      energyMinter.address,
    ]);
    await powerUpScorer.deployed();

    // Mint NWATT tokens to the users
    await energyMinter.mint(user1.address, 4, ethers.utils.parseEther("100"));
  });

  describe("initialize", function () {
    it("should properly initialize the contract", async function () {
      expect(await powerUpScorer.owner()).to.equal(deployer.address);
      expect(await powerUpScorer.powerUpScore()).to.equal(
        ethers.utils.parseEther("1")
      );
    });

    it("should no longer be possible to initialize the contract", async function () {
      await expect(
        powerUpScorer.initialize(energyMinter.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("setPowerUpScore", function () {
    it("should update the powerUpScore", async function () {
      await powerUpScorer.setPowerUpScore(ethers.utils.parseEther("20"));
      expect(await powerUpScorer.powerUpScore()).to.equal(
        ethers.utils.parseEther("20")
      );
    });

    it("should revert if called by a non-owner", async function () {
      await expect(
        powerUpScorer
          .connect(user1)
          .setPowerUpScore(ethers.utils.parseEther("20"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setDailyEnergyScore", function () {
    it("should update the dailyEnergyScore", async function () {
      await powerUpScorer.setDailyEnergyScore(ethers.utils.parseEther("20"));
      expect(await powerUpScorer.dailyEnergyScore()).to.equal(
        ethers.utils.parseEther("20")
      );
    });

    it("should revert if called by a non-owner", async function () {
      await expect(
        powerUpScorer
          .connect(user1)
          .setDailyEnergyScore(ethers.utils.parseEther("20"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setExperienceScore", function () {
    it("should update the experienceScore", async function () {
      await powerUpScorer.setExperienceScore(ethers.utils.parseEther("20"));
      expect(await powerUpScorer.experienceScore()).to.equal(
        ethers.utils.parseEther("20")
      );
    });

    it("should revert if called by a non-owner", async function () {
      await expect(
        powerUpScorer
          .connect(user1)
          .setExperienceScore(ethers.utils.parseEther("20"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("powerUp", function () {
    beforeEach(async () => {
      // Mint CWATT tokens to the users
      await energyMinter.mint(user1.address, 1, ethers.utils.parseEther("10"));
    });

    it("should power up a user", async function () {
      await powerUpScorer.connect(user1).powerUp(user2.address);

      expect(
        await powerUpScorer.powerUps(user1.address, user2.address)
      ).to.equal(true);

      expect(await energyMinter.balances(user2.address, PWATT)).to.equal(
        ethers.utils.parseEther("11")
      );
    });

    it("should emit a PoweredUp event", async function () {
      await expect(powerUpScorer.connect(user1).powerUp(user2.address))
        .to.emit(powerUpScorer, "PoweredUp")
        .withArgs(user1.address, user2.address, ethers.utils.parseEther("11"));
    });

    it("should revert if the user has already been powered up", async function () {
      await powerUpScorer.connect(user1).powerUp(user2.address);
      await expect(
        powerUpScorer.connect(user1).powerUp(user2.address)
      ).to.be.revertedWith("AlreadyPoweredUp");
    });

    it("should revert if the user has not enough CWATT tokens", async function () {
      await expect(
        powerUpScorer.connect(user2).powerUp(user3.address)
      ).to.be.revertedWith("NotEnoughCWATT");
    });

    it("should mint daily energy if a day havs passed since the last power up", async function () {
      // First power up
      await powerUpScorer.connect(user1).powerUp(user2.address);
      await powerUpScorer.setExperienceScore(ethers.utils.parseEther("0"));

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("1")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user3.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("3")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user4.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("6")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user5.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("10")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user6.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("15")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user7.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("21")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user8.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("28")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user9.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("36")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user10.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("45")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user11.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("55")
      );

      await time.increase(24 * 60 * 60 + 1); // Advance 24 hours and 1 second
      await powerUpScorer.connect(user1).powerUp(user12.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("65")
      );
    });

    it("should not mint daily energy if less than 24 hours have passed since the last power up", async function () {
      await powerUpScorer.connect(user1).powerUp(user2.address);
      await time.increase(23 * 60 * 60); // Advance 23 hours
      await powerUpScorer.connect(user1).powerUp(user3.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("1")
      );
    });

    it("should reset the streak if more than 2 days have passed since last powerup", async function () {
      await powerUpScorer.connect(user1).powerUp(user2.address);
      await time.increase(48 * 60 * 60 + 1); // Advance 48 hours plus 1 second
      await powerUpScorer.connect(user1).powerUp(user3.address);

      expect(await energyMinter.balances(user1.address, LWATT)).to.equal(
        ethers.utils.parseEther("2")
      );
    });

    it("should revert if the user tries to power up themselves", async function () {
      await expect(
        powerUpScorer.connect(user1).powerUp(user1.address)
      ).to.be.revertedWith("InvalidRecipient");
    });

    it("should revert if the user tries to power up the zero address", async function () {
      await expect(
        powerUpScorer.connect(user1).powerUp(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidRecipient");
    });

    it("should mint experience energy if the user reached a milestone", async function () {
      // First powerup should mint experience energy
      await powerUpScorer.connect(user1).powerUp(user2.address);
      expect(await energyMinter.balances(user1.address, XWATT)).to.equal(
        ethers.utils.parseEther("1")
      );

      await powerUpScorer.connect(user1).powerUp(user3.address);
      await powerUpScorer.connect(user1).powerUp(user4.address);
      await powerUpScorer.connect(user1).powerUp(user5.address);

      expect(await energyMinter.balances(user1.address, XWATT)).to.equal(
        ethers.utils.parseEther("1")
      );

      // Fifth powerup should mint experience energy
      await powerUpScorer.connect(user1).powerUp(user6.address);

      expect(await energyMinter.balances(user1.address, XWATT)).to.equal(
        ethers.utils.parseEther("6")
      );

      // Power up 5 more times
      await powerUpScorer.connect(user1).powerUp(user7.address);
      await powerUpScorer.connect(user1).powerUp(user8.address);
      await powerUpScorer.connect(user1).powerUp(user9.address);
      await powerUpScorer.connect(user1).powerUp(user10.address);

      expect(await energyMinter.balances(user1.address, XWATT)).to.equal(
        ethers.utils.parseEther("6")
      );

      await powerUpScorer.connect(user1).powerUp(user11.address);

      expect(await energyMinter.balances(user1.address, XWATT)).to.equal(
        ethers.utils.parseEther("16")
      );
    });
  });
});
