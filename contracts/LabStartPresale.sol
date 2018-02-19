pragma solidity ^0.4.19;

import "./LabStartCrowdsale.sol";

contract LabStartPresale is LabStartCrowdsale {
    function LabStartPresale(uint256 startTime, uint256 endTime, uint256 rate,
        address wallet, uint256 cap, address labcoinAddress)
     LabStartCrowdsale(startTime, endTime, rate, wallet, cap, labcoinAddress) public {

    }
}
