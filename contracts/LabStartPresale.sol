pragma solidity ^0.4.19;

import "./LabStartCrowdsale.sol";

contract LabStartPresale is LabStartCrowdsale {
    uint256 private constant _rate = 500;

    function LabStartPresale(uint256 startTime, uint256 endTime, address wallet)
     LabStartCrowdsale(startTime, endTime, _rate, wallet) public {

    }
}
