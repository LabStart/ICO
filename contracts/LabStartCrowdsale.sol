pragma solidity ^0.4.19;

import "./Crowdsale.sol";
import "./CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

import "./LabCoin.sol";

contract LabStartCrowdsale is CappedCrowdsale {
    function LabStartCrowdsale(uint256 startTime, uint256 endTime, uint256 rate,
        address wallet, uint256 cap, address labcoinAddress)
        Crowdsale(startTime, endTime, rate, wallet, labcoinAddress)
        CappedCrowdsale(cap) public {

    }
    
}
