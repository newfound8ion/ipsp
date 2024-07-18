const { expect } = require("chai");
const { ethers, upgrades, waffle, artifacts } = require("hardhat");
const { generateSignature } = require("./test-utils");

const domain = {
  name: "InviteLinks",
  version: "1",
};

const types = {
  RedeemRequest: [
    { name: "linkId", type: "uint256" },
    { name: "recipient", type: "address" },
    { name: "sparks", type: "uint256" },
    { name: "uid", type: "bytes32" },
  ],
};

describe("InviteLinks", () => {
  let owner, linkAdmin, referrer, referrer2, recipient, otherCreator;
  let InviteLinks, inviteLinks;
  let MilestoneTracker, milestoneTracker;
  let SparkMinter, sparkMinter;

  beforeEach(async () => {
    // Set up signers
    [owner, linkAdmin, referrer, referrer2, recipient, otherCreator] =
      await ethers.getSigners();

    // Deploy the mock MilestoneTracker contract
    MilestoneTracker = await artifacts.readArtifact("IMilestoneTracker");
    milestoneTracker = await waffle.deployMockContract(
      owner,
      MilestoneTracker.abi
    );

    // Deploy SparkMinter
    SparkMinter = await ethers.getContractFactory("SparkMinterMock");
    sparkMinter = await SparkMinter.deploy();
    await sparkMinter.deployed();

    // Deploy InviteLinks
    InviteLinks = await ethers.getContractFactory("InviteLinks");
    inviteLinks = await upgrades.deployProxy(
      InviteLinks,
      [milestoneTracker.address, sparkMinter.address],
      { initializer: "initialize" }
    );

    // Add linkAdmin as an allowed link creator
    await inviteLinks.connect(owner).addLinkAdmin(linkAdmin.address);
  });

  describe("Initialization", () => {
    it("should initialize with correct values", async () => {
      expect(await inviteLinks.owner()).to.equal(owner.address);
      expect(await inviteLinks.milestoneTracker()).to.equal(
        milestoneTracker.address
      );
      expect(await inviteLinks.sparkMinter()).to.equal(sparkMinter.address);
      expect(await inviteLinks.linkAdmins(linkAdmin.address)).to.equal(true);
    });

    it("should throw an error if initialized twice", async () => {
      await expect(
        inviteLinks.initialize(milestoneTracker.address, sparkMinter.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Link creator management", () => {
    it("should add a new link creator", async () => {
      await inviteLinks.connect(owner).addLinkAdmin(otherCreator.address);
      expect(await inviteLinks.linkAdmins(otherCreator.address)).to.equal(true);
    });

    it("should remove an existing link creator", async () => {
      await inviteLinks.connect(owner).addLinkAdmin(otherCreator.address);
      await inviteLinks.connect(owner).removeLinkAdmin(otherCreator.address);

      expect(await inviteLinks.linkAdmins(otherCreator.address)).to.equal(
        false
      );
    });

    it("should not allow a non-owner to add a link creator", async () => {
      await expect(
        inviteLinks.connect(linkAdmin).addLinkAdmin(otherCreator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should not allow a non-owner to remove a link creator", async () => {
      await inviteLinks.connect(owner).addLinkAdmin(otherCreator.address);
      await expect(
        inviteLinks.connect(linkAdmin).removeLinkAdmin(otherCreator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should not allow a zero address be added as a link admin", async () => {
      await expect(
        inviteLinks.connect(owner).addLinkAdmin(ethers.constants.AddressZero)
      ).to.be.revertedWith("InvalidAddress");
    });
  });

  describe("Link management", () => {
    it("should create a new link", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await expect(
        inviteLinks
          .connect(linkAdmin)
          .createLink(referrer.address, sparks, publicKey, "tag")
      )
        .to.emit(inviteLinks, "LinkCreated")
        .withArgs(1, referrer.address, sparks, publicKey, "tag");

      const link = await inviteLinks.inviteLinks(1);
      expect(link.referrer).to.equal(referrer.address);
      expect(link.sparks).to.equal(sparks);
      expect(link.publicKey).to.equal(publicKey);
    });

    it("should revoke a link and mint the sparks back to the referrer", async () => {
      const sparks = 1000;
      const publicKey = recipient.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");

      await expect(inviteLinks.connect(referrer).revokeLink(1))
        .to.emit(inviteLinks, "LinkRevoked")
        .withArgs(1);

      const link = await inviteLinks.inviteLinks(1);
      expect(link.referrer).to.equal(ethers.constants.AddressZero);

      const referrerSparks = await sparkMinter.sparks(referrer.address);
      expect(referrerSparks).to.equal(sparks);
    });

    it("should update a link key", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");

      const newPublicKey = ethers.Wallet.createRandom().address;
      await expect(inviteLinks.connect(referrer).updateLinkKey(1, newPublicKey))
        .to.emit(inviteLinks, "LinkKeyUpdated")
        .withArgs(1, newPublicKey);

      const link = await inviteLinks.inviteLinks(1);
      expect(link.publicKey).to.equal(newPublicKey);
    });

    it("should not create a link if the sparks amount is zero", async () => {
      const sparks = 0;
      const publicKey = ethers.Wallet.createRandom().address;

      await expect(
        inviteLinks
          .connect(linkAdmin)
          .createLink(referrer.address, sparks, publicKey, "")
      ).to.be.revertedWith("InvalidSparksAmount");
    });

    it("should not create a link with a zero address referrer", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await expect(
        inviteLinks
          .connect(linkAdmin)
          .createLink(ethers.constants.AddressZero, sparks, publicKey, "")
      ).to.be.revertedWith("InvalidAddress");
    });

    it("should not create a link with a zero address public key", async () => {
      const sparks = 1000;

      await expect(
        inviteLinks
          .connect(linkAdmin)
          .createLink(
            referrer.address,
            sparks,
            ethers.constants.AddressZero,
            ""
          )
      ).to.be.revertedWith("InvalidAddress");
    });

    it("should not allow a non-link admin to create a link", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await expect(
        inviteLinks
          .connect(referrer)
          .createLink(referrer.address, sparks, publicKey, "")
      ).to.be.revertedWith("UnauthorizedLinkAdmin");
    });

    it("should not allow a non-link owner to revoke a link", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");

      await expect(
        inviteLinks.connect(linkAdmin).revokeLink(1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("should not allow a non-link owner to update a link key", async () => {
      const sparks = 1000;
      const publicKey = ethers.Wallet.createRandom().address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");

      const newPublicKey = ethers.Wallet.createRandom().address;
      await expect(
        inviteLinks.connect(linkAdmin).updateLinkKey(1, newPublicKey)
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Link redemption", () => {
    it("should redeem a link with the correct signature", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await inviteLinks.connect(recipient).redeemLink(request, signature);

      const link = await inviteLinks.inviteLinks(linkId);
      expect(link.referrer).to.equal(ethers.constants.AddressZero);

      const recipientSparks = await sparkMinter.awards(recipient.address);
      expect(recipientSparks).to.equal(sparks);

      expect(await inviteLinks.referrers(recipient.address)).to.equal(
        referrer.address
      );

      expect((await inviteLinks.inviteLinks(linkId))[0]).to.equal(
        ethers.constants.AddressZero
      );
    });

    it("should redeem a link and maintain the original referrer", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer2.address, sparks, publicKey, "");

      let { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId: 1,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await inviteLinks.connect(recipient).redeemLink(request, signature);

      ({ request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId: 2,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      ));

      await inviteLinks.connect(recipient).redeemLink(request, signature);

      expect(await inviteLinks.referrers(recipient.address)).to.equal(
        referrer.address
      );

      expect((await inviteLinks.inviteLinks(1))[0]).to.equal(
        ethers.constants.AddressZero
      );
      expect((await inviteLinks.inviteLinks(2))[0]).to.equal(
        ethers.constants.AddressZero
      );
    });

    it("should emit a LinkRedeemed event when a link is redeemed", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      )
        .to.emit(inviteLinks, "LinkRedeemed")
        .withArgs(linkId, referrer.address, recipient.address, sparks);
    });

    it("should not redeem a link with an incorrect signature", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        ethers.Wallet.createRandom().privateKey,
        inviteLinks.address
      );

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidSignature");
    });

    it("should not redeem a link with an incorrect linkId", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidLink");
    });

    it("should not redeem a link with an incorrect payload", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      let { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: linkAdmin.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidRecipient");

      ({ request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks: sparks + 1,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      ));

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidSignature");
    });

    it("should not redeem a link with the referrer as recipient", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: referrer.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await expect(
        inviteLinks.connect(referrer).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidRecipient");
    });

    it("should not redeem a link twice", async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await inviteLinks.connect(recipient).redeemLink(request, signature);

      await expect(
        inviteLinks.connect(recipient).redeemLink(request, signature)
      ).to.be.revertedWith("InvalidLink");
    });

    it("should throw if claimer is not an EOA", async function () {
      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      // Encode the call to buySparks
      const data = inviteLinks.interface.encodeFunctionData("redeemLink", [
        request,
        signature,
      ]);

      await expect(
        forwarder.forwardCall(inviteLinks.address, data)
      ).to.be.revertedWith("InvalidOrigin");
    });
  });

  describe("Milestone rewards", () => {
    beforeEach(async () => {
      const sparks = 1000;
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;

      await inviteLinks
        .connect(linkAdmin)
        .createLink(referrer.address, sparks, publicKey, "");
      const linkId = 1;

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          linkId,
          recipient: recipient.address,
          sparks,
          uid: ethers.utils.randomBytes(32),
        },
        wallet.privateKey,
        inviteLinks.address
      );

      await inviteLinks.connect(recipient).redeemLink(request, signature);
    });

    it("should award the referrer and achiever the correct amount of sparks every time", async () => {
      const awardedMilestone = await inviteLinks.unlockedRewards(
        recipient.address
      );
      expect(awardedMilestone).to.equal(0);

      // First milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(1);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(1);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(1);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(1);

      // Second milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(2);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(3);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(11);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(11);

      // Third milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(3);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(7);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(111);

      // Fourth milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(4);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(15);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(1111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(1111);

      // Fifth milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(5);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(31);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(11111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(11111);

      // Sixth milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(6);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(63);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(111_111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(111_111);

      // Seventh milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(7);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(
        127
      );
      expect(await sparkMinter.sparks(referrer.address)).to.equal(1_111_111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(1_111_111);

      // Eighth milestone
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(8);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(
        255
      );
      expect(await sparkMinter.sparks(referrer.address)).to.equal(11_111_111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(11_111_111);

      // Nineth milestone (should not award more sparks)
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(9);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      expect(await inviteLinks.unlockedRewards(recipient.address)).to.equal(
        255
      );
      expect(await sparkMinter.sparks(referrer.address)).to.equal(11_111_111);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(11_111_111);
    });

    it("should not award the same spark reward more than once", async () => {
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(1);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);
      await inviteLinks.awardMilestonesUnlocked(recipient.address);
      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      const newAwardedMilestones = await inviteLinks.unlockedRewards(
        recipient.address
      );

      expect(newAwardedMilestones).to.equal(1);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(1);
    });

    it("should award if the user has no referrer", async () => {
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(referrer.address)
        .returns(1);

      await inviteLinks.awardMilestonesUnlocked(referrer.address);

      const newAwardedMilestones = await inviteLinks.unlockedRewards(
        referrer.address
      );

      expect(newAwardedMilestones).to.equal(1);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(1);
    });

    it("should not do anything if there is no milestone unlocked", async () => {
      await milestoneTracker.mock.lastMilestoneUnlocked
        .withArgs(recipient.address)
        .returns(0);

      await inviteLinks.awardMilestonesUnlocked(recipient.address);

      const newAwardedMilestones = await inviteLinks.unlockedRewards(
        recipient.address
      );

      expect(newAwardedMilestones).to.equal(0);
      expect(await sparkMinter.sparks(recipient.address)).to.equal(0);
      expect(await sparkMinter.sparks(referrer.address)).to.equal(0);
    });
  });
});
