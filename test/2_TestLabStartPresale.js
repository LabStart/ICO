let LabStartPresale = artifacts.require("./LabStartPresale.sol");
let LabCoin = artifacts.require("./LabCoin.sol");

var safeTimeout = require('safetimeout');
function sleep(ms) {
  return new Promise(resolve => safeTimeout.setTimeout(resolve, ms));
}

var presaleConfig = require('../config/presaleConfig.js');
const presaleStartTime = presaleConfig.PRESALE_START_TIME;
const presaleEndTime = presaleConfig.PRESALE_END_TIME;
const walletAccountNumber = presaleConfig.PRESALE_WALLET_ACCOUNT_NUMBER; // Owner of the presale (defaut is 0)
const accountInvestorNumber = presaleConfig.PRESALE_INVESTOR_NUMBER; // Owner of the presale (defaut is 1)
const presaleRate = presaleConfig.PRESALE_RATE;
const presaleCap = presaleConfig.PRESALE_CAP;
const presaleTokenAmount = presaleConfig.PRESALE_LABCOIN_CAP;
const BigNumber = web3.BigNumber;

contract('LabStartPresale', (accounts) => {
    let walletAddress = accounts[walletAccountNumber];
    let investor = accounts[accountInvestorNumber];
    let _presaleInstance;
    let _tokenInstance;


    /** Checking the presale meets the test requirements **/
    it("Checking the presale start time", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.openingTime.call();
        }).then(startTime => {
            assert.equal(startTime.valueOf(), presaleStartTime,
                "Start time does not correspond to the presale config");
        });
    });

    it("Checking the presale end time", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.closingTime.call();
        }).then(endTime => {
            assert.equal(endTime.valueOf(), presaleEndTime,
                "End time does not correspond to the presale config");
        });
    });

    it("Checking the presale rate", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.rate.call();
        }).then(rate => {
            assert.equal(rate.valueOf(), presaleRate,
                "Rate does not correspond to the presale config");
        });
    });

    it("Checking the presale wallet", () => {
        return _presaleInstance.wallet.call()
        .then(walletAddressCheck => {
            assert.equal(walletAddressCheck, walletAddress,
                "The owner of the presale does not correspond to the presale config");
        });
    });

    it("Checking the presale LabCoin balance", () => {
        return _presaleInstance.token.call()
        .then(tokenAddress => {
            _tokenInstance = LabCoin.at(tokenAddress);
            return _tokenInstance.balanceOf(_presaleInstance.address);
        }).then(presaleLabcoinBalance => {
            assert.equal(presaleLabcoinBalance.valueOf(), new BigNumber(presaleTokenAmount).valueOf(),
                "The presale should have " + presaleTokenAmount + " LabCoins at his creation");
        });
    });

    it("Waiting presale start time", () => {
        console.log('\tWaiting ' +
            ((presaleStartTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((presaleStartTime-getCurrentTimestamp())+2)*1000).then(function() {
        });
    });

    /**PRE-SALE ACTIVE**/
    // Trying to invest 0,09 eth while the min invest amount is 0,1 eth
    it("Min invest amount", () => {
        let investedAmount = web3.toWei(0.09, "ether");
        return _presaleInstance.sendTransaction({
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
        return _presaleInstance.sendTransaction({
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

    // Buying the max remaining Labcoins avalaible (i.e the cap) - 1 eth (because of the)
    // preceding test
    it("Whitelist LabCoin purchase", () => {
        let investedAmount = web3.fromWei(presaleCap, "ether");
        let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
        // Adding the investor to the presale whitelist
        return _presaleInstance.addToWhitelist(investor)
        .then(function() {
            return _presaleInstance.sendTransaction({
               value: web3.toWei(investedAmount, "ether"),
               from: investor
           })
       })
       .then(function() {
           // The owner of the presale should have +ether
           let ownerBalanceAfter = web3.fromWei(web3.eth.getBalance(walletAddress), "ether");
           assert.equal(precisionRound(ownerBalanceAfter.valueOf(), 10),
                precisionRound(parseFloat(ownerBalanceBefore)+parseFloat(investedAmount).valueOf(), 10),
                "The wallet should have +presaleCap-1 eth");
            // Checking the investor Labcoin balance
            return _tokenInstance.balanceOf(investor);
       })
       .then(function(investorLabcoinBalance){
           // The investor should now have presaleRate*investedAmount Labcoins
            assert.equal(new BigNumber(investorLabcoinBalance).valueOf(),
                new BigNumber(web3.toWei((presaleRate*investedAmount), 'ether')).valueOf(),
                "After buying, the investor should have presaleRate*investedAmount Labcoins")
            return _presaleInstance.weiRaised.call();
       })
       .then(function(weiRaised) {
           // The amount of token of the presale should be equal to the investedAmount
           assert.equal(weiRaised.valueOf(), new BigNumber(web3.toWei(investedAmount, 'ether')).valueOf(),
            "The amount of token of the presale should be equal to the investedAmount");
            return _tokenInstance.balanceOf(_presaleInstance.address);
       })
    });

    it("Checking the cap works correctly", () => {
        return _presaleInstance.sendTransaction({
           value: web3.toWei(0.11, "ether"),
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
    // The presale should be disabled
    it("No more LabCoin can be bought once the Presale has ended", () => {
        console.log('\tWaiting ' +
            ((presaleEndTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((presaleEndTime-getCurrentTimestamp())+2)*1000).then(function() {
            return _presaleInstance.sendTransaction({
               value: web3.toWei(0.02, "ether"),
               from: investor
           })
           .then(function() {
                assert.ok(false,
                    "It should be impossible to buy LabCoins once the presale is over");
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
