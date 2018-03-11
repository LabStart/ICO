pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "./LabStartCrowdsale.sol";
import "./LabStartPresale.sol";

contract LabStartICO is LabStartCrowdsale, RefundableCrowdsale {
    using SafeMath for uint256;

    uint256 private _rateFirstPhase;
    uint256 private _rateSecondPhase;
    uint256 private _secondPhaseStartTime;
    address private _presaleAddress;

    function LabStartICO(uint256 startTime, uint256 secondPhaseStartTime,
        uint256 endTime, uint256 rateFirstPhase, uint256 rateSecondPhase,
        address wallet, uint256 labcoinCap, uint256 minInvestAmount,
        uint256 maxInvestAmount, address labcoinAddress, address presaleAddress,
        uint256 goal)
        LabStartCrowdsale(startTime, endTime, rateFirstPhase, wallet, labcoinCap,
        minInvestAmount, maxInvestAmount, labcoinAddress)
        RefundableCrowdsale(goal)
        public {
         _rateFirstPhase = rateFirstPhase;
         _rateSecondPhase = rateSecondPhase;
         _secondPhaseStartTime = secondPhaseStartTime;
         _presaleAddress = presaleAddress;
    }

    // Override this method to have a way to add business logic to your crowdsale when buying
    function _getTokenAmount(uint256 weiAmount) internal view returns(uint256) {
        if(now >= _secondPhaseStartTime) {
            return weiAmount.mul(_rateSecondPhase);
        }
        else {
            return weiAmount.mul(_rateFirstPhase);
        }
    }

    /**
     * @dev Function called by the team at the end of the ICO. Sends LabCoins to
     * the team such as the team owns 20% of the total supply of LabCoins after
     * the ico, and then burns the remaining LabCoins.
     */
    function finalization() internal {
        super.finalization();
        LabCoin labcoinInstance = LabCoin(token);
        LabStartPresale presaleInstance = LabStartPresale(_presaleAddress);

        uint256 labcoinsSoldDuringPresale = presaleInstance.getNumberLabCoinsSold();
        uint256 labcoinsSoldDuringICO = labcoinsSold_;
        uint256 amountOfLabCoinToSendToTeam = (labcoinsSoldDuringPresale.add(labcoinsSoldDuringICO)).div(4);
        labcoinInstance.transfer(wallet, amountOfLabCoinToSendToTeam);

        uint256 presaleRemainingLabcoins = labcoinInstance.balanceOf(address(this));
        labcoinInstance.burn(presaleRemainingLabcoins);
    }
}
