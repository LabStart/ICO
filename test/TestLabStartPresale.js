let LabStartPresale = artifacts.require("./LabStartPresale.sol");
let MintableToken = artifacts.require("./MintableToken.sol");

var sleep = require('sleep-promise');
var constTests = require('../constTests.js');
const crowdsaleStartDelay = constTests.CROWDSALE_START_DELAY; // Start delay in seconds
const crowdsaleEndDelay = constTests.CROWDSALE_END_DELAY; // End delay in seconds

contract('LabStartPresale', (accounts) => {
    let creatorAddress = accounts[0];
    let investor = accounts[1];
    let _crowdSaleInstance;
    let _tokenInstance;
    const presaleRate = 500;


    /** Checking the crowdsale meets the test requirements **/
    // For those tests, the crowdsale should start in max 5 seconds
    it("Checking the crowdsale start time", () => {
        return LabStartPresale.deployed().then((crowdSaleInstance) => {
            _crowdSaleInstance = crowdSaleInstance
            return _crowdSaleInstance.startTime.call();
        }).then(startTime => {
            let startTimeInferiorInFiveSec =
                startTime <= getCurrentTimestampPlusSec(crowdsaleStartDelay+2);
            assert.ok(startTimeInferiorInFiveSec,
                "For those tests, the crowdsale should start in max 5 seconds");
        });
    });

    // For those tests, the crowdsale wallet should be accounts[0]
    it("Checking the crowdsale wallet", () => {
        return _crowdSaleInstance.wallet.call()
        .then(walletAddress => {
            assert.equal(walletAddress, creatorAddress,
                "For those tests, the crowdsale wallet should be accounts[0]");
        });
    });

    it("There should be 0 LabCoin after the Crowdsale creation", () => {
        return _crowdSaleInstance.token.call()
        .then(tokenAddress => {
            _tokenInstance = MintableToken.at(tokenAddress);
            return _tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.valueOf(), 0,
                "There should be 0 LabCoin after the Crowdsale creation");
        });
    });


    // Waiting for the crowdsale to start
    /**PRE-SALE ACTIVE**/
    it("Standard LabCoin purchase", () => {
        return sleep((crowdsaleStartDelay+2)*1000).then(function() {
            let investedAmount = 0.02; // Invested amount by the investor, in ether
            let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(creatorAddress), "ether");
            return _crowdSaleInstance.sendTransaction({
               value: web3.toWei(investedAmount, "ether"),
               from: investor
           }).then(function() {
               // The owner of the crowdsale should have +1 ether
               let ownerBalanceAfter = web3.fromWei(web3.eth.getBalance(creatorAddress), "ether");
               assert.equal(precisionRound(ownerBalanceAfter.valueOf(), 10),
                    precisionRound(parseFloat(ownerBalanceBefore)+parseFloat(investedAmount).valueOf(), 10),
                    "There should be 0 LabCoin after the Crowdsale creation");
                // Checking the investor Labcoin balance
                return _tokenInstance.balanceOf(investor);
           }).then(function(investorLabcoinBalance){
               // The investor should now have presaleRate*investedAmount Labcoins
                assert.equal(investorLabcoinBalance.valueOf(),
                    web3.toWei(presaleRate*investedAmount, 'ether'),
                    "After buying, the investor should have presaleRate*investedAmount Labcoins")
                return _crowdSaleInstance.weiRaised.call();
           }).then(function(weiRaised) {
               // The amount of token of the crowdsale should be equal to the investedAmount
               assert.equal(weiRaised, (web3.toWei(investedAmount, 'ether')).valueOf(),
                "The amount of token of the crowdsale should be equal to the investedAmount");
           })
        });
    });

    /**PRE-SALE IS OVER**/
    // The crowdsale should be disabled
    it("Checking the crowdsale meets the termination constraints", () => {
        return sleep((crowdsaleEndDelay+2)*1000).then(function() {
            return _crowdSaleInstance.sendTransaction({
               value: web3.toWei(0.02, "ether"),
               from: investor
           })
           .then(function() {
                assert.ok(false,
                    "It should be impossible to buy LabCoins once the crowdsale is over");
            }).catch(function(err) {
                if(err.toString() !== "Error: VM Exception while processing transaction: revert") {
                    throw err;
                }
            })
        });
   });

});


function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function getCurrentTimestampPlusSec(plusSec) {
    var unix = Math.round(+new Date()/1000);
    return unix+plusSec;
}
