pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

import "./LabCoin.sol";

contract LabStartCrowdsale is WhitelistedCrowdsale, FinalizableCrowdsale {
    using SafeMath for uint256;

    uint256 public labcoinsSold_; // Amount of tokens sold
    uint256 private minInvestAmount_;
    uint256 private maxInvestAmount_;
    uint256 private labcoinCap_;
    mapping(address => bool) public whitelist;


    /**
     * @param startTime The start time of the crowdsale (timestamp)
     * @param endTime The end time of the crowdsale (timestamp)
     * @param rate Number of LabCoin a buyer gets per wei
     * @param wallet Address where collected funds will be forwarded to
     * @param labcoinCap Max amount of LabCoins that can be bought via the crowdsale
     * @param minInvestAmount Min amount of wei for an investment in the crowdsale
     * @param labcoinAddress Address of the LabCoin
     */
    function LabStartCrowdsale(uint256 startTime, uint256 endTime, uint256 rate,
        address wallet, uint256 labcoinCap, uint256 minInvestAmount, address labcoinAddress)
        Crowdsale(rate, wallet, ERC20(labcoinAddress))
        TimedCrowdsale(startTime, endTime)
        public {
            minInvestAmount_ = minInvestAmount;
            labcoinCap_ = labcoinCap;
    }

    /**
     * @dev Return the number of LabCoins sold during the crowdsale.
     */
    function getNumberLabCoinsSold() external view returns (uint256) {
        return labcoinsSold_;
    }

    /**
     * @dev Extend parent behavior requiring purchase to:
            - be > 0.1 eth
     * @param _beneficiary Token purchaser
     * @param _weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
      super._preValidatePurchase(_beneficiary, _weiAmount);
      require(_weiAmount >= minInvestAmount_);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
      super._processPurchase(_beneficiary, _tokenAmount);

      require(labcoinsSold_.add(_tokenAmount) <= labcoinCap_);
      labcoinsSold_ = labcoinsSold_.add(_tokenAmount);
    }

}
