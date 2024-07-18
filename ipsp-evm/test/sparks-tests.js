const { expect } = require("chai");
const { ethers, upgrades, artifacts, waffle } = require("hardhat");
const { CWATT } = require("./test-utils");
const { parseEther } = require("ethers/lib/utils");

describe("Sparks", function () {
  let owner,
    minter,
    buyer,
    recipient,
    salesRecipient,
    newSalesRecipient,
    rewardsRecipient;
  let sparks,
    SparksContract,
    energyMinter,
    EnergyMinter,
    weth,
    linkCreator,
    LinkCreator;

  const uri = "ipfs://";

  beforeEach(async function () {
    [
      owner,
      minter,
      buyer,
      recipient,
      salesRecipient,
      newSalesRecipient,
      rewardsRecipient,
    ] = await ethers.getSigners();

    // Set up mock contracts for energyMinter and priceFeed
    // Deploy and initialize the mock EnergyMinter contract
    EnergyMinter = await ethers.getContractFactory("EnergyMinterMock");
    energyMinter = await EnergyMinter.deploy();
    await energyMinter.deployed();

    // Deploy the mock weth contract
    const ERC20 = await ethers.getContractFactory("ERC20Mock");
    weth = await ERC20.deploy("WETH", "WETH");
    await weth.deployed();

    // Deploy the mock LinkCreator contract
    LinkCreator = await artifacts.readArtifact("ILinkCreator");
    linkCreator = await waffle.deployMockContract(owner, LinkCreator.abi);

    SparksContract = await ethers.getContractFactory("Sparks");
    sparks = await upgrades.deployProxy(SparksContract, [
      uri,
      energyMinter.address,
      weth.address,
      salesRecipient.address,
    ]);
    await sparks.deployed();

    await sparks.setLinkCreator(linkCreator.address);
  });

  describe("initialize", function () {
    it("should properly initialize the contract", async function () {
      expect(await sparks.owner()).to.equal(owner.address);
      expect(await sparks.uri(0)).to.equal(uri);
      expect(await sparks.energyMinter()).to.equal(energyMinter.address);
      expect(await sparks.currency()).to.equal(weth.address);
      expect(await sparks.salesRecipient()).to.equal(salesRecipient.address);
      expect(await sparks.tokenPriceInCurrency()).to.equal(parseEther("0.1"));
      expect(await sparks.salesRecipient()).to.equal(salesRecipient.address);
    });

    it("should throw when trying to initialize twice", async function () {
      await expect(
        sparks.initialize(
          uri,
          energyMinter.address,
          weth.address,
          salesRecipient.address
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Minters management", function () {
    it("should allow owner to add a minter", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      expect(await sparks.tokenMinters(minter.address)).to.equal(true);
    });

    it("should allow owner to revoke a minter", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await sparks.connect(owner).revokeTokenMinter(minter.address);
      expect(await sparks.tokenMinters(minter.address)).to.equal(false);
    });

    it("should throw if non-owner tries to add a minter", async function () {
      await expect(
        sparks.connect(minter).addTokenMinter(minter.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw if non-owner tries to revoke a minter", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await expect(
        sparks.connect(minter).revokeTokenMinter(minter.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw if minter is zero address", async function () {
      await expect(
        sparks.connect(owner).addTokenMinter(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Token price management", function () {
    it("should allow owner to update token price", async function () {
      await sparks.connect(owner).updateTokenPrice(weth.address, 2 * 1e8);
      expect(await sparks.tokenPriceInCurrency()).to.equal(2 * 1e8);
    });

    it("should throw if non-owner tries to update token price", async function () {
      await expect(
        sparks.connect(minter).updateTokenPrice(weth.address, 2 * 1e8)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Link creator management", function () {
    it("should allow owner to update link creator", async function () {
      await sparks.connect(owner).setLinkCreator(newSalesRecipient.address);
      expect(await sparks.linkCreator()).to.equal(newSalesRecipient.address);
    });

    it("should throw if non-owner tries to update link creator", async function () {
      await expect(
        sparks.connect(minter).setLinkCreator(newSalesRecipient.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw if link creator is zero address", async function () {
      await expect(
        sparks.connect(owner).setLinkCreator(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Token URI management", function () {
    it("should allow owner to update token URI", async function () {
      await sparks.connect(owner).updateURI("ipfs://new");
      expect(await sparks.uri(0)).to.equal("ipfs://new");
    });

    it("should throw if non-owner tries to update token URI", async function () {
      await expect(
        sparks.connect(minter).updateURI("ipfs://new")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Contract URI management", function () {
    it("should allow owner to update contract URI", async function () {
      await sparks.connect(owner).updateContractURI("ipfs://new");
      expect(await sparks.contractURI()).to.equal("ipfs://new");
    });

    it("should throw if non-owner tries to update contract URI", async function () {
      await expect(
        sparks.connect(minter).updateContractURI("ipfs://new")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Sales recipient management", function () {
    it("should allow owner to update sales recipient", async function () {
      await sparks
        .connect(owner)
        .updateSalesRecipient(newSalesRecipient.address);
      expect(await sparks.salesRecipient()).to.equal(newSalesRecipient.address);
    });

    it("should throw if non-owner tries to update sales recipient", async function () {
      await expect(
        sparks.connect(minter).updateSalesRecipient(newSalesRecipient.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw if sales recipient is zero address", async function () {
      await expect(
        sparks.connect(owner).updateSalesRecipient(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Token minting", function () {
    it("should allow a minter to mint tokens", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await sparks.connect(minter).mint(recipient.address, 100);
      expect(await sparks.balanceOf(recipient.address, 0)).to.equal(100);
    });

    it("should allow a minter to award sparks to a recipient", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await sparks.connect(minter).award(owner.address, 100, recipient.address);
      expect(
        await energyMinter.balanceOfEnergy(recipient.address, CWATT)
      ).to.equal(parseEther("1000"));
    });

    it("should throw if non-minter tries to mint tokens", async function () {
      await expect(
        sparks.connect(owner).mint(recipient.address, 100)
      ).to.be.revertedWith("UnauthorizedMinter");
    });

    it("should throw if non-minter tries to award sparks to a recipient", async function () {
      await expect(
        sparks.connect(owner).award(owner.address, 100, recipient.address)
      ).to.be.revertedWith("UnauthorizedMinter");
    });

    it("should throw if the amount is zero", async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await expect(
        sparks.connect(minter).mint(recipient.address, 0)
      ).to.be.revertedWith("InvalidSparksAmount");
    });
  });

  describe("Token buying", function () {
    beforeEach(async function () {
      await sparks
        .connect(owner)
        .updateTokenPrice(weth.address, ethers.utils.parseEther("25"));

      // Mint some WETH for the buyer
      await weth.mint(buyer.address, ethers.utils.parseEther("2000"));

      // Approve sparks to spend WETH on behalf of the buyer
      await weth
        .connect(buyer)
        .approve(sparks.address, ethers.constants.MaxUint256);
    });

    it("should buy and mint tokens", async function () {
      const balanceBefore = await weth.balanceOf(salesRecipient.address);

      await sparks.connect(buyer).buySparks(recipient.address, 50);

      const balanceAfter = await weth.balanceOf(salesRecipient.address);
      const increaseBalance = balanceAfter.sub(balanceBefore);
      expect(await sparks.balanceOf(recipient.address, 0)).to.equal(50);
      expect(increaseBalance).to.be.equal(ethers.utils.parseEther("1250"));
    });

    it("should throw if the amount is zero", async function () {
      await expect(
        sparks.connect(buyer).buySparks(recipient.address, 0)
      ).to.be.revertedWith("InvalidSparksAmount");
    });

    it("should throw if the buyer doesn't have enough balance", async function () {
      await expect(
        sparks.connect(buyer).buySparks(recipient.address, 81)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should throw if the buyer is not an EOA", async function () {
      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      // Encode the call to buySparks
      const data = sparks.interface.encodeFunctionData("buySparks", [
        recipient.address,
        50,
      ]);

      await expect(
        forwarder.forwardCall(sparks.address, data)
      ).to.be.revertedWith("InvalidOrigin");
    });
  });

  describe("Token burning", function () {
    beforeEach(async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
    });

    it("should burn tokens and award points to the recipient", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await sparks
        .connect(recipient)
        .burnAndRewardSparks(50, rewardsRecipient.address);

      expect(await sparks.balanceOf(recipient.address, 0)).to.equal(50);
      expect(
        await energyMinter.balances(rewardsRecipient.address, CWATT)
      ).to.equal(ethers.utils.parseEther("500"));
    });

    it("should emit a SparksAwarded event", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await expect(
        sparks
          .connect(recipient)
          .burnAndRewardSparks(50, rewardsRecipient.address)
      )
        .to.emit(sparks, "SparksAwarded")
        .withArgs(
          recipient.address,
          50,
          rewardsRecipient.address,
          ethers.utils.parseEther("500")
        );
    });

    it("should throw if the amount is zero", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await expect(
        sparks
          .connect(recipient)
          .burnAndRewardSparks(0, rewardsRecipient.address)
      ).to.be.revertedWith("InvalidSparksAmount");
    });

    it("should throw if the burner does not have enough tokens", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await expect(
        sparks
          .connect(recipient)
          .burnAndRewardSparks(101, rewardsRecipient.address)
      ).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });

    it("should throw if the recipient is zero address", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await sparks
        .connect(recipient)
        .burnAndRewardSparks(50, rewardsRecipient.address);

      await expect(
        sparks
          .connect(recipient)
          .burnAndRewardSparks(50, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidRewardsRecipient");
    });

    it("should allow to award if the recipient is the same as the burner", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);
      await sparks
        .connect(recipient)
        .burnAndRewardSparks(50, rewardsRecipient.address);

      await expect(
        sparks.connect(recipient).burnAndRewardSparks(50, recipient.address)
      ).to.not.be.reverted;
    });

    it("should throw if the burner is not an EOA", async function () {
      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      // Encode the call to buySparks
      const data = sparks.interface.encodeFunctionData("burnAndRewardSparks", [
        50,
        recipient.address,
      ]);

      await expect(
        forwarder.forwardCall(sparks.address, data)
      ).to.be.revertedWith("InvalidOrigin");
    });
  });

  describe("Buy and award sparks directly", function () {
    beforeEach(async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);

      await sparks
        .connect(owner)
        .updateTokenPrice(weth.address, ethers.utils.parseEther("25"));

      // Mint some WETH for the buyer
      await weth.mint(buyer.address, ethers.utils.parseEther("2000"));

      // Approve sparks to spend WETH on behalf of the buyer
      await weth
        .connect(buyer)
        .approve(sparks.address, ethers.constants.MaxUint256);
    });

    it("should buy and award points to the rewards recipient", async function () {
      await sparks
        .connect(buyer)
        .buyAndRewardSparks(50, rewardsRecipient.address);

      expect(await weth.balanceOf(salesRecipient.address)).to.equal(
        ethers.utils.parseEther("1250")
      );
      expect(
        await energyMinter.balances(rewardsRecipient.address, CWATT)
      ).to.equal(ethers.utils.parseEther("500"));
    });

    it("should throw if the amount is zero", async function () {
      await expect(
        sparks.connect(buyer).buyAndRewardSparks(0, rewardsRecipient.address)
      ).to.be.revertedWith("InvalidSparksAmount");
    });

    it("should emit a SparksAwarded event", async function () {
      await expect(
        await sparks
          .connect(buyer)
          .buyAndRewardSparks(50, rewardsRecipient.address)
      )
        .to.emit(sparks, "SparksAwarded")
        .withArgs(
          buyer.address,
          50,
          rewardsRecipient.address,
          ethers.utils.parseEther("500")
        );
    });

    it("should throw if the buyer does not have enough balance", async function () {
      await expect(
        sparks.connect(buyer).buyAndRewardSparks(81, rewardsRecipient.address)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should throw if the recipient is zero address", async function () {
      await expect(
        sparks
          .connect(buyer)
          .buyAndRewardSparks(50, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidRewardsRecipient");
    });

    it("should allow to award if the rewards recipient is the same as the buyer", async function () {
      await expect(sparks.connect(buyer).buyAndRewardSparks(50, buyer.address))
        .to.not.be.reverted;
    });

    it("should throw if the buyer is not an EOA", async function () {
      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      // Encode the call to buySparks
      const data = sparks.interface.encodeFunctionData("buyAndRewardSparks", [
        50,
        recipient.address,
      ]);

      await expect(
        forwarder.forwardCall(sparks.address, data)
      ).to.be.revertedWith("InvalidOrigin");
    });
  });

  describe("Invite link", function () {
    beforeEach(async function () {
      await sparks.connect(owner).addTokenMinter(minter.address);
      await weth
        .connect(buyer)
        .approve(sparks.address, ethers.constants.MaxUint256);
      await weth.mint(buyer.address, ethers.utils.parseEther("2000"));
    });

    it("should burn tokens and create an invite link", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);

      const publicKey = ethers.Wallet.createRandom().address;
      const amountToBurn = 50;
      const amountToBuy = 0;
      const recipientAddress = recipient.address;

      await linkCreator.mock.createLink
        .withArgs(recipientAddress, amountToBurn, publicKey, "tag")
        .returns(1);

      await sparks
        .connect(recipient)
        .createInvite(amountToBurn, amountToBuy, publicKey, "tag");

      expect(await sparks.balanceOf(recipient.address, 0)).to.equal(50);
    });

    it("should buy tokens and create an invite link", async function () {
      await sparks.connect(minter).mint(buyer.address, 100);

      const publicKey = ethers.Wallet.createRandom().address;
      const amountToBurn = 0;
      const amountToBuy = 50;
      const buyerAddress = buyer.address;

      await linkCreator.mock.createLink
        .withArgs(buyerAddress, amountToBuy, publicKey, "")
        .returns(1);

      await sparks
        .connect(buyer)
        .createInvite(amountToBurn, amountToBuy, publicKey, "");

      expect(await sparks.balanceOf(buyerAddress, 0)).to.equal(100);
      expect(await weth.balanceOf(salesRecipient.address)).to.equal(
        parseEther("5")
      );
    });

    it("should buy and burn tokens to create an invite link", async function () {
      await sparks.connect(minter).mint(buyer.address, 100);

      const publicKey = ethers.Wallet.createRandom().address;
      const amountToBurn = 50;
      const amountToBuy = 50;
      const buyerAddress = buyer.address;

      await linkCreator.mock.createLink
        .withArgs(buyerAddress, amountToBuy + amountToBurn, publicKey, "")
        .returns(1);

      await sparks
        .connect(buyer)
        .createInvite(amountToBurn, amountToBuy, publicKey, "");

      expect(await sparks.balanceOf(buyerAddress, 0)).to.equal(50);
      expect(await weth.balanceOf(salesRecipient.address)).to.equal(
        parseEther("5")
      );
    });

    it("should throw when creating an invite link with no tokens", async function () {
      const publicKey = ethers.Wallet.createRandom().address;
      await expect(
        sparks.connect(recipient).createInvite(0, 0, publicKey, "")
      ).to.be.revertedWith("InviteWithZeroSparks");
    });

    it("should throw if the burner does not have enough tokens", async function () {
      await sparks.connect(minter).mint(recipient.address, 100);

      const publicKey = ethers.Wallet.createRandom().address;
      await expect(
        sparks.connect(recipient).createInvite(101, 0, publicKey, "")
      ).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });

    it("should throw if the burner is not an EOA", async function () {
      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      // Encode the call to buySparks
      const publicKey = ethers.Wallet.createRandom().address;
      const data = sparks.interface.encodeFunctionData("createInvite", [
        50,
        0,
        publicKey,
        "",
      ]);

      await expect(
        forwarder.forwardCall(sparks.address, data)
      ).to.be.revertedWith("InvalidOrigin");
    });
  });
});
