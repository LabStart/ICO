
# LabStart Token sale
<img src="https://cdn-images-1.medium.com/max/1000/1*XmqMwOuk9P1j6L3gkxAJsw.jpeg"/>

Important ressources:
- [LabStart Whitepaper](https://labstart.tech/ressources/uploads/2018/02/Whitepaper_V1.2.pdf)
- [Token sale registration and details](https://labstart.tech/token-sale/)

# Contracts
Token:
- [LabCoin.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabCoin.sol): Main contract for the token. It is an ERC20 token derived from the [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity) [StandardToken](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/StandardToken.sol) and [BurnableToken](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/BurnableToken.sol).

Sale:
 - [LabStartCrowdsale.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabStartCrowdsale.sol "LabStartCrowdsale.sol"): Implementation of the features of the Crowdsale. It is derived from the [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)  [WhitelistedCrowdsale](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/validation/WhitelistedCrowdsale.sol "WhitelistedCrowdsale.sol") and [FinalizableCrowdsale](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/distribution/FinalizableCrowdsale.sol "FinalizableCrowdsale.sol") contracts.
- [LabStartPresale.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabStartPresale.sol "LabStartPresale.sol"): The LabStart pre-sale. Derives from [LabStartCrowdsale.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabStartCrowdsale.sol "LabStartCrowdsale.sol") and burns the remaining LAB at the end of the pre-sale.
- [LabStartICO.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabStartICO.sol "LabStartICO.sol"): The ICO. Derives from [LabStartCrowdsale.sol](https://github.com/LabStart/ICO/blob/master/contracts/LabStartCrowdsale.sol "LabStartCrowdsale.sol"). At the end of the ICO, sends LAB to the team, so that the team owns 20% of the total supply of LAB when the crowdsale is over. Burns the remaining LAB at the end of the ICO.

# Installation

To run the crowdsale by yourself, you need to have [Truffle](https://github.com/ConsenSys/truffle) installed.
Then, download the project dependencies using npm install.
```sh
npm install -g truffle
npm install
```
In order to run the project with Truffle, do not forget to add a  truffle config file. An exemple of config file could be the following
```js
module.exports = {
    networks: {
        development: {
          host: "localhost",
          port: 8545,
          network_id: "*"
        }
      }
};
```
You can now migrate the LabStart Crowdsale (pre-sale and ICO) on the network of your choice, using the migrate command.
```sh
truffle migrate
```
