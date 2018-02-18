let LabCoin = artifacts.require("./LabCoin.sol");

contract('LabCoin', (accounts) => {

    it("LabCoin name", () => {
        return LabCoin.deployed().then((instance) => {
          return instance.name();
        }).then(name => {
          assert.equal(name, "LabCoin", "LabCoin name should be: LabCoin");
        });
    });

    it("LabCoin symbol", () => {
        return LabCoin.deployed().then((instance) => {
          return instance.symbol();
        }).then(symbol => {
          assert.equal(symbol, "LAB", "LabCoin symbol should be: LAB");
        });
    });

    it("LabCoin decimals", () => {
        return LabCoin.deployed().then((instance) => {
          return instance.decimals();
        }).then(decimals => {
          assert.equal(decimals, 18, "LabCoin decimals should be: 18");
        });
    });

});
