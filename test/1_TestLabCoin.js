let LabCoin = artifacts.require("./LabCoin.sol");
var deployConfig = require('../config/deployConfig.js');

contract('LabCoin', (accounts) => {

    let _labcoinInstance;

    it("LabCoin name", () => {
        return LabCoin.deployed().then((labcoinInstance) => {
            _labcoinInstance = labcoinInstance;
            return _labcoinInstance.name();
        }).then(name => {
            assert.equal(name, "LabCoin", "LabCoin name should be: LabCoin");
        });
    });

    it("LabCoin symbol", () => {
        return _labcoinInstance.symbol()
        .then(symbol => {
          assert.equal(symbol, "LAB", "LabCoin symbol should be: LAB");
        });
    });

    it("LabCoin decimals", () => {
        _labcoinInstance.decimals()
        .then(decimals => {
          assert.equal(decimals, 18, "LabCoin decimals should be: 18");
        });
    });

    it("Ownly owners can mint", () => {
        return _labcoinInstance.mint(accounts[deployConfig.AVAILABLE_ACCOUNT_NUMBER_NOT_OWNER], 10,
            {from: accounts[deployConfig.LABCOIN_INITIAL_OWNER_A_ACCOUNT_NUMBER]})
       .then(function() {
            return _labcoinInstance.mint(
                accounts[deployConfig.LABCOIN_INITIAL_OWNER_A_ACCOUNT_NUMBER],
                10, {from: accounts[deployConfig.AVAILABLE_ACCOUNT_NUMBER_NOT_OWNER]})
        })
        .then(function() {
            assert.ok(false,
                 "Only the owner should be able to mint labcoins");
        }).catch(function(err) {
            if(err.toString() !== "Error: VM Exception while processing transaction: revert") {
                 throw err;
            }
        })
    });

});
