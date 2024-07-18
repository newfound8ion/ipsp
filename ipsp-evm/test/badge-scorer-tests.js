const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { CWATT } = require("./test-utils");

describe("Badge Scorer Test", function () {
  let contract;
  let energyMinter;

  let Erc721Mock;
  let Erc1155Mock;

  let erc721;
  let erc1155;
  let erc721Redeemable;

  let regularUser;
  let user1;
  let user2;

  let user1Address;
  let user2Address;

  beforeEach(async function () {
    [, regularUser, user1, user2] = await ethers.getSigners();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();

    // Deploy energy minter
    const EnergyMinter = await ethers.getContractFactory("EnergyMinterMock");
    energyMinter = await EnergyMinter.deploy();

    // Deploy nft collections
    Erc721Mock = await ethers.getContractFactory("ERC721Mock");
    Erc1155Mock = await ethers.getContractFactory("ERC1155Mock");
    erc721 = await Erc721Mock.deploy();
    erc1155 = await Erc1155Mock.deploy();
    erc721Redeemable = await Erc721Mock.deploy();

    // Depoy badge scorer
    const BadgeScorer = await ethers.getContractFactory("BadgeScorer");
    contract = await upgrades.deployProxy(BadgeScorer, [energyMinter.address], {
      initializer: "initialize",
    });

    await contract.deployed();

    // Setup collections
    await contract.addERC721Collection(
      erc721.address,
      CWATT,
      ethers.BigNumber.from(10).pow(18).mul(2),
      true
    );
    await contract.addERC1155Collection(
      erc1155.address,
      CWATT,
      ethers.BigNumber.from(10).pow(18).mul(2)
    );
    await contract.addERC721Collection(
      erc721Redeemable.address,
      CWATT,
      ethers.BigNumber.from(10).pow(18).mul(2),
      false
    );
  });

  describe("Setup", async function () {
    it("should throw an error when trying initialize twice", async function () {
      await expect(
        contract.initialize(energyMinter.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("ERC721 management", async function () {
    let erc721;

    beforeEach(async function () {
      erc721 = await Erc721Mock.deploy();
    });

    it("should add a new ERC721 collection", async function () {
      const collection = erc721.address;
      const energyAmount = ethers.BigNumber.from(10).pow(18).mul(2);
      const burnable = true;
      const tx = await contract.addERC721Collection(
        erc721.address,
        CWATT,
        ethers.BigNumber.from(10).pow(18).mul(2),
        true
      );

      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("CollectionAdded");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.collection).to.equal(collection);
      expect(event.args.energyId).to.equal(CWATT);
      expect(event.args.energyAmount).to.equal(energyAmount);
      expect(event.args.burnable).to.equal(burnable);

      expect(await contract.erc721Collections(erc721.address)).to.equal(true);
      expect(await contract.collectionEnergyIds(erc721.address)).to.equal(1);
      expect(await contract.collectionEnergyAmounts(erc721.address)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(2)
      );
      expect(await contract.collectionBurnable(erc721.address)).to.equal(true);
    });

    it("should remove an existing ERC721 collection", async function () {
      const collection = erc721.address;
      await contract.addERC721Collection(
        collection,
        CWATT,
        ethers.BigNumber.from(10).pow(18).mul(2),
        true
      );

      const tx = await contract.removeERC721Collection(collection);
      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("CollectionRemoved");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.collection).to.equal(collection);

      expect(await contract.erc721Collections(collection)).to.equal(false);
      expect(await contract.collectionEnergyIds(collection)).to.equal(0);
      expect(await contract.collectionEnergyAmounts(collection)).to.equal(0);
    });

    it("should throw an error when trying to add an ERC721 collection with unauthorized address", async function () {
      await expect(
        contract
          .connect(regularUser)
          .addERC721Collection(
            erc721.address,
            CWATT,
            ethers.BigNumber.from(10).pow(18).mul(2),
            true
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw an error when trying to remove an ERC721 collection with unauthorized address", async function () {
      await contract.addERC721Collection(
        erc721.address,
        CWATT,
        ethers.BigNumber.from(10).pow(18).mul(2),
        true
      );

      await expect(
        contract.connect(regularUser).removeERC721Collection(erc721.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("ERC1155 management", async function () {
    let erc1155;

    beforeEach(async function () {
      erc1155 = await Erc1155Mock.deploy();
    });

    it("should add a new ERC1155 collection", async function () {
      const collection = erc1155.address;
      const energyAmount = ethers.BigNumber.from(10).pow(18).mul(2);
      const tx = await contract.addERC1155Collection(
        collection,
        CWATT,
        energyAmount
      );

      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("CollectionAdded");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.collection).to.equal(collection);
      expect(event.args.energyId).to.equal(CWATT);
      expect(event.args.energyAmount).to.equal(energyAmount);
      expect(event.args.burnable).to.equal(true);

      expect(await contract.erc1155Collections(collection)).to.equal(true);
      expect(await contract.collectionEnergyIds(collection)).to.equal(CWATT);
      expect(await contract.collectionEnergyAmounts(collection)).to.equal(
        energyAmount
      );
    });

    it("should remove an existing ERC1155 collection", async function () {
      const collection = erc1155.address;
      await contract.addERC1155Collection(
        collection,
        1,
        ethers.BigNumber.from(10).pow(18).mul(2)
      );

      const tx = await contract.removeERC1155Collection(collection);
      const receipt = await tx.wait();

      // Check event is emmited
      const topic = contract.interface.getEventTopic("CollectionRemoved");
      const event = receipt.events.find((e) => e.topics.includes(topic));
      expect(event.args.collection).to.equal(collection);

      expect(await contract.erc1155Collections(collection)).to.equal(false);
      expect(await contract.collectionEnergyIds(collection)).to.equal(0);
      expect(await contract.collectionEnergyAmounts(collection)).to.equal(0);
    });

    it("should throw an error when trying to add an ERC1155 collection with unauthorized address", async function () {
      await expect(
        contract
          .connect(regularUser)
          .addERC1155Collection(
            erc1155.address,
            CWATT,
            ethers.BigNumber.from(10).pow(18).mul(2)
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw an error when trying to remove an ERC1155 collection with unauthorized address", async function () {
      await contract.addERC1155Collection(
        erc1155.address,
        1,
        ethers.BigNumber.from(10).pow(18).mul(2)
      );

      await expect(
        contract.connect(regularUser).removeERC1155Collection(erc1155.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("ERC721 burning", async function () {
    it("should burn erc721 tokens and add mint energy", async function () {
      await erc721.mint(user1Address, 1);
      await erc721.mint(user2Address, 2);
      await erc721.mint(user1Address, 3);

      await erc721.connect(user1).setApprovalForAll(contract.address, true);
      await erc721.connect(user2).setApprovalForAll(contract.address, true);

      await contract.connect(user1).burnERC721(erc721.address, 1);
      await contract.connect(user2).burnERC721(erc721.address, 2);
      await contract.connect(user1).burnERC721(erc721.address, 3);

      expect(await energyMinter.balances(user1Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(4)
      );
      expect(await energyMinter.balances(user2Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(2)
      );
    });

    it("should throw error when trying to burn without approval", async function () {
      await erc721.mint(user1Address, 1);

      await expect(
        contract.connect(user1).burnERC721(erc721.address, 1)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });

    it("should throw error when trying to burn a token not owned", async function () {
      await erc721.mint(user1Address, 1);
      await erc721.mint(user2Address, 2);

      await erc721.connect(user1).setApprovalForAll(contract.address, true);
      await erc721.connect(user2).setApprovalForAll(contract.address, true);

      await expect(
        contract.connect(user1).burnERC721(erc721.address, 2)
      ).to.be.revertedWith("NotTokenOwner");
    });

    it("should throw error when trying to burn a token from a non-burnable collection", async function () {
      await erc721Redeemable.mint(user1Address, 1);

      await erc721Redeemable
        .connect(user1)
        .setApprovalForAll(contract.address, true);

      await expect(
        contract.connect(user1).burnERC721(erc721Redeemable.address, 1)
      ).to.be.revertedWith("NonBurnableCollection");
    });

    it("should throw an error when trying to score a non existing ERC721 collection", async function () {
      const erc721 = await Erc721Mock.deploy();

      await erc721.mint(user1Address, 1);

      await expect(contract.burnERC721(erc721.address, 1)).to.be.revertedWith(
        "UnknownCollection"
      );
    });
  });

  describe("ERC1155 burning", async function () {
    it("should burn erc1155 tokens and add mint energy", async function () {
      await erc1155.mint(user1Address, 1);
      await erc1155.mint(user2Address, 2);
      await erc1155.mint(user1Address, 3);

      await erc1155.connect(user1).setApprovalForAll(contract.address, true);
      await erc1155.connect(user2).setApprovalForAll(contract.address, true);

      await contract.connect(user1).burnERC1155(erc1155.address, 1, 1);
      await contract.connect(user2).burnERC1155(erc1155.address, 2, 1);
      await contract.connect(user1).burnERC1155(erc1155.address, 3, 1);

      expect(await energyMinter.balances(user1Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(4)
      );
      expect(await energyMinter.balances(user2Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(2)
      );
    });

    it("should throw error when trying to burn without approval", async function () {
      await erc1155.mint(user1Address, 1);

      await expect(
        contract.connect(user1).burnERC1155(erc1155.address, 1, 1)
      ).to.be.revertedWith("ERC1155: caller is not token owner or approved");
    });

    it("should throw error when trying to burn a token not owned", async function () {
      await erc1155.mint(user1Address, 1);
      await erc1155.mint(user2Address, 2);

      await erc1155.connect(user1).setApprovalForAll(contract.address, true);
      await erc1155.connect(user2).setApprovalForAll(contract.address, true);

      await expect(
        contract.connect(user1).burnERC1155(erc1155.address, 2, 1)
      ).to.be.revertedWith("NotTokenOwner");
    });

    it("should throw an error when trying to score a non existing ERC1155 collection", async function () {
      const erc1155 = await Erc1155Mock.deploy();

      await erc1155.mint(user1Address, 1);

      await expect(
        contract.burnERC1155(erc1155.address, 1, 1)
      ).to.be.revertedWith("UnknownCollection");
    });
  });

  describe("ERC721 redemption", async function () {
    it("should redeem erc721 tokens and add mint energy", async function () {
      await erc721Redeemable.mint(user1Address, 1);
      await erc721Redeemable.mint(user2Address, 2);
      await erc721Redeemable.mint(user1Address, 3);

      await contract.connect(user1).redeemERC721(erc721Redeemable.address, 1);
      await contract.connect(user2).redeemERC721(erc721Redeemable.address, 2);
      await contract.connect(user1).redeemERC721(erc721Redeemable.address, 3);

      expect(await energyMinter.balances(user1Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(4)
      );
      expect(await energyMinter.balances(user2Address, 1)).to.equal(
        ethers.BigNumber.from(10).pow(18).mul(2)
      );
      expect(
        await contract.redeemedErc721(erc721Redeemable.address, 1)
      ).to.equal(true);
      expect(
        await contract.redeemedErc721(erc721Redeemable.address, 2)
      ).to.equal(true);
      expect(
        await contract.redeemedErc721(erc721Redeemable.address, 3)
      ).to.equal(true);
    });

    it("should throw an error when redeeming an already redeemed token", async function () {
      await erc721Redeemable.mint(user1Address, 1);

      await contract.connect(user1).redeemERC721(erc721Redeemable.address, 1);

      await expect(
        contract.connect(user1).redeemERC721(erc721Redeemable.address, 1)
      ).to.be.revertedWith("AlreadyRedeemed");
    });

    it("should throw an error when trying to score a non existing ERC721 collection", async function () {
      const erc721 = await Erc721Mock.deploy();
      await erc721.mint(user1Address, 1);

      await expect(contract.redeemERC721(erc721.address, 1)).to.be.revertedWith(
        "UnknownCollection"
      );
    });

    it("should throw an error when trying to redeem a burnable collection", async function () {
      await erc721.mint(user1Address, 1);

      await expect(contract.redeemERC721(erc721.address, 1)).to.be.revertedWith(
        "NonRedeemableCollection"
      );
    });

    it("should throw an error when trying to redeem a non existing token", async function () {
      await expect(
        contract.redeemERC721(erc721Redeemable.address, 1)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("should throw an error when trying to redeem a token not owned", async function () {
      await erc721Redeemable.mint(user1Address, 1);
      await erc721Redeemable.mint(user2Address, 2);

      await expect(
        contract.connect(user1).redeemERC721(erc721Redeemable.address, 2)
      ).to.be.revertedWith("NotTokenOwner");
    });
  });
});
