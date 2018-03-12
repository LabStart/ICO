let LabStartICO = artifacts.require("./LabStartICO.sol");
let LabStartPresale = artifacts.require("./LabStartPresale.sol");
let LabCoin = artifacts.require("./LabCoin.sol");

var safeTimeout = require('safetimeout');
function sleep(ms) {
  return new Promise(resolve => safeTimeout.setTimeout(resolve, ms));
}


var icoConfig = require('../config/icoConfig.js');
const icoStartTime = icoConfig.ICO_START_TIME;
const icoSecondPhaseStartTime = icoConfig.ICO_SECOND_PHASE_START_TIME;
const icoEndTime = icoConfig.ICO_END_TIME; // End delay in seconds
const walletAccountNumber = icoConfig.ICO_WALLET_ACCOUNT_NUMBER; // Owner of the ico (defaut is 0)
const accountInvestorNumber = icoConfig.ICO_INVESTOR_NUMBER; // Owner of the ico (defaut is 1)
const icoRateFirstPhase = icoConfig.ICO_RATE_FIRST_PHASE;
const icoRateSecondPhase = icoConfig.ICO_RATE_SECOND_PHASE;
const icoTokenAmount = icoConfig.ICO_TOKEN_AMOUNT;
const BigNumber = web3.BigNumber;

contract('LabStartICO', (accounts) => {
    let walletAddress = accounts[walletAccountNumber];
    let investor = accounts[accountInvestorNumber];
    let _icoInstance;
    let _tokenInstance;


    /** Checking the ico meets the test requirements **/
    it("Checking the ico start time", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.openingTime.call();
        }).then(startTime => {
            assert.equal(startTime.valueOf(), icoStartTime,
                "Start time does not correspond to the ico config");
        });
    });

    it("Checking the ico end time", () => {
        return LabStartICO.deployed().then((icoInstance) => {
            _icoInstance = icoInstance
            return _icoInstance.closingTime.call();
        }).then(endTime => {
            assert.equal(endTime.valueOf(), icoEndTime,
                "End time does not correspond to the ico config");
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
        .then(walletAddressCheck => {
            assert.equal(walletAddressCheck, walletAddress,
                "The owner of the ico does not correspond to the ico config");
        });
    });

    it("Checking the ico LabCoin balance", () => {
        return _icoInstance.token.call()
        .then(tokenAddress => {
            _tokenInstance = LabCoin.at(tokenAddress);
            return _tokenInstance.balanceOf(_icoInstance.address);
        }).then(icoLabcoinBalance => {
            assert.equal(icoLabcoinBalance.valueOf(), new BigNumber(icoTokenAmount).valueOf(),
                "The ico should have " + icoTokenAmount + " LabCoins at his creation");
        });
    });

    it("Waiting ico start time", () => {
        console.log('\tWaiting ' +
            ((icoStartTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((icoStartTime-getCurrentTimestamp())+2)*1000).then(function() {
        });
    });


    // Waiting for the ico to start
    /**FIRST PHASE OF THE ICO IS ACTIVE**/
    // Trying to invest 0,09 eth while the min invest amount is 0,1 eth
    it("Min invest amount", () => {
        let investedAmount = web3.toWei(0.09, "ether");
        return _icoInstance.sendTransaction({
           value: investedAmount,
           from: investor
       })
       .then(function() {
            assert.ok(false,
                "It should be impossible to invest 0.09 eth. The min invest Amount is 0.1 eth.");
        }).catch(function(err) {
            if(err.toString() !== "Error: VM Exception while processing transaction: revert") {
                throw err;
            }
        })
    });

    // Trying to invest 0,09 eth while the min invest amount is 0,1 eth
    it("Not whitelisted", () => {
        let investedAmount = web3.toWei(1.0011, "ether");
        return _icoInstance.sendTransaction({
           value: investedAmount,
           from: investor
       })
       .then(function() {
            assert.ok(false,
                "It should be impossible to invest more than 1 eth without being whitelisted");
        }).catch(function(err) {
            if(err.toString() !== "Error: VM Exception while processing transaction: revert") {
                throw err;
            }
        })
    });

    // Investing 1 eth
    it("Standard LabCoin purchase - First phase", () => {
        let investedAmount = 1; // Invested amount by the investor, in ether
        let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
        return _icoInstance.addToWhitelist(investor)
        .then(function() {
            return _icoInstance.sendTransaction({
               value: web3.toWei(investedAmount, "ether"),
               from: investor
           })
        })
        .then(function() {
            return _tokenInstance.balanceOf(investor);
        }).then(function(investorLabcoinBalance){
           // The investor should now have icoRateFirstPhase*investedAmount Labcoins
            assert.equal(investorLabcoinBalance.valueOf(),
                new BigNumber(web3.toWei(icoRateFirstPhase*investedAmount, 'ether')).valueOf(),
                "After buying, the investor should have icoRateFirstPhase*investedAmount Labcoins")
            return _icoInstance.weiRaised.call();
        }).then(function(weiRaised) {
           // The amount of token of the ico should be equal to the investedAmount
           assert.equal(weiRaised.valueOf(), new BigNumber(web3.toWei(investedAmount, 'ether')).valueOf(),
            "The amount of token of the ico should be equal to the investedAmount");
            return _tokenInstance.balanceOf(_icoInstance.address);
        })
    });

    it("Waiting ico second phase to start", () => {
        console.log('\tWaiting ' +
            ((icoSecondPhaseStartTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((icoSecondPhaseStartTime-getCurrentTimestamp())+2)*1000).then(function() {
        });
    });

    /**SECOND PHASE OF THE ICO IS ACTIVE**/
    // Investing 1 eth
    it("Standard LabCoin purchase - Second phase", () => {
        let investedAmount = 1; // Invested amount by the investor, in ether
        let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
        return _icoInstance.sendTransaction({
           value: web3.toWei(investedAmount, "ether"),
           from: investor
       }).then(function() {
            // Checking the investor Labcoin balance
            return _tokenInstance.balanceOf(investor);
       }).then(function(investorLabcoinBalance){
           // The investor should now have icoRateSecondPhase*investedAmount Labcoins
            assert.equal(investorLabcoinBalance.valueOf(),
                new BigNumber(web3.toWei((icoRateSecondPhase*investedAmount) + 400, 'ether')).valueOf(),
                "After buying, the investor should have icoRateSecondPhase*investedAmount Labcoins")
            return _icoInstance.weiRaised.call();
       }).then(function(weiRaised) {
           // The amount of token of the ico should be equal to the investedAmount
           assert.equal(weiRaised.valueOf(), new BigNumber(web3.toWei(investedAmount+1, 'ether')).valueOf(),
            "The amount of token of the ico should be equal to the investedAmount");
            return _tokenInstance.balanceOf(_icoInstance.address);
       })
    });

    /**ICO IS OVER**/
    // The ico should be disabled
    it("Checking the ico meets the termination constraints", () => {
        console.log('\tWaiting ' +
            ((icoEndTime-getCurrentTimestamp())+2) + ' seconds.');
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

   // The finalization should send LabCoins to the team and burn the remaining
   // Labcoins. The team should also get the eth raised during the ico, on
   // the wallet.
   it("The finalize should burn the remaining Labcoins", () => {
        let labcoinsSoldDuringPresale;
        let labcoinsSoldDuringICO;
        let presaleInstance;
        // The wallet should have 0 eth
        let walletBalanceBeforeFinalize = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
        assert.equal(walletBalanceBeforeFinalize.valueOf(), 0, "The team wallet should have 0 eth");
        return _tokenInstance.balanceOf(_icoInstance.address)
        .then(function(icoBalance) {
           assert.ok(icoBalance.valueOf() > 0,
            "The balance of the ico should > 0");
           return _icoInstance.finalize()
       })
        .then(function() {
            // The wallet should have +ether
            let walletBalanceAfterFinalize = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
            assert.equal(walletBalanceAfterFinalize.valueOf(), 0,
            "The team wallet should have 0 eth cause the cap has not been reached");
            return _tokenInstance.balanceOf(_icoInstance.address)
        })
        .then(function(icoBalance) {
           assert.equal(icoBalance.valueOf(),
           new BigNumber(0).valueOf(),
            "The remaining LabCoins of the ico should be burned once the finalize " +
            "function has been called.");
            return LabStartPresale.deployed();
        })
        .then(function(presaleInstanceReturned) {
            presaleInstance = presaleInstanceReturned;
            return presaleInstance.getNumberLabCoinsSold();
        })
        .then(function(numberOfLabcoinsSoldPresale) {
            labcoinsSoldDuringPresale = numberOfLabcoinsSoldPresale;
            return _icoInstance.getNumberLabCoinsSold();
        })
        .then(function(numberOfLabcoinsSoldICO) {
            labcoinsSoldDuringICO = numberOfLabcoinsSoldICO;
            return _tokenInstance.balanceOf(walletAddress);
        })
        .then(function(teamLabCoinBalance) {
            console.log('labcoinsSoldDuringPresale', labcoinsSoldDuringPresale);
            console.log('labcoinsSoldDuringICO', labcoinsSoldDuringICO);
            console.log('teamLabCoinBalance', teamLabCoinBalance);
            assert.equal(parseInt(labcoinsSoldDuringPresale) + parseInt(labcoinsSoldDuringICO)
            + parseInt(teamLabCoinBalance), 5*teamLabCoinBalance,
             "The team should have 20% of the LabCoins at the end of the ICO.");
        })
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
