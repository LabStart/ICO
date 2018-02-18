pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

import "./LabCoin.sol";

contract LabStartCrowdsale is Crowdsale {
    function LabStartCrowdsale(uint256 startTime, uint256 endTime, uint256 rate,
        address wallet)
        Crowdsale(startTime, endTime, rate, wallet) public {

    }

    // creates the token to be sold.
    // override this method to have crowdsale of a specific mintable token.
    function createTokenContract() internal returns (MintableToken) {
        return new LabCoin();
    }

}
