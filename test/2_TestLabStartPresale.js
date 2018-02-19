let LabStartPresale = artifacts.require("./LabStartPresale.sol");
let MintableToken = artifacts.require("./MintableToken.sol");

var safeTimeout = require('safetimeout');
function sleep(ms) {
  return new Promise(resolve => safeTimeout.setTimeout(resolve, ms));
}

var presaleConfig = require('../config/presaleConfig.js');
const presaleStartTime = presaleConfig.PRESALE_START_TIME; // Start delay in seconds
const presaleEndTime = presaleConfig.PRESALE_END_TIME; // End delay in seconds
const accountOwnerNumber = presaleConfig.PRESALE_OWNER_NUMBER; // Owner of the presale (defaut is 0)
const accountInvestorNumber = presaleConfig.PRESALE_INVESTOR_NUMBER; // Owner of the presale (defaut is 1)
const presaleRate = presaleConfig.PRESALE_RATE;
const presaleCap = presaleConfig.PRESALE_CAP;
const BigNumber = web3.BigNumber;

contract('LabStartPresale', (accounts) => {
    let presaleOwnerAddress = accounts[accountOwnerNumber];
    let investor = accounts[accountInvestorNumber];
    let _presaleInstance;
    let _tokenInstance;


    /** Checking the presale meets the test requirements **/
    it("Checking the presale start time", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.startTime.call();
        }).then(startTime => {
            assert.equal(startTime.valueOf(), presaleStartTime,
                "Start time does not correspond to the presale config");
        });
    });

    it("Checking the presale end time", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.endTime.call();
        }).then(endTime => {
            assert.equal(endTime.valueOf(), presaleEndTime,
                "End time does not correspond to the presale config");
        });
    });

    it("Checking the presale cap", () => {
        return LabStartPresale.deployed().then((presaleInstance) => {
            _presaleInstance = presaleInstance
            return _presaleInstance.cap.call();
        }).then(cap => {
            assert.equal(cap.valueOf(), presaleCap,
                "Cap does not correspond to the presale config");
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
        .then(walletAddress => {
            assert.equal(walletAddress, presaleOwnerAddress,
                "The owner of the presale does not correspond to the presale config");
        });
    });

    it("There should be 0 LabCoin after the presale creation", () => {
        return _presaleInstance.token.call()
        .then(tokenAddress => {
            _tokenInstance = MintableToken.at(tokenAddress);
            return _tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.valueOf(), 0,
                "There should be 0 LabCoin after the presale creation");
        });
    });


    /**PRE-SALE ACTIVE**/
    // Buying the max labcoins avalaible (i.e the cap)
    it("Standard LabCoin purchase", () => {
        console.log('\tWaiting ' +
            ((presaleStartTime-getCurrentTimestamp())+2) + ' seconds.');
        return sleep(((presaleStartTime-getCurrentTimestamp())+2)*1000).then(function() {
            let investedAmount = web3.fromWei(presaleCap, "ether"); // Invested amount by the investor, in ether
            let ownerBalanceBefore = web3.fromWei(web3.eth.getBalance(presaleOwnerAddress), "ether");
            return _presaleInstance.sendTransaction({
               value: web3.toWei(investedAmount, "ether"),
               from: investor
           }).then(function() {
               // The owner of the presale should have +1 ether
               let ownerBalanceAfter = web3.fromWei(web3.eth.getBalance(presaleOwnerAddress), "ether");
               assert.equal(precisionRound(ownerBalanceAfter.valueOf(), 10),
                    precisionRound(parseFloat(ownerBalanceBefore)+parseFloat(investedAmount).valueOf(), 10),
                    "There should be 0 LabCoin after the presale creation");
                // Checking the investor Labcoin balance
                return _tokenInstance.balanceOf(investor);
           }).then(function(investorLabcoinBalance){
               // The investor should now have presaleRate*investedAmount Labcoins
                assert.equal(investorLabcoinBalance.valueOf(),
                    new BigNumber(web3.toWei(presaleRate*investedAmount, 'ether')),
                    "After buying, the investor should have presaleRate*investedAmount Labcoins")
                return _presaleInstance.weiRaised.call();
           }).then(function(weiRaised) {
               // The amount of token of the presale should be equal to the investedAmount
               assert.equal(new BigNumber(weiRaised), web3.toWei(investedAmount, 'ether'),
                "The amount of token of the presale should be equal to the investedAmount");
           })
        });
    });

    it("Checking the cap works correctly", () => {
        return _presaleInstance.sendTransaction({
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
    // The presale should be disabled
    it("Checking the presale meets the termination constraints", () => {
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
