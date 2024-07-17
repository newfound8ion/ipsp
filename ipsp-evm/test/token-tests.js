const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Test", function () {
  let contract;
  let owner;
  let ownerAddress;
  let recipient1;
  let recipient1Address;

  beforeEach(async function () {
    [owner, recipient1] = await ethers.getSigners();
    recipient1Address = await recipient1.getAddress();
    ownerAddress = await owner.getAddress();

    const Contract = await ethers.getContractFactory("Token");
    contract = await Contract.deploy("WATT", "WATT", ownerAddress);
    await contract.deployed();
  });

  describe("Token metadata", async function () {
    it("should have the correct name", async function () {
      expect(await contract.name()).to.equal("WATT");
    });

    it("should have the correct symbol", async function () {
      expect(await contract.symbol()).to.equal("WATT");
    });

    it("should have the correct decimals", async function () {
      expect(await contract.decimals()).to.equal(18);
    });
  });

  describe("Mint tokens", async function () {
    it("should mint tokens", async function () {
      await contract.connect(owner).mint(ownerAddress, 100);
      expect(await contract.balanceOf(ownerAddress)).to.equal(100);
      expect(await contract.totalSupply()).to.equal(100);
    });

    it("should throw when minting tokens with unauthorized minter", async function () {
      await expect(
        contract.connect(recipient1).mint(ownerAddress, 100)
      ).to.be.revertedWith("UnauthorizedMinter");
    });

    it("should throw when minting tokens with zero address", async function () {
      await expect(
        contract.connect(owner).mint(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("should throw when minting tokens with overflow", async function () {
      await contract
        .connect(owner)
        .mint(ownerAddress, ethers.constants.MaxUint256);
      await expect(contract.connect(owner).mint(ownerAddress, 1)).to.be
        .reverted;
    });
  });

  describe("Burn tokens", async function () {
    it("should burn tokens", async function () {
      await contract.connect(owner).mint(ownerAddress, 100);
      await contract.connect(owner).burn(ownerAddress, 100);
      expect(await contract.balanceOf(ownerAddress)).to.equal(0);
      expect(await contract.totalSupply()).to.equal(0);
    });

    it("should throw when burning tokens with unauthorized burner", async function () {
      await contract.connect(owner).mint(ownerAddress, 100);
      await expect(
        contract.connect(recipient1).burn(ownerAddress, 100)
      ).to.be.revertedWith("UnauthorizedMinter");
    });

    it("should throw when burning tokens with zero address", async function () {
      await expect(
        contract.connect(owner).burn(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("ERC20: burn from the zero address");
    });

    it("should throw when burning tokens with insufficient balance", async function () {
      await contract.connect(owner).mint(ownerAddress, 100);
      await expect(
        contract.connect(owner).burn(ownerAddress, 101)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Transfer tokens", async function () {
    it("should throw when transfering tokens", async function () {
      await expect(
        contract.transfer(recipient1Address, 100)
      ).to.be.revertedWith("Transfers disabled");
      await expect(
        contract.transferFrom(ownerAddress, recipient1Address, 100)
      ).to.be.revertedWith("Transfers disabled");
    });

    it("should throw when approving tokens", async function () {
      await expect(contract.approve(recipient1Address, 100)).to.be.revertedWith(
        "Transfers disabled"
      );
      expect(
        await contract.allowance(ownerAddress, recipient1Address)
      ).to.equal(0);
    });
  });
});
