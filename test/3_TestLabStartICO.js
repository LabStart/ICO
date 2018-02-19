let LabStartICO = artifacts.require("./LabStartICO.sol");
let MintableToken = artifacts.require("./MintableToken.sol");

var safeTimeout = require('safetimeout');
function sleep(ms) {
  return new Promise(resolve => safeTimeout.setTimeout(resolve, ms));
}


var icoConfig = require('../config/icoConfig.js');
const icoStartTime = icoConfig.ICO_START_TIME; // Start delay in seconds
const icoEndTime = icoConfig.ICO_END_TIME; // End delay in seconds
const accountOwnerNumber = icoConfig.ICO_OWNER_NUMBER; // Owner of the ico (defaut is 0)
const accountInvestorNumber = icoConfig.ICO_INVESTOR_NUMBER; // Owner of the ico (defaut is 1)
const icoRateFirstPhase = icoConfig.ICO_RATE_FIRST_PHASE;
const icoRateSecondPhase = icoConfig.ICO_RATE_SECOND_PHASE;
const icoCap = icoConfig.ICO_CAP;
const BigNumber = web3.BigNumber;

contract('LabStartICO', (accounts) => {
    let icoOwnerAddress = accounts[accountOwnerNumber];
    let investor = accounts[accountInvestorNumber];
    let _icoInstance;
    let _tokenInstance;


    /** Checking the ico meets the test requirements **/
    it("Checking the ico start time", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.startTime.call();
        }).then(startTime => {
            assert.equal(startTime.valueOf(), icoStartTime,
                "Start time does not correspond to the ico config");
        });
    });

    it("Checking the ico end time", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.endTime.call();
        }).then(endTime => {
            assert.equal(endTime.valueOf(), icoEndTime,
                "End time does not correspond to the ico config");
        });
    });

    it("Checking the ico cap", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.cap.call();
        }).then(cap => {
            assert.equal(cap.valueOf(), icoCap,
                "Cap does not correspond to the ico config");
        });
    });

    it("Checking the ico rate", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.rate.call();
        }).then(rate => {
            assert.equal(rate.valueOf(), icoRateFirstPhase,
                "Rate does not correspond to the ico config");
        });
    });

    it("Checking the ico wallet", () => {
        return _icoInstance.wallet.call()
        .then(walletAddress => {
            assert.equal(walletAddress, icoOwnerAddress,
                "The owner of the ico does not correspond to the ico config");
        });
    });

    it("There should be 0 LabCoin after the ico creation", () => {
        return _icoInstance.token.call()
        .then(tokenAddress => {
            _tokenInstance = MintableToken.at(tokenAddress);
            return _tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.valueOf(), 0,
                "There should be 0 LabCoin after the ico creation");
        });
    });


    // Waiting for the ico to start
    /**FIRST PHASE OF THE ICO IS ACTIVE**/
    // Buying max labcoins avalaible / 2
    it("Standard LabCoin purchase - First phase", () => {
        console.log('\tWaiting ' +
            ((icoStartTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((icoStartTime-getCurrentTimestamp())+2)*1000).then(function() {
            let investedAmount = web3.fromWei(icoCap/2, "ether"); // Invested amount by the investor, in ether
            let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(icoOwnerAddress), "ether");
            return _icoInstance.sendTransaction({
               value: web3.toWei(investedAmount, "ether"),
               from: investor
           }).then(function() {
                return _tokenInstance.balanceOf(investor);
           }).then(function(investorLabcoinBalance){
               // The investor should now have icoRate*investedAmount Labcoins
                assert.equal(investorLabcoinBalance.valueOf(),
                    new BigNumber(web3.toWei(icoRateFirstPhase*investedAmount, 'ether')),
                    "After buying, the investor should have icoRateFirstPhase*investedAmount Labcoins")
                return _icoInstance.weiRaised.call();
           }).then(function(weiRaised) {
               // The amount of token of the ico should be equal to the investedAmount
               assert.equal(new BigNumber(weiRaised), web3.toWei(investedAmount, 'ether'),
                "The amount of token of the ico should be equal to the investedAmount");
           })
        });
    });

    /**SECOND PHASE OF THE ICO IS ACTIVE**/
    // Buying all the remaining labcoin, to reach the cap
    it("Standard LabCoin purchase - Second phase", () => {
        let icoSecondPhaseStartTime;
        return _icoInstance._secondPhaseStartTime.call()
        .then(function(secondPhaseStartTime) {
            icoSecondPhaseStartTime = secondPhaseStartTime;
            console.log('\tWaiting ' +
                ((icoSecondPhaseStartTime-getCurrentTimestamp())+2) + ' seconds.');
        })
        .then(function() {
            // Waiting for the second phase of the ico to start
            return sleep(((icoSecondPhaseStartTime-getCurrentTimestamp())+2)*1000).then(function() {
                let investedAmount = web3.fromWei(icoCap/2, "ether"); // Invested amount by the investor, in ether
                let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(icoOwnerAddress), "ether");
                return _icoInstance.sendTransaction({
                   value: web3.toWei(investedAmount, "ether"),
                   from: investor
               }).then(function() {
                    return _tokenInstance.balanceOf(investor);
               }).then(function(investorLabcoinBalance){
                   // The investor should now have icoRate*investedAmount Labcoins
                    assert.equal(investorLabcoinBalance.valueOf(),
                        new BigNumber(web3.toWei(icoRateSecondPhase*investedAmount
                            + icoRateFirstPhase*investedAmount , 'ether')).valueOf(),
                        "After buying, the investor should have icoRateSecondPhase*investedAmount"
                        + " + icoRateFirstPhase*investedAmount Labcoins")
                    return _icoInstance.weiRaised.call();
               }).then(function(weiRaised) {
                   // The amount of token of the ico should be equal to the investedAmount
                   assert.equal(new BigNumber(weiRaised), web3.toWei(investedAmount*2, 'ether'),
                    "The amount of token of the ico should be equal to the investedAmount*2");
               })
            });
        })
    });

    it("Checking the cap works correctly", () => {
        return _icoInstance.sendTransaction({
           value: web3.toWei(0.02, "ether"),
           from: investor
       })
       .then(function() {
            assert.ok(false,
                "It should be impossible to buy LabCoins once the cap is reached");
        }).catch(function(err) {
            if(err.toString() !== "Error: VM Exception while processing transaction: revert") {
                throw err;
            }
        })
    });

    /**PRE-SALE IS OVER**/
    // The ico should be disabled
    it("Checking the ico meets the termination constraints", () => {
        console.log('\tWaiting ' +
            ((icoEndTime-getCurrentTimestamp())+2)*1000 + ' seconds.');
        return sleep(((icoEndTime-getCurrentTimestamp())+2)*1000).then(function() {
            return _icoInstance.sendTransaction({
               value: web3.toWei(0.02, "ether"),
               from: investor
           })
           .then(function() {
                assert.ok(false,
                    "It should be impossible to buy LabCoins once the ico is over");
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

function getCurrentTimestamp() {
    var unix = Math.round(+new Date()/1000);
    return unix;
}
