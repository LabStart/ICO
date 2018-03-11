pragma solidity ^0.4.19;

import "./LabStartCrowdsale.sol";
import "./LabCoin.sol";

contract LabStartPresale is LabStartCrowdsale {
    function LabStartPresale(uint256 startTime, uint256 endTime, uint256 rate,
        address wallet, uint256 labcoinCap, uint256 minInvestAmount, uint256 maxInvestAmount,
        address labcoinAddress)
     LabStartCrowdsale(startTime, endTime, rate, wallet, labcoinCap,
         minInvestAmount, maxInvestAmount, labcoinAddress) public {

    }

    /**
     * @dev Function called by the team at the end of the Presale. Burns the remaining
     * LabCoins.
     */
    function finalization() internal {
        super.finalization();
        LabCoin labcoinInstance = LabCoin(token);
        uint256 presaleRemainingLabcoins = labcoinInstance.balanceOf(address(this));
        labcoinInstance.burn(presaleRemainingLabcoins);
    }
}
