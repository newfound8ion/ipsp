const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JokeVote Contract", function () {
  let JokeVote;
  let jokeVote;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    JokeVote = await ethers.getContractFactory("JokeVote");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    jokeVote = await JokeVote.deploy();

    JokeVoteChecker = await ethers.getContractFactory("JokeVoteChecker");

    jokeVoteChecker = await JokeVoteChecker.deploy(jokeVote.address);
  });

  describe("Vote Casting and Verification", function () {
    it("Should allow an address to vote", async function () {
      await jokeVote.connect(addr1).castVote();
      expect(await jokeVote.hasVoted(addr1.getAddress())).to.equal(true);
    });

    it("Should not allow an address to vote more than once", async function () {
      await jokeVote.connect(addr1).castVote();
      await expect(jokeVote.connect(addr1).castVote()).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should verify if an address has voted using addressTotalVotesVerified", async function () {
      await jokeVote.connect(addr1).castVote();
      expect(await jokeVoteChecker.connect(addr1).activate()).to.equal(true);
    });

    it("Should return false for an address that has not voted", async function () {
      expect(
        await jokeVote.addressTotalVotesVerified(addr2.getAddress())
      ).to.equal(false);
    });
  });
});
