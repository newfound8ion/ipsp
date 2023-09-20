const { expect } = require("chai");
const { ethers, upgrades, waffle, artifacts } = require("hardhat");
const { cwatt } = require("./test-utils");
const { bignumber } = require("ethers");
const { pwatt, xwatt, lwatt, nwatt, swatt, vwatt } = require("./test-utils");
const { parseether } = require("ethers/lib/utils");

describe("proof of creativity test", function () {
  let poc;
  let poc;
  let milestoneawarder;
  let milestoneawarder;
  let owner;
  let owneraddress;
  let recipient1;
  let recipient2;
  let recipient1address;
  let recipient2address;
  const tokencontracts = [];

  beforeeach(async function () {
    [owner, recipient1, recipient2] = await ethers.getsigners();
    recipient1address = await recipient1.getaddress();
    recipient2address = await recipient2.getaddress();
    owneraddress = await owner.getaddress();

    poc = await ethers.getcontractfactory("poc");
    poc = await upgrades.deployproxy(poc, {
      initializer: "initialize",
    });

    // deploy the mock linkcreator contract
    milestoneawarder = await artifacts.readartifact("imilestoneawarder");
    milestoneawarder = await waffle.deploymockcontract(
      owner,
      milestoneawarder.abi
    );

    await poc.deployed();

    tokencontracts[0] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(0)
    );
    tokencontracts[1] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(1)
    );
    tokencontracts[2] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(2)
    );
    tokencontracts[3] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(3)
    );
    tokencontracts[4] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(4)
    );
    tokencontracts[5] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(5)
    );
    tokencontracts[6] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(6)
    );
    tokencontracts[7] = await ethers.getcontractat(
      "token",
      await poc.tokenaddresses(7)
    );

    await poc.addtokenminter(1, owneraddress);
    await poc.addtokenminter(2, owneraddress);
    await poc.addtokenminter(3, owneraddress);
    await poc.addtokenminter(4, owneraddress);
    await poc.addtokenminter(5, owneraddress);
    await poc.addtokenminter(6, owneraddress);
    await poc.addtokenminter(7, owneraddress);

    await poc.setmilestoneawarder(milestoneawarder.address);

    await milestoneawarder.mock.awardmilestonesunlocked
      .withargs(recipient1address)
      .returns();
  });

  describe("setup", async function () {
    it("should throw an error when trying initialize twice", async function () {
      await expect(poc.initialize()).to.be.revertedwith(
        "initializable: contract is already initialized"
      );
    });
  });

  describe("token metadata", async function () {
    it("should have the correct name", async function () {
      expect(await poc.name()).to.equal("watt");
    });

    it("should have the correct symbol", async function () {
      expect(await poc.symbol()).to.equal("watt");
    });

    it("should have the correct decimals", async function () {
      expect(await poc.decimals()).to.equal(18);
    });

    it("should get the balance of a token", async function () {
      await poc
        .connect(owner)
        .mint(recipient1address, cwatt, bignumber.from(10).pow(18));
      const balance = await poc.balanceofenergy(recipient1address, cwatt);
      expect(balance).to.equal(bignumber.from(10).pow(18));
    });

    it("should throw when getting the balance of a token that doesn't exist", async function () {
      await expect(
        poc.balanceofenergy(recipient1address, 100)
      ).to.be.revertedwith("invalidtokenid");
    });
  });

  describe("milestone awarder management", async function () {
    it("should throw an error when trying to set the milestone awarder with a non owner account", async function () {
      await expect(
        poc.connect(recipient1).setmilestoneawarder(recipient1address)
      ).to.be.revertedwith("ownable: caller is not the owner");
    });

    it("should set the milestone awarder", async function () {
      await poc.setmilestoneawarder(recipient1address);
      expect(await poc.milestoneawarder()).to.equal(recipient1address);
    });

    it("should throw an error when trying to set the milestone awarder to the zero address", async function () {
      await expect(
        poc.setmilestoneawarder(ethers.constants.addresszero)
      ).to.be.revertedwith("invalidaddress");
    });
  });

  describe("mint tokens with erc20", async function () {
    const testmint = async ({
      recipient,
      minter,
      tokens,
      skipbalancechecks = false,
    }) => {
      let expectedwatts = 0;
      const tokenbalances = {};

      for (let i = 0; i < tokens.length; i++) {
        const { tokenid, amount } = tokens[i];

        // convert to bignumber and multiply by 10^18
        const amountnumber = ethers.bignumber
          .from(amount)
          .mul(ethers.bignumber.from(10).pow(18));

        // mint tokens
        await poc.connect(minter).mint(recipient, tokenid, amountnumber);

        if (!tokenbalances[tokenid]) {
          tokenbalances[tokenid] = ethers.bignumber.from(0);
        }

        tokenbalances[tokenid] = tokenbalances[tokenid].add(amountnumber);
      }

      const watts = await poc.balanceof(recipient);

      // check token balances
      if (!skipbalancechecks) {
        for (let i = 0; i < object.keys(tokenbalances).length; i++) {
          const tokenid = object.keys(tokenbalances)[i];
          const expectedbalance = tokenbalances[tokenid];

          const balance = await tokencontracts[tokenid].balanceof(recipient);

          // calculate expected watts based on actual balances
          expectedwatts += math.log10(
            balance.div(ethers.bignumber.from(10).pow(18)).tonumber()
          );

          expect(balance).to.equal(expectedbalance);
        }

        const roundedwatts = math.round(watts / 10e12) / 10e4;
        const roundedexpected = math.round(expectedwatts * 10e4) / 10e4;
        expect(roundedwatts).to.equal(roundedexpected);
      }
      return watts;
    };

    it("should calculate watts when minting tokens", async function () {
      await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [{ tokenid: 1, amount: 100 }],
      });
    });

    it("should calculate watts when minting multiple tokens", async function () {
      await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [
          { tokenid: 1, amount: 900 },
          { tokenid: 2, amount: 800000 },
          { tokenid: 3, amount: 700 },
          { tokenid: 4, amount: 50 },
          { tokenid: 4, amount: 50 },
          { tokenid: 4, amount: 50 },
        ],
      });
    });

    it("should calculate watts when minting multiple tokens to multiple recipients and match total supply", async function () {
      const recipient1watts = await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [
          { tokenid: 1, amount: 900 },
          { tokenid: 2, amount: 800000 },
          { tokenid: 3, amount: 700 },
          { tokenid: 4, amount: 150 },
        ],
      });
      const recipient2watts = await testmint({
        recipient: recipient2address,
        minter: owner,
        tokens: [
          { tokenid: 1, amount: 900 },
          { tokenid: 2, amount: 800000 },
        ],
      });

      const totalsupply = await poc.totalsupply();
      expect(totalsupply).to.equal(recipient1watts.add(recipient2watts));
    });

    it("should calculate watts when minting small numbers", async function () {
      const recipientwatts = await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [
          { tokenid: 1, amount: 1 },
          { tokenid: 1, amount: 1 },
        ],
      });

      const totalsupply = await poc.totalsupply();
      expect(totalsupply).to.equal(recipientwatts);
    });

    it("should calculate watts when minting and changing the multipliers", async function () {
      await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [{ tokenid: 1, amount: 10 }],
        skipbalancechecks: true,
      });

      await poc.settokenmultiplier(1, 50);

      await testmint({
        recipient: recipient1address,
        minter: owner,
        tokens: [{ tokenid: 1, amount: 10 }],
        skipbalancechecks: true,
      });

      const watts = (math.log10(10) + math.log10(2) * 0.5) * 10e18;

      // check with a precision of 14 decimals
      const totalsupply = (await poc.totalsupply()).tostring().substring(0, 15);
      const wattsstring = watts.tostring().substring(0, 15);
      expect(totalsupply).to.equal(wattsstring);
    });

    it("should throw when minting tokens with a zero address", async function () {
      await expect(
        poc
          .connect(owner)
          .mint(
            ethers.constants.addresszero,
            1,
            ethers.bignumber.from(10).pow(18)
          )
      ).to.be.revertedwith("erc20: mint to the zero address");
    });

    it("should throw when minting tokens with a unathorized minter", async function () {
      await expect(
        poc
          .connect(recipient1)
          .mint(recipient1address, 1, ethers.bignumber.from(10).pow(18))
      ).to.be.revertedwith("invalidminter");
    });

    it("should throw when minting tokens with a non-existing token", async function () {
      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, 0, ethers.bignumber.from(10).pow(18))
      ).to.be.revertedwith("invalidtokenid");
      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, 8, ethers.bignumber.from(10).pow(18))
      ).to.be.revertedwith("invalidtokenid");
    });

    it("should throw when minting tokens with an amount less than 10e18", async function () {
      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, 1, ethers.bignumber.from(10).pow(18).sub(1))
      ).to.be.revertedwith("invalidmintamount");
    });
  });

  describe("transfer tokens", async function () {
    it("should throw when transfering tokens", async function () {
      await expect(poc.transfer(recipient1address, 100)).to.be.revertedwith(
        "transfersdisabled"
      );
      await expect(
        poc.transferfrom(owneraddress, recipient1address, 100)
      ).to.be.revertedwith("transfersdisabled");
    });

    it("should throw when approving tokens", async function () {
      await expect(poc.approve(recipient1address, 100)).to.be.revertedwith(
        "transfersdisabled"
      );
      expect(await poc.allowance(owneraddress, recipient1address)).to.equal(0);
    });
  });

  describe("minter management", async function () {
    it("should add minter", async function () {
      await poc.connect(owner).addtokenminter(1, recipient1address);
      expect(await poc.tokenminters(1, recipient1address)).to.equal(true);
    });

    it("should remove minter", async function () {
      await poc.connect(owner).addtokenminter(1, recipient1address);
      await poc.connect(owner).revoketokenminter(1, recipient1address);
      expect(await poc.tokenminters(1, recipient1address)).to.equal(false);
    });

    it("should throw when adding minter by non-owner", async function () {
      await expect(
        poc.connect(recipient1).addtokenminter(1, recipient1address)
      ).to.be.revertedwith("ownable: caller is not the owner");
    });

    it("should throw when removing minter by non-owner", async function () {
      await expect(
        poc.connect(recipient1).revoketokenminter(1, recipient1address)
      ).to.be.revertedwith("ownable: caller is not the owner");
    });

    it("should throw when adding minter for non-existing token", async function () {
      await expect(
        poc.connect(owner).addtokenminter(100, recipient1address)
      ).to.be.revertedwith("invalidtokenid");
    });

    it("should throw when removing minter for non-existing token", async function () {
      await expect(
        poc.connect(owner).revoketokenminter(100, recipient1address)
      ).to.be.revertedwith("invalidtokenid");
    });

    it("should throw when adding minter for non-existing address", async function () {
      await expect(
        poc.connect(owner).addtokenminter(1, ethers.constants.addresszero)
      ).to.be.revertedwith("invalidaddress");
    });

    it("should throw when removing minter for non-existing address", async function () {
      await expect(
        poc.connect(owner).revoketokenminter(1, ethers.constants.addresszero)
      ).to.be.revertedwith("invalidaddress");
    });

    it("should throw when adding minter for a zero address", async function () {
      await expect(
        poc.connect(owner).addtokenminter(1, ethers.constants.addresszero)
      ).to.be.revertedwith("invalidaddress");
    });

    it("should throw when removing minter for a zero address", async function () {
      await expect(
        poc.connect(owner).revoketokenminter(1, ethers.constants.addresszero)
      ).to.be.revertedwith("invalidaddress");
    });
  });

  describe("multiplier management", async function () {
    it("should set multiplier", async function () {
      await poc.connect(owner).settokenmultiplier(1, 5000);
      expect(await poc.tokenmultipliers(1)).to.equal(5000);
    });

    it("should throw when setting multiplier by non-owner", async function () {
      await expect(
        poc.connect(recipient1).settokenmultiplier(1, 5000)
      ).to.be.revertedwith("ownable: caller is not the owner");
    });

    it("should throw when setting multiplier for non-existing token", async function () {
      await expect(
        poc.connect(owner).settokenmultiplier(100, 5000)
      ).to.be.revertedwith("invalidtokenid");
    });

    it("should throw when setting multiplier for a value too small", async function () {
      await expect(
        poc.connect(owner).settokenmultiplier(1, 0)
      ).to.be.revertedwith("invalidmultiplier");
    });

    it("should throw when setting multiplier for a value too large", async function () {
      await expect(
        poc.connect(owner).settokenmultiplier(1, 10001)
      ).to.be.revertedwith("invalidmultiplier");
    });
  });

  describe("milestones achievements", async function () {
    it("should track a milestone when reached", async function () {
      await poc
        .connect(owner)
        .mint(recipient1address, cwatt, parseether("10000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(0);

      await poc
        .connect(owner)
        .mint(recipient1address, cwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(1);

      await poc
        .connect(owner)
        .mint(recipient1address, xwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(2);

      await poc
        .connect(owner)
        .mint(recipient1address, lwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(3);

      await poc
        .connect(owner)
        .mint(recipient1address, nwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(4);

      await poc
        .connect(owner)
        .mint(recipient1address, pwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(5);

      await poc
        .connect(owner)
        .mint(recipient1address, swatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(6);

      await poc
        .connect(owner)
        .mint(recipient1address, vwatt, parseether("100000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(7);

      await poc
        .connect(owner)
        .mint(recipient1address, cwatt, parseether("1000000000000"));

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(7);

      await poc
        .connect(owner)
        .mint(recipient1address, xwatt, parseether("1000000000000"));

      await poc
        .connect(owner)
        .mint(recipient1address, lwatt, parseether("1000000000000"));

      await poc
        .connect(owner)
        .mint(recipient1address, nwatt, parseether("1000000000000"));

      await poc
        .connect(owner)
        .mint(recipient1address, pwatt, parseether("100000000000000"));

      await poc
        .connect(owner)
        .mint(recipient1address, swatt, parseether("100000000000000"));

      await poc
        .connect(owner)
        .mint(recipient1address, vwatt, parseether("100000000000000"));

      // console.log(
      //   "cwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, cwatt))
      // );

      // console.log(
      //   "xwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, xwatt))
      // );

      // console.log(
      //   "lwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, lwatt))
      // );

      // console.log(
      //   "nwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, nwatt))
      // );

      // console.log(
      //   "pwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, pwatt))
      // );

      // console.log(
      //   "swatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, swatt))
      // );

      // console.log(
      //   "vwatt: ",
      //   formatether(await poc.balanceofenergy(recipient1address, vwatt))
      // );

      // console.log(
      //   "watt: ",
      //   formatether(await poc.balanceof(recipient1address))
      // );

      expect(await poc.lastmilestoneunlocked(recipient1address)).to.equal(8);
    });

    it("should emit event when unlocking milestones", async function () {
      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, cwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("10"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, xwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("20"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, lwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("30"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, nwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("40"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, pwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("50"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, swatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("60"));

      await expect(
        poc
          .connect(owner)
          .mint(recipient1address, vwatt, parseether("100000000000"))
      )
        .to.emit(poc, "milestoneunlocked")
        .withargs(recipient1address, parseether("70"));
    });
  });
});
