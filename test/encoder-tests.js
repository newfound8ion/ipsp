const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Encoder Test", function () {
  let poC;

  let contract;

  let energyMinterMock;

  let voteActivationFunction;
  let voteActivationFunctionAddress;

  let NTSyncActivationFunction;
  let NTSyncActivationFunctionAddress;

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

    const nTSyncActivationFunction = await ethers.getContractFactory(
      "NTSyncResponder"
    );
    NTSyncActivationFunction = await nTSyncActivationFunction.deploy(
      deployerAddress
    );
    NTSyncActivationFunctionAddress = NTSyncActivationFunction.address;

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
      console.log("contextId", contextId);
      const context = "Test Context";
      const weightInWatt = 100;
      const tx = await contract.registerActivationFunction(
        6,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );

      const activationFunctionId = event?.args ? event.args[0] : null;
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

      const tx = await contract.registerActivationFunction(
        3,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
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
        2,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
      );
      const receipt = await tx.wait();

      const event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );
      const activationFunctionId = event?.args ? event.args[0] : null;

      await expect(
        contract.activate(activationFunctionId, deployerAddress, 0)
      ).to.be.revertedWith("ActivationFunction not approved");
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
        5,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
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

      await contract.activate(activationFunctionId, deployerAddress, 0);
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
        3,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
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

      await expect(
        contract.activate(activationFunctionId, deployerAddress, 0)
      ).to.be.revertedWith("ActivationFunction not approved");
    });

    it("should not allow non-owners to approve an activation function", async function () {
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
        7,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
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

      await expect(
        contract.connect(user1).approveActivationFunction(activationFunctionId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
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
        1,
        multiplier,
        contextId,
        context,
        voteActivationFunctionAddress,
        weightInWatt,
        false,
        false
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
        await contract.activate(activationFunctionId, deployerAddress, 0);
      }

      const balance = await energyMinterMock.balanceOfEnergy(
        deployerAddress,
        1
      );
      expect(balance).to.equal(weightInWatt * multiplier);
    });

    it("should mint watts with dynamic amount after activation function approval", async function () {
      const multiplier = 2;
      const contextId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [deployerAddress, Math.floor(Date.now() / 1000)]
        )
      );
      const context = "Dynamic Amount Test Context";
      const weightInWatt = 100;

      // Registering activation function with the final parameter set to true
      const tx = await contract.registerActivationFunction(
        1,
        multiplier,
        contextId,
        context,
        NTSyncActivationFunctionAddress,
        weightInWatt,
        false,
        true // Setting dynamic amount to true
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

      const canMint = await contract.canMint(activationFunctionId);
      if (canMint) {
        await contract.activate(activationFunctionId, deployerAddress, 10);
      }

      // Checking the balance to assert the minting occurred with dynamic amount
      const balance = await energyMinterMock.balanceOfEnergy(
        deployerAddress,
        1
      );
      expect(balance).to.equal(10);
    });

    it("should register, approve, and bulk mint with AddressListActivationFunction", async function () {
      const AddressListActivationFunction = await ethers.getContractFactory(
        "AddressListActivationFunction"
      );
      const addressListActivationFunction =
        await AddressListActivationFunction.deploy();
      const addressListActivationFunctionAddress =
        addressListActivationFunction.address;

      // Approve a list of addresses in the activation function
      await addressListActivationFunction.approveAddresses([
        user1Address,
        user2Address,
      ]);

      // Register the activation function in NewcoinEncoder
      let tx = await contract.registerActivationFunction(
        1, // WattTyp
        1, // Multiplier
        ethers.utils.formatBytes32String("test"), // contextId
        "Test Context", // context
        addressListActivationFunctionAddress,
        100, // weightInWatt
        false, // isAsync
        false // dynamicAmount
      );
      let receipt = await tx.wait();
      let event = receipt.events?.find(
        (e) => e.event === "ActivationFunctionRegistered"
      );
      let activationFunctionId = event.args[0];

      // Approve the activation function
      await contract.approveActivationFunction(activationFunctionId);

      // Perform bulk mint
      await contract.bulkMintToAddresses(
        [activationFunctionId, activationFunctionId],
        [user1Address, user2Address],
        [50, 75] // Amounts to mint
      );

      // Check balances
      let balanceUser1 = await energyMinterMock.balanceOfEnergy(
        user1Address,
        1
      );
      let balanceUser2 = await energyMinterMock.balanceOfEnergy(
        user2Address,
        1
      );

      expect(balanceUser1).to.equal(50);
      expect(balanceUser2).to.equal(75);
    });
  });
});
