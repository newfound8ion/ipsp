const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Custom Immutable Points System Tests", function() {
  let CustomImmutablePoints;
  let SimpleVoteActivationFunction;
  let deployer;
  let user1;
  let user2;

  beforeEach(async function() {
    [deployer, user1, user2] = await ethers.getSigners();

    // Deploy the SimpleVoteActivationFunction
    const SimpleVoteActivationFunctionFactory = await ethers.getContractFactory(
      "SimpleVoteActivationFunction"
    );
    SimpleVoteActivationFunction =
      await SimpleVoteActivationFunctionFactory.deploy(2); // Required votes set to 2
    await SimpleVoteActivationFunction.deployed();

    // Deploy CustomImmutablePoints
    const CustomImmutablePointsFactory = await ethers.getContractFactory(
      "CustomImmutablePoints"
    );
    CustomImmutablePoints = await CustomImmutablePointsFactory.deploy();
    await CustomImmutablePoints.deployed();

    // Register the Simple Vote Activation Function in CustomImmutablePoints contract
    await CustomImmutablePoints.registerActivationFunction(
      1,
      SimpleVoteActivationFunction.address
    );
  });

  describe("Activation Function Registration", function() {
    it("should correctly register activation functions", async function() {
      const activationFunctionId = 1;
      const registeredAddress = await CustomImmutablePoints.activationFunctions(
        activationFunctionId
      );
      expect(registeredAddress).to.equal(SimpleVoteActivationFunction.address);
    });
  });

  describe("Custom Immutable Points Issuance", function() {
    it("should issue points after activation function success", async function() {
      const activationFunctionId = 1;
      const pointsAmount = 100;
      const recipient = user1.address;

      // Vote twice to meet the activation requirement
      await SimpleVoteActivationFunction.connect(user1).vote();
      await SimpleVoteActivationFunction.connect(user2).vote();

      // Trigger points issuance
      await CustomImmutablePoints.triggerPointsIssuance(
        activationFunctionId,
        recipient,
        pointsAmount
      );

      const balance = await CustomImmutablePoints.getPointsBalance(recipient);
      expect(balance).to.equal(pointsAmount);
    });

    it("should not issue points if the activation function requirements are not met", async function() {
      const activationFunctionId = 1;
      const pointsAmount = 100;
      const recipient = user2.address;

      // Only one vote, so requirement not met
      await SimpleVoteActivationFunction.connect(user1).vote();

      // Attempt to trigger points issuance
      await expect(
        CustomImmutablePoints.triggerPointsIssuance(
          activationFunctionId,
          recipient,
          pointsAmount
        )
      ).to.be.revertedWith("Activation function failed");

      const balance = await CustomImmutablePoints.getPointsBalance(recipient);
      expect(balance).to.equal(0);
    });
  });
});
