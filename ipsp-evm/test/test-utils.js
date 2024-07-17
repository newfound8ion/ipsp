const { ethers, network } = require("hardhat");
const { hexlify, toUtf8Bytes } = ethers.utils;
const uuid = require("uuid");

const testUtils = {
  CWATT: 1,
  XWATT: 2,
  LWATT: 3,
  NWATT: 4,
  PWATT: 5,
  SWATT: 6,
  VWATT: 7,

  getUid() {
    const buffer = Buffer.alloc(16);
    uuid.v4({}, buffer);
    return hexlify(toUtf8Bytes(buffer.toString("hex")));
  },

  async generateSignature(
    domain,
    types,
    payload,
    privateKey,
    verifyingContract
  ) {
    const wallet = new ethers.Wallet(privateKey);
    const uid = testUtils.getUid();
    const domainWithContractInfo = {
      ...domain,
      chainId: network.config.chainId,
      verifyingContract,
    };
    const payloadWithUid = {
      ...payload,
      uid,
    };
    const type = types[Object.keys(types)[0]];
    const request = type.map(({ name }) => payloadWithUid[name]);

    const signature = await wallet._signTypedData(
      domainWithContractInfo,
      types,
      payloadWithUid
    );
    return {
      request,
      signature,
    };
  },
};

module.exports = testUtils;
