const { expect } = require("chai");
const { ethers, upgrades, waffle, artifacts } = require("hardhat");
const { CWATT } = require("./test-utils");
const { BigNumber } = require("ethers");
const { PWATT, XWATT, LWATT, NWATT, SWATT, VWATT } = require("./test-utils");
const { parseEther } = require("ethers/lib/utils");

describe("Proof of Creativity Test", function () {
  let PoC;
  let poC;
  let MilestoneAwarder;
  let milestoneAwarder;
  let owner;
  let ownerAddress;
  let recipient1;
  let recipient2;
  let recipient1Address;
  let recipient2Address;
  const tokenContracts = [];

  beforeEach(async function () {
    [owner, recipient1, recipient2] = await ethers.getSigners();
    recipient1Address = await recipient1.getAddress();
    recipient2Address = await recipient2.getAddress();
    ownerAddress = await owner.getAddress();

    PoC = await ethers.getContractFactory("PoC");
    poC = await upgrades.deployProxy(PoC, {
      initializer: "initialize",
    });

    // Deploy the mock LinkCreator contract
    MilestoneAwarder = await artifacts.readArtifact("IMilestoneAwarder");
    milestoneAwarder = await waffle.deployMockContract(
      owner,
      MilestoneAwarder.abi
    );

    await poC.deployed();

    tokenContracts[0] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(0)
    );
    tokenContracts[1] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(1)
    );
    tokenContracts[2] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(2)
    );
    tokenContracts[3] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(3)
    );
    tokenContracts[4] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(4)
    );
    tokenContracts[5] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(5)
    );
    tokenContracts[6] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(6)
    );
    tokenContracts[7] = await ethers.getContractAt(
      "Token",
      await poC.tokenAddresses(7)
    );

    await poC.addTokenMinter(1, ownerAddress);
    await poC.addTokenMinter(2, ownerAddress);
    await poC.addTokenMinter(3, ownerAddress);
    await poC.addTokenMinter(4, ownerAddress);
    await poC.addTokenMinter(5, ownerAddress);
    await poC.addTokenMinter(6, ownerAddress);
    await poC.addTokenMinter(7, ownerAddress);

    await poC.setMilestoneAwarder(milestoneAwarder.address);

    await milestoneAwarder.mock.awardMilestonesUnlocked
      .withArgs(recipient1Address)
      .returns();
  });

  describe("Setup", async function () {
    it("should throw an error when trying initialize twice", async function () {
      await expect(poC.initialize()).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
  });

  describe("Token metadata", async function () {
    it("should have the correct name", async function () {
      expect(await poC.name()).to.equal("WATT");
    });

    it("should have the correct symbol", async function () {
      expect(await poC.symbol()).to.equal("WATT");
    });

    it("should have the correct decimals", async function () {
      expect(await poC.decimals()).to.equal(18);
    });

    it("should get the balance of a token", async function () {
      await poC
        .connect(owner)
        .mint(recipient1Address, CWATT, BigNumber.from(10).pow(18));
      const balance = await poC.balanceOfEnergy(recipient1Address, CWATT);
      expect(balance).to.equal(BigNumber.from(10).pow(18));
    });

    it("should throw when getting the balance of a token that doesn't exist", async function () {
      await expect(
        poC.balanceOfEnergy(recipient1Address, 100)
      ).to.be.revertedWith("InvalidTokenId");
    });
  });

  describe("Milestone awarder management", async function () {
    it("should throw an error when trying to set the milestone awarder with a non owner account", async function () {
      await expect(
        poC.connect(recipient1).setMilestoneAwarder(recipient1Address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set the milestone awarder", async function () {
      await poC.setMilestoneAwarder(recipient1Address);
      expect(await poC.milestoneAwarder()).to.equal(recipient1Address);
    });

    it("should throw an error when trying to set the milestone awarder to the zero address", async function () {
      await expect(
        poC.setMilestoneAwarder(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Mint tokens with ERC20", async function () {
    const testMint = async ({
      recipient,
      minter,
      tokens,
      skipBalanceChecks = false,
    }) => {
      let expectedWatts = 0;
      const tokenBalances = {};

      for (let i = 0; i < tokens.length; i++) {
        const { tokenId, amount } = tokens[i];

        // Convert to bignumber and multiply by 10^18
        const amountNumber = ethers.BigNumber.from(amount).mul(
          ethers.BigNumber.from(10).pow(18)
        );

        // Mint tokens
        await poC.connect(minter).mint(recipient, tokenId, amountNumber);

        if (!tokenBalances[tokenId]) {
          tokenBalances[tokenId] = ethers.BigNumber.from(0);
        }

        tokenBalances[tokenId] = tokenBalances[tokenId].add(amountNumber);
      }

      const watts = await poC.balanceOf(recipient);

      // Check token balances
      if (!skipBalanceChecks) {
        for (let i = 0; i < Object.keys(tokenBalances).length; i++) {
          const tokenId = Object.keys(tokenBalances)[i];
          const expectedBalance = tokenBalances[tokenId];

          const balance = await tokenContracts[tokenId].balanceOf(recipient);

          // Calculate expected WATTS based on actual balances
          expectedWatts += Math.log10(
            balance.div(ethers.BigNumber.from(10).pow(18)).toNumber()
          );

          expect(balance).to.equal(expectedBalance);
        }

        const roundedWatts = Math.round(watts / 10e12) / 10e4;
        const roundedExpected = Math.round(expectedWatts * 10e4) / 10e4;
        expect(roundedWatts).to.equal(roundedExpected);
      }
      return watts;
    };

    it("should calculate WATTS when minting tokens", async function () {
      await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [{ tokenId: 1, amount: 100 }],
      });
    });

    it("should calculate WATTS when minting multiple tokens", async function () {
      await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [
          { tokenId: 1, amount: 900 },
          { tokenId: 2, amount: 800000 },
          { tokenId: 3, amount: 700 },
          { tokenId: 4, amount: 50 },
          { tokenId: 4, amount: 50 },
          { tokenId: 4, amount: 50 },
        ],
      });
    });

    it("should calculate WATTS when minting multiple tokens to multiple recipients and match total supply", async function () {
      const recipient1Watts = await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [
          { tokenId: 1, amount: 900 },
          { tokenId: 2, amount: 800000 },
          { tokenId: 3, amount: 700 },
          { tokenId: 4, amount: 150 },
        ],
      });
      const recipient2Watts = await testMint({
        recipient: recipient2Address,
        minter: owner,
        tokens: [
          { tokenId: 1, amount: 900 },
          { tokenId: 2, amount: 800000 },
        ],
      });

      const totalSupply = await poC.totalSupply();
      expect(totalSupply).to.equal(recipient1Watts.add(recipient2Watts));
    });

    it("should calculate WATTS when minting small numbers", async function () {
      const recipientWatts = await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [
          { tokenId: 1, amount: 1 },
          { tokenId: 1, amount: 1 },
        ],
      });

      const totalSupply = await poC.totalSupply();
      expect(totalSupply).to.equal(recipientWatts);
    });

    it("should calculate WATTS when minting and changing the multipliers", async function () {
      await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [{ tokenId: 1, amount: 10 }],
        skipBalanceChecks: true,
      });

      await poC.setTokenMultiplier(1, 50);

      await testMint({
        recipient: recipient1Address,
        minter: owner,
        tokens: [{ tokenId: 1, amount: 10 }],
        skipBalanceChecks: true,
      });

      const watts = (Math.log10(10) + Math.log10(2) * 0.5) * 10e18;

      // Check with a precision of 14 decimals
      const totalSupply = (await poC.totalSupply()).toString().substring(0, 15);
      const wattsString = watts.toString().substring(0, 15);
      expect(totalSupply).to.equal(wattsString);
    });

    it("should throw when minting tokens with a zero address", async function () {
      await expect(
        poC
          .connect(owner)
          .mint(
            ethers.constants.AddressZero,
            1,
            ethers.BigNumber.from(10).pow(18)
          )
      ).to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("should throw when minting tokens with a unathorized minter", async function () {
      await expect(
        poC
          .connect(recipient1)
          .mint(recipient1Address, 1, ethers.BigNumber.from(10).pow(18))
      ).to.be.revertedWith("InvalidMinter");
    });

    it("should throw when minting tokens with a non-existing token", async function () {
      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, 0, ethers.BigNumber.from(10).pow(18))
      ).to.be.revertedWith("InvalidTokenId");
      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, 8, ethers.BigNumber.from(10).pow(18))
      ).to.be.revertedWith("InvalidTokenId");
    });

    it("should throw when minting tokens with an amount less than 10e18", async function () {
      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, 1, ethers.BigNumber.from(10).pow(18).sub(1))
      ).to.be.revertedWith("InvalidMintAmount");
    });
  });

  describe("Transfer tokens", async function () {
    it("should throw when transfering tokens", async function () {
      await expect(poC.transfer(recipient1Address, 100)).to.be.revertedWith(
        "TransfersDisabled"
      );
      await expect(
        poC.transferFrom(ownerAddress, recipient1Address, 100)
      ).to.be.revertedWith("TransfersDisabled");
    });

    it("should throw when approving tokens", async function () {
      await expect(poC.approve(recipient1Address, 100)).to.be.revertedWith(
        "TransfersDisabled"
      );
      expect(await poC.allowance(ownerAddress, recipient1Address)).to.equal(0);
    });
  });

  describe("Minter management", async function () {
    it("should add minter", async function () {
      await poC.connect(owner).addTokenMinter(1, recipient1Address);
      expect(await poC.tokenMinters(1, recipient1Address)).to.equal(true);
    });

    it("should remove minter", async function () {
      await poC.connect(owner).addTokenMinter(1, recipient1Address);
      await poC.connect(owner).revokeTokenMinter(1, recipient1Address);
      expect(await poC.tokenMinters(1, recipient1Address)).to.equal(false);
    });

    it("should throw when adding minter by non-owner", async function () {
      await expect(
        poC.connect(recipient1).addTokenMinter(1, recipient1Address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw when removing minter by non-owner", async function () {
      await expect(
        poC.connect(recipient1).revokeTokenMinter(1, recipient1Address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw when adding minter for non-existing token", async function () {
      await expect(
        poC.connect(owner).addTokenMinter(100, recipient1Address)
      ).to.be.revertedWith("InvalidTokenId");
    });

    it("should throw when removing minter for non-existing token", async function () {
      await expect(
        poC.connect(owner).revokeTokenMinter(100, recipient1Address)
      ).to.be.revertedWith("InvalidTokenId");
    });

    it("should throw when adding minter for non-existing address", async function () {
      await expect(
        poC.connect(owner).addTokenMinter(1, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });

    it("should throw when removing minter for non-existing address", async function () {
      await expect(
        poC.connect(owner).revokeTokenMinter(1, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });

    it("should throw when adding minter for a zero address", async function () {
      await expect(
        poC.connect(owner).addTokenMinter(1, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });

    it("should throw when removing minter for a zero address", async function () {
      await expect(
        poC.connect(owner).revokeTokenMinter(1, ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Multiplier management", async function () {
    it("should set multiplier", async function () {
      await poC.connect(owner).setTokenMultiplier(1, 5000);
      expect(await poC.tokenMultipliers(1)).to.equal(5000);
    });

    it("should throw when setting multiplier by non-owner", async function () {
      await expect(
        poC.connect(recipient1).setTokenMultiplier(1, 5000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should throw when setting multiplier for non-existing token", async function () {
      await expect(
        poC.connect(owner).setTokenMultiplier(100, 5000)
      ).to.be.revertedWith("InvalidTokenId");
    });

    it("should throw when setting multiplier for a value too small", async function () {
      await expect(
        poC.connect(owner).setTokenMultiplier(1, 0)
      ).to.be.revertedWith("InvalidMultiplier");
    });

    it("should throw when setting multiplier for a value too large", async function () {
      await expect(
        poC.connect(owner).setTokenMultiplier(1, 10001)
      ).to.be.revertedWith("InvalidMultiplier");
    });
  });

  describe("Milestones achievements", async function () {
    it("should track a milestone when reached", async function () {
      await poC
        .connect(owner)
        .mint(recipient1Address, CWATT, parseEther("10000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(0);

      await poC
        .connect(owner)
        .mint(recipient1Address, CWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(1);

      await poC
        .connect(owner)
        .mint(recipient1Address, XWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(2);

      await poC
        .connect(owner)
        .mint(recipient1Address, LWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(3);

      await poC
        .connect(owner)
        .mint(recipient1Address, NWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(4);

      await poC
        .connect(owner)
        .mint(recipient1Address, PWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(5);

      await poC
        .connect(owner)
        .mint(recipient1Address, SWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(6);

      await poC
        .connect(owner)
        .mint(recipient1Address, VWATT, parseEther("100000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(7);

      await poC
        .connect(owner)
        .mint(recipient1Address, CWATT, parseEther("1000000000000"));

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(7);

      await poC
        .connect(owner)
        .mint(recipient1Address, XWATT, parseEther("1000000000000"));

      await poC
        .connect(owner)
        .mint(recipient1Address, LWATT, parseEther("1000000000000"));

      await poC
        .connect(owner)
        .mint(recipient1Address, NWATT, parseEther("1000000000000"));

      await poC
        .connect(owner)
        .mint(recipient1Address, PWATT, parseEther("100000000000000"));

      await poC
        .connect(owner)
        .mint(recipient1Address, SWATT, parseEther("100000000000000"));

      await poC
        .connect(owner)
        .mint(recipient1Address, VWATT, parseEther("100000000000000"));

      // console.log(
      //   "CWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, CWATT))
      // );

      // console.log(
      //   "XWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, XWATT))
      // );

      // console.log(
      //   "LWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, LWATT))
      // );

      // console.log(
      //   "NWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, NWATT))
      // );

      // console.log(
      //   "PWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, PWATT))
      // );

      // console.log(
      //   "SWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, SWATT))
      // );

      // console.log(
      //   "VWATT: ",
      //   formatEther(await poC.balanceOfEnergy(recipient1Address, VWATT))
      // );

      // console.log(
      //   "WATT: ",
      //   formatEther(await poC.balanceOf(recipient1Address))
      // );

      expect(await poC.lastMilestoneUnlocked(recipient1Address)).to.equal(8);
    });

    it("should emit event when unlocking milestones", async function () {
      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, CWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("10"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, XWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("20"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, LWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("30"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, NWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("40"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, PWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("50"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, SWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("60"));

      await expect(
        poC
          .connect(owner)
          .mint(recipient1Address, VWATT, parseEther("100000000000"))
      )
        .to.emit(poC, "MilestoneUnlocked")
        .withArgs(recipient1Address, parseEther("70"));
    });
  });
});
