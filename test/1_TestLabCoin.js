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

});
