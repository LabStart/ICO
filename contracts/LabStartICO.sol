pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./LabStartCrowdsale.sol";

contract LabStartICO is LabStartCrowdsale {
    uint256 public _rateFirstPhase;
    uint256 public _rateSecondPhase;
    uint256 public _secondPhaseStartTime;

    function LabStartICO(uint256 startTime, uint256 secondPhaseStartTime,
        uint256 endTime, uint256 rateFirstPhase, uint256 rateSecondPhase,
        address wallet, uint256 cap, address labcoinAddress)
     LabStartCrowdsale(startTime, endTime, rateFirstPhase, wallet,
                                        cap, labcoinAddress) public {
         _rateFirstPhase = rateFirstPhase;
         _rateSecondPhase = rateSecondPhase;
         _secondPhaseStartTime = secondPhaseStartTime;
    }

    // Override this method to have a way to add business logic to your crowdsale when buying
    function getTokenAmount(uint256 weiAmount) internal view returns(uint256) {
        if(now >= _secondPhaseStartTime) {
            return weiAmount.mul(_rateSecondPhase);
        }
        else {
            return weiAmount.mul(_rateFirstPhase);
        }
    }
}
