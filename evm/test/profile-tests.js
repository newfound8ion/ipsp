const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { keccak256, toUtf8Bytes } = ethers.utils;
const { generateSignature, getUid } = require("./test-utils.js");
const { zeroPad, hexlify } = require("ethers/lib/utils");

const BIO_KEY = keccak256(toUtf8Bytes("bio"));
const PROFILE_PICTURE_KEY = keccak256(toUtf8Bytes("profilePicture"));
const TWITTER_HANDLE = keccak256(toUtf8Bytes("twitterHandle"));

const domain = {
  name: "Profile",
  version: "1",
};

const types = {
  SetField: [
    { name: "key", type: "bytes32" },
    { name: "value", type: "string" },
    { name: "owner", type: "address" },
    { name: "uid", type: "bytes32" },
  ],
};

describe("Profile", function () {
  let Profile, profile, owner, addr1, addr2, user;

  beforeEach(async function () {
    Profile = await ethers.getContractFactory("Profile");
    [owner, addr1, addr2, user] = await ethers.getSigners();

    profile = await upgrades.deployProxy(Profile);
    await profile.deployed();
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await profile.owner()).to.equal(owner.address);
    });

    it("should have zero authorized signers initially", async function () {
      expect(await profile.authorizedSigners(addr1.address)).to.equal(false);
    });

    it("should not initialize the contract twice", async function () {
      await expect(profile.initialize()).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
  });

  describe("Signers management", function () {
    it("should allow the owner to add an authorized signer", async function () {
      await profile.addAuthorizedSigner(addr1.address);
      expect(await profile.authorizedSigners(addr1.address)).to.equal(true);
    });

    it("should allow the owner to remove an authorized signer", async function () {
      await profile.addAuthorizedSigner(addr1.address);
      await profile.removeAuthorizedSigner(addr1.address);
      expect(await profile.authorizedSigners(addr1.address)).to.equal(false);
    });

    it("should prevent non-owners from adding authorized signers", async function () {
      await expect(
        profile.connect(addr1).addAuthorizedSigner(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent non-owners from removing authorized signers", async function () {
      await profile.addAuthorizedSigner(addr2.address);
      await expect(
        profile.connect(addr1).removeAuthorizedSigner(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Update profile", function () {
    let wallet, publicKey, privateKey;

    beforeEach(async function () {
      wallet = ethers.Wallet.createRandom();
      publicKey = wallet.address;
      privateKey = wallet.privateKey;
      await profile.addAuthorizedSigner(publicKey);
    });

    it("should allow updating twitter handle with a valid signature", async function () {
      const key = TWITTER_HANDLE;
      const value = "someguy";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key,
          value,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.emit(profile, "ProfileUpdated");
    });

    it("should not allow updating twitter handle with an invalid signature", async function () {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;

      const key = TWITTER_HANDLE;
      const value = "someguy";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key,
          value,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidSignature");
    });

    it("should not allow reusing the signature to set the twitter handle", async function () {
      const key = TWITTER_HANDLE;
      const value = "someguy";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key,
          value,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.emit(profile, "ProfileUpdated");

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("RequestAlreadyUsed");
    });

    it("should not allow updating twitter handle with and invalid signature", async function () {
      const key = TWITTER_HANDLE;
      const value = "someguy";
      await expect(
        profile
          .connect(user)
          .updateProfile(
            [[key, value, user.address, getUid()]],
            [],
            [hexlify(zeroPad(0, 65))]
          )
      ).to.be.revertedWith("ECDSA: invalid signature");
    });

    it("should allow updating bio and picture without a valid signature", async function () {
      await expect(
        profile.connect(user).updateProfile(
          [
            [PROFILE_PICTURE_KEY, "https://something", user.address, getUid()],
            [BIO_KEY, "This guy is the best", user.address, getUid()],
          ],
          [],
          ["0x00"]
        )
      ).to.emit(profile, "ProfileUpdated");
    });

    it("should set the username", async function () {
      const username = "someguy";
      const hashedUsername = keccak256(toUtf8Bytes(username));

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await profile.connect(user).updateProfile([request], [], [signature]);
      expect(await profile.userNameAddresses(hashedUsername)).to.equal(
        user.address
      );
      expect(await profile.addressUsersNames(user.address)).to.equal(
        hashedUsername
      );
    });

    it("should not allow another user to set the same username", async function () {
      let { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: "someguy",
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await profile.connect(user).updateProfile([request], [], [signature]);

      ({ request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: "someguy",
          owner: addr1.address,
        },
        privateKey,
        profile.address
      ));

      await expect(
        profile.connect(addr1).updateProfile([request], [], [signature])
      ).to.be.revertedWith("UserNameAlreadyTaken");
    });

    it("should allow changing the username to another one not taken", async function () {
      const username = "someguy";
      const newUsername = "anotherguy";
      const hashedUsername = keccak256(toUtf8Bytes(username));
      const hashedNewUsername = keccak256(toUtf8Bytes(newUsername));

      let { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await profile.connect(user).updateProfile([request], [], [signature]);

      ({ request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: newUsername,
          owner: user.address,
        },
        privateKey,
        profile.address
      ));

      await profile.connect(user).updateProfile([request], [], [signature]);

      expect(await profile.userNameAddresses(hashedUsername)).to.equal(
        ethers.constants.AddressZero
      );
      expect(await profile.userNameAddresses(hashedNewUsername)).to.equal(
        user.address
      );
      expect(await profile.addressUsersNames(user.address)).to.equal(
        hashedNewUsername
      );
    });

    it("should allow setting a username with lowercase letters, numbers and underscore", async function () {
      const username = "abcdefghijklmnopqrstuwxyz0123456789_";
      const hashedUsername = keccak256(toUtf8Bytes(username));

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await profile.connect(user).updateProfile([request], [], [signature]);

      expect(await profile.userNameAddresses(hashedUsername)).to.equal(
        user.address
      );
      expect(await profile.addressUsersNames(user.address)).to.equal(
        hashedUsername
      );
    });

    it("should not allow setting a username with uppercase letters", async function () {
      const username = "ABCDEFGHIJKLMNOPQRSTUWXYZ";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidUserName");
    });

    it("should not allow setting a username with special characters", async function () {
      const username = "{}!";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidUserName");
    });

    it("should not allow setting a username with spaces", async function () {
      const username = "hello world";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidUserName");
    });

    it("should not allow setting a username with less than 3 characters", async function () {
      const username = "he";

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidUserName");
    });

    it("should not allow setting a username with more than 50 characters", async function () {
      const username = "h".repeat(51);

      const { request, signature } = await generateSignature(
        domain,
        types,
        {
          key: TWITTER_HANDLE,
          value: username,
          owner: user.address,
        },
        privateKey,
        profile.address
      );

      await expect(
        profile.connect(user).updateProfile([request], [], [signature])
      ).to.be.revertedWith("InvalidUserName");
    });

    it("should send a large field in the bio", async function () {
      // Lorem ipsum of 5 paragraphs
      const bio = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras id nisl vel tellus ullamcorper luctus vel in nisl. Mauris vulputate ligula at mauris semper, eget ornare metus consequat. Nullam cursus accumsan diam, a elementum sem ultrices sed. Vestibulum sagittis quam vel tristique aliquam. Nullam non hendrerit nulla. Donec eu massa elit. Suspendisse porta gravida nibh at auctor.
        Mauris tellus quam, auctor sit amet scelerisque et, finibus vitae ipsum. Suspendisse lacinia suscipit dui, id vehicula orci ornare nec. Nullam dolor nunc, egestas vitae imperdiet et, dignissim tincidunt mauris. Nunc scelerisque, neque viverra commodo mollis, nibh eros imperdiet nisl, vel porttitor dui elit vel ligula. Curabitur metus enim, viverra nec dui vitae, malesuada lobortis magna. Quisque sit amet ex nulla. Vivamus rhoncus porttitor lacus, at dictum lacus facilisis ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras facilisis elit vitae metus posuere, sed luctus velit malesuada. Nam at vulputate dui.
        
        Fusce ultrices arcu eu nunc consectetur, quis rhoncus felis consequat. Vivamus sodales massa id vulputate cursus. Donec nisi ipsum, fermentum non tempus et, lobortis nec nunc. Nam sit amet eros lacinia, viverra neque ut, posuere velit. Nam pellentesque dolor eget dui malesuada rhoncus. Sed ullamcorper eu nibh in sodales. Aliquam erat volutpat. Proin lobortis rhoncus nunc, convallis porta turpis mollis nec. Maecenas placerat ligula nibh, et mollis mauris gravida ut. Nullam tempor vehicula leo a varius. Aliquam quis tincidunt velit. Etiam venenatis sollicitudin efficitur.
        
        Fusce risus massa, lacinia ac erat nec, aliquam faucibus lacus. Nam enim enim, porttitor ac odio at, ullamcorper porta orci. Sed vel est at est rhoncus bibendum non sed velit. Nam molestie ante sed mauris lacinia, ut convallis justo tempor. Etiam mattis aliquam vestibulum. Morbi nulla libero, pulvinar sed felis a, feugiat placerat erat. Aliquam dictum, orci vitae bibendum viverra, dui erat ultrices velit, vitae faucibus mauris nibh sed ante. Maecenas sagittis porttitor dapibus. Proin tempus lacus nibh, in consequat erat mollis eu. Suspendisse finibus finibus est. Vivamus iaculis augue non libero tristique auctor.
        
        Quisque elementum quis sapien eu lacinia. Sed est ex, auctor eu orci a, pulvinar ornare mi. Phasellus pellentesque metus ac eros finibus tincidunt. Nullam in ligula ut mi faucibus blandit ac sed sem. Donec nec ligula eget mauris tincidunt accumsan. Donec mollis tristique tellus vitae ultricies. Maecenas et laoreet ipsum. Donec venenatis luctus massa in congue. Cras lectus magna, dictum vitae leo non, dignissim porttitor eros. Duis vehicula mattis libero, at tincidunt ligula convallis sit amet. Proin sem lacus, suscipit eu orci id, condimentum vulputate erat. Mauris eleifend hendrerit molestie. Proin rutrum pharetra magna vel feugiat.`;
      await profile
        .connect(user)
        .updateProfile([[BIO_KEY, bio, user.address, getUid()]], [], ["0x00"]);
    });

    it("should not allow setting a field with wrong owner", async function () {
      // Lorem ipsum of 5 paragraphs
      const bio = "Test";
      await expect(
        profile
          .connect(user)
          .updateProfile(
            [[BIO_KEY, bio, addr1.address, getUid()]],
            [],
            ["0x00"]
          )
      ).to.be.revertedWith("InvalidField");
    });
  });
});
