



<--! # Safe Energy

![build status](https://github.com/neftyblocks/safe-energy-contracts/actions/workflows/ci.yml/badge.svg)
![slither status](https://github.com/neftyblocks/safe-energy-contracts/actions/workflows/slither.yml/badge.svg)

This is a set of contracts for the Safe energy!

## General hardhat commands:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run
```

## Linting

```shell
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, first the contract needs to be deployed and the ETHERSCAN_API_KEY has to be set in the env variables.

After the contract is deployed run the verify script. Replace `CONTRACT_ADDRESS` in this command:

```shell
yarn verify CONTRACT_ADDRESS
```

# Energy ids:

CWATT = 1
XWATT = 2
LWATT = 3
NWATT = 4
PWATT = 5
SWATT = 6
VWATT = 7

# External badges

To add new external badges modify the `./scripts/configure-external-badges.js` and run it with the correct network.

```
yarn hardhat run ./scripts/configure-external-badges.js
```

## Twitter energy

id: twitter
idHash: e0c21cec0df89042d0481b515470acf4b93b792ca3f63efbc999f5bb9716a8f4
multiplier: 100000
energy: NWATT

## Gitcoin

id: gitcoin
idHash: 0xe0c21cec0df89042d0481b515470acf4b93b792ca3f63efbc999f5bb9716a8f4
multiplier: 100
energy: VWATT

## Twitter verification

id: twitterVerification
idHash: 0x8cee25e7a470639dd169ebc8260328143d5f91dac1c011284fd50f2ec240ad98
multiplier: 1
energy: VWATT

## Twitter blue

id: twitterBlue
idHash: 0x78ac74102c501c50d4ec2b498ab65fa0aedc3ac745dc6171d4c069c271126a96
multiplier: 1
energy: VWATT

## Twitter followers

id: twitterFollowers
idHash: 0xb721b99bf249c07883e8ba2677a2f38bb84eb42b58ca6f64170935177cd8ada7
multiplier: 1
energy: NWATT

-->
