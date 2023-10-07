const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JokeVote Contract", function () {
  let JokeVote;
  let jokeVote;
  let JokeVoteChecker;
  let jokeVoteChecker;
  let EnergyMock;
  let energyMock;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    JokeVote = await ethers.getContractFactory("JokeVote");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    jokeVote = await JokeVote.deploy();

    // Deploy a mock Energy contract
    EnergyMock = await ethers.getContractFactory("EnergyMinterMock");
    energyMock = await EnergyMock.deploy();

    JokeVoteChecker = await ethers.getContractFactory("JokeVoteChecker");

    // Use the address of the mock Energy contract
    jokeVoteChecker = await JokeVoteChecker.deploy(
      jokeVote.address,
      energyMock.address
    );
  });

  describe("Vote Casting and Verification", function () {
    it("Should allow an address to vote", async function () {
      await jokeVote.connect(addr1).castVote();
      expect(await jokeVote.hasVoted(addr1.address)).to.equal(true);
    });

    it("Should not allow an address to vote more than once", async function () {
      await jokeVote.connect(addr1).castVote();
      await expect(jokeVote.connect(addr1).castVote()).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should revert for an address that has not voted", async function () {
      await expect(
        jokeVoteChecker.connect(addr2).activate()
      ).to.be.revertedWith("Has not voted");
    });

    it("Should revert if the address has insufficient Watts", async function () {
      await jokeVote.connect(addr1).castVote();
      await energyMock.connect(addr1).mint(addr1.address, 1, 5);
      await expect(
        jokeVoteChecker.connect(addr1).activate()
      ).to.be.revertedWith("Insufficient Watts");
    });

    it("Should allow activation if the address has sufficient Watts", async function () {
      await jokeVote.connect(addr1).castVote();
      await energyMock.connect(addr1).mint(addr1.address, 1, 15);

      await expect(jokeVoteChecker.connect(addr1).activate()).to.emit(
        jokeVoteChecker,
        "Activated"
      );
    });
  });
});
