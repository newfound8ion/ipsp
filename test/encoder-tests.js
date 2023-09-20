const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Encoder Test", function () {
  let poC;

  let contract;

  let energyMinterMock;

  let voteActivationFunction;
  let voteActivationFunctionAddress;

  let deployerAddress;
  let user1Address;
  let user2Address;

  beforeEach(async function () {
    [deployer, regularUser, user1, user2] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    const EnergyMinterMock = await ethers.getContractFactory(
      "EnergyMinterMock"
    );
    energyMinterMock = await EnergyMinterMock.deploy();

    const NewcoinEncoder = await ethers.getContractFactory("NewcoinEncoder");
    contract = await upgrades.deployProxy(
      NewcoinEncoder,
      [energyMinterMock.address],
      {
        initialize: "initialize",
      }
    );

    const VoteActivationFunction = await ethers.getContractFactory(
      "SimpleVoteActivationFunction"
    );
    voteActivationFunction = await VoteActivationFunction.deploy(2);
    voteActivationFunctionAddress = voteActivationFunction.address;

    await contract.deployed();
  });

  describe("Setup", async function () {
    it("should throw an error when trying initialize twice", async function () {
      await expect(
        contract.initialize(energyMinterMock.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("should check initial setup", async function () {
      expect(await contract.owner()).to.equal(deployerAddress); // Assuming user1 is the deployer
      expect(await voteActivationFunction.requiredVotes()).to.equal(2);
    });

    it("should create an activation function and return ID 0", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;
      console.log(
        "voteActivationFunctionAddress:",
        voteActivationFunctionAddress
      );
      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      const activationFunctionId = event?.args ? event.args[0] : null;
      console.log("Activation Function ID:", activationFunctionId);
      console.log(activationFunctionId);
      expect(activationFunctionId).to.equal(0);
    });

    it("should approve an activation function", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;
      console.log(
        "voteActivationFunctionAddress:",
        voteActivationFunctionAddress
      );

      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );
      const receipt = await tx.wait();

      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      const activationFunctionId = event?.args ? event.args[0] : null;
      await contract.approveActivationFunction(activationFunctionId);
      const activationFunction = await contract.activationFunctions(
        activationFunctionId
      );
      expect(activationFunction.approved).to.be.true;
    });

    it("should not meet the vote requirement initially", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;

      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );
      const receipt = await tx.wait();

      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );
      const activationFunctionId = event?.args ? event.args[0] : null;

      await expect(contract.activate(activationFunctionId)).to.be.revertedWith(
        "activationFunction not approved"
      );
    });

    it("should meet the vote requirement after 2 votes", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;

      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      if (!event || !event.args)
        throw new Error(
          "ActivationFunctionRegistered event not found or missing arguments"
        );
      const activationFunctionId = event.args[0];

      await contract.approveActivationFunction(activationFunctionId);

      await voteActivationFunction.vote();
      await voteActivationFunction.vote();

      await contract.activate(activationFunctionId);
    });

    it("should fail activation without approval even if vote requirements are met", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;

      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      if (!event || !event.args)
        throw new Error(
          "ActivationFunctionRegistered event not found or missing arguments"
        );
      const activationFunctionId = event.args[0];

      await voteActivationFunction.vote();
      await voteActivationFunction.vote();

      await expect(contract.activate(activationFunctionId)).to.be.revertedWith(
        "activationFunction not approved"
      );
    });

    it("should mint watts after activation function approval", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Test Context";
      const weightInWatt = 100;

      const tx = await contract.registerActivationFunction(
        0,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt
      );
      const receipt = await tx.wait();

      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      if (!event || !event.args)
        throw new Error(
          "ActivationFunctionRegistered event not found or missing arguments"
        );
      const activationFunctionId = event.args[0];

      await contract.approveActivationFunction(activationFunctionId);

      await voteActivationFunction.vote();
      await voteActivationFunction.vote();

      const canMint = await contract.canMint(activationFunctionId);
      if (canMint) {
        await contract.activate(activationFunctionId);
      }

      const balance = await energyMinterMock.balanceOfEnergy(
        deployerAddress,
        1
      );
      expect(balance).to.equal(weightInWatt * multiplier);
    });
  });
});
