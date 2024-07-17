const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const { toUtf8Bytes, keccak256, hexZeroPad } = ethers.utils;
const { NWATT, VWATT, CWATT, generateSignature } = require("./test-utils");

const domain = {
  name: "ExternalBadgeScorer",
  version: "1",
};
const types = {
  RedeemRequest: [
    { name: "owner", type: "address" },
    { name: "id", type: "bytes32" },
    { name: "externalSourceId", type: "bytes32" },
    { name: "score", type: "uint256" },
    { name: "uid", type: "bytes32" },
  ],
};

const twitterSourceId = keccak256(toUtf8Bytes("twitter"));
const gitcoinSourceId = keccak256(toUtf8Bytes("gitcoin"));

describe("Badge Scorer Test", function () {
  let contract;
  let energyMinter;
  let deploy;

  let regularUser;
  let user1;
  let user2;
  let signer;

  let user1Address;
  let user2Address;

  // Signer to test
  const signerAddress = "0x314c6dE7aBF8f0e92A5Eb3e0B6d7703402cECa12";
  const signerPrivateKey =
    "0x12e6d043791d845ec3b17300b0581066c2b505e1cf04032f089129a4f8f8c2db";

  const testNftContract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

  beforeEach(async function () {
    [, regularUser, user1, user2, signer] = await ethers.getSigners();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    // Deploy energy minter
    const EnergyMinter = await ethers.getContractFactory("EnergyMinterMock");
    energyMinter = await EnergyMinter.deploy();

    // Depoy badge scorer
    const ExternalBadgeScorer = await ethers.getContractFactory(
      "ExternalBadgeScorer"
    );
    contract = await upgrades.deployProxy(
      ExternalBadgeScorer,
      [energyMinter.address],
      {
        initializer: "initialize",
      }
    );

    deploy = await contract.deployed();

    const nftSourceId = hexZeroPad(testNftContract, 32);

    // Setup sources
    await contract.setExternalSource(
      twitterSourceId,
      NWATT,
      BigNumber.from(1000000),
      0
    );
    await contract.setExternalSource(
      gitcoinSourceId,
      VWATT,
      BigNumber.from(100),
      0
    );
    await contract.setExternalSource(
      nftSourceId,
      CWATT,
      BigNumber.from(100),
      0
    );

    // Setup signers
    await contract.addAuthorizedSigner(twitterSourceId, signerAddress);
    await contract.addAuthorizedSigner(gitcoinSourceId, signerAddress);
    await contract.addAuthorizedSigner(nftSourceId, signerAddress);
  });

  describe("Setup", async function () {
    it("should throw an error when trying initialize twice", async function () {
      await expect(
        contract.initialize(energyMinter.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Sources management", async function () {
    it("should add a new source", async function () {
      const sourceId = keccak256(toUtf8Bytes("discord"));
      const energyId = 1;
      const multiplier = BigNumber.from(100);
      const mode = 10;
      const tx = await contract.setExternalSource(
        sourceId,
        energyId,
        multiplier,
        mode
      );

      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("ExternalSourceAdded");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.sourceId).to.equal(sourceId);
      expect(event.args.energyId).to.equal(energyId);
      expect(event.args.multiplier).to.equal(multiplier);

      const [resultEnergyId, resultMultiplier, resultMode] =
        await contract.externalSources(sourceId);
      expect(resultEnergyId).to.equal(energyId);
      expect(resultMultiplier).to.equal(multiplier);
      expect(resultMode).to.equal(mode);
    });

    it("should remove an existing source", async function () {
      const sourceId = keccak256(toUtf8Bytes("discord"));
      const energyId = NWATT;
      await contract.setExternalSource(
        sourceId,
        energyId,
        BigNumber.from(100),
        0
      );

      const tx = await contract.removeExternalSource(sourceId);
      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("ExternalSourceRemoved");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.sourceId).to.equal(sourceId);

      const [resultEnergyId, resultMultiplier] = await contract.externalSources(
        sourceId
      );
      expect(resultEnergyId).to.equal(0);
      expect(resultMultiplier).to.equal(0);
    });

    it("should throw an error when trying to add a source with unauthorized address", async function () {
      const sourceId = keccak256(toUtf8Bytes("discord"));
      await expect(
        contract
          .connect(regularUser)
          .setExternalSource(sourceId, NWATT, BigNumber.from(100), 0)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw an error when trying to remove a source with unauthorized address", async function () {
      const sourceId = keccak256(toUtf8Bytes("twitter"));
      await expect(
        contract.connect(regularUser).removeExternalSource(sourceId)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Signers management", async function () {
    it("should add a new signer", async function () {
      await contract.addAuthorizedSigner(twitterSourceId, signer.address);

      expect(
        await contract.authorizedSigners(twitterSourceId, signer.address)
      ).to.equal(true);
    });

    it("should remove an existing signer", async function () {
      await contract.addAuthorizedSigner(twitterSourceId, signer.address);

      await contract.removeAuthorizedSigner(twitterSourceId, signer.address);
      expect(
        await contract.authorizedSigners(twitterSourceId, signer.address)
      ).to.equal(false);
    });

    it("should throw an error when trying to add a signer with unauthorized address", async function () {
      await expect(
        contract
          .connect(regularUser)
          .addAuthorizedSigner(twitterSourceId, signer.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(
        await contract.authorizedSigners(twitterSourceId, signer.address)
      ).to.equal(false);
    });

    it("should throw an error when trying to remove a signer with unauthorized address", async function () {
      await contract.addAuthorizedSigner(twitterSourceId, signer.address);

      await expect(
        contract
          .connect(regularUser)
          .removeAuthorizedSigner(twitterSourceId, signer.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Redeem", async function () {
    it("should redeem badges for a user", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      // Check event is emmited
      await expect(contract.redeem(request, signature))
        .to.emit(contract, "BadgeRedeemed")
        .withArgs(
          externalSourceId,
          id,
          user1Address,
          BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
          NWATT,
          BigNumber.from(50000000).mul(BigNumber.from(10).pow(18))
        );

      expect(await contract.redeemedBadges(externalSourceId, id)).to.equal(
        true
      );
      expect(await energyMinter.balances(user1Address, NWATT)).to.equal(
        BigNumber.from(50000000).mul(BigNumber.from(10).pow(18))
      );
    });

    it("should redeem an NFT badge for a user", async function () {
      const id = hexZeroPad(BigNumber.from(1).toHexString(), 32);
      const externalSourceId = hexZeroPad(testNftContract.toLowerCase(), 32);
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(1).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      await contract.redeem(request, signature);

      expect(await contract.redeemedBadges(externalSourceId, id)).to.equal(
        true
      );
      expect(await energyMinter.balances(user1Address, CWATT)).to.equal(
        BigNumber.from(100).mul(BigNumber.from(10).pow(18))
      );
    });

    it("should throw an error when trying to redeem badges for a user with unauthorized signer", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      const wallet = ethers.Wallet.createRandom();
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        wallet.privateKey,
        deploy.address
      );

      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "InvalidSignature"
      );
    });

    it("should throw an error when trying to redeem badges twice with the same signature", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      await contract.redeem(request, signature);
      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "InvalidSignature"
      );
    });

    it("should throw an error when trying to redeem badges with tampered score parameters", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      request[3] = 100;
      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "InvalidSignature"
      );
    });

    it("should throw an error when trying to redeem badges with tampered owner parameters", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      request[0] = user2Address;
      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "InvalidSignature"
      );
    });

    it("should throw an error when trying to redeem a badge twice", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("twitter"));
      let { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      await contract.redeem(request, signature);

      ({ request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      ));

      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "AlreadyRedeemed"
      );
    });

    it("should throw an error when trying to redeem an unknown source", async function () {
      const id = keccak256(toUtf8Bytes("someguy"));
      const externalSourceId = keccak256(toUtf8Bytes("discord"));
      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          owner: user1Address,
          id,
          externalSourceId,
          score: BigNumber.from(50).mul(BigNumber.from(10).pow(18)),
        },
        signerPrivateKey,
        deploy.address
      );

      await expect(contract.redeem(request, signature)).to.be.revertedWith(
        "UnknownSource"
      );
    });
  });
});
