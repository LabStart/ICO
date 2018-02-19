var LabCoin = artifacts.require("./LabCoin.sol");
var LabStartPresale = artifacts.require("./LabStartPresale.sol");
let LabStartICO = artifacts.require("./LabStartICO.sol");
var LabCoin = artifacts.require("./LabCoin.sol");
var deployConfig = require('../config/deployConfig.js');
var presaleConfig = require('../config/presaleConfig.js');
var icoConfig = require('../config/icoConfig.js');

module.exports = function(deployer, network, accounts) {

    /**Deployment of the LabCoin**/
    let labcoinInitialOwnerA = accounts[deployConfig.LABCOIN_INITIAL_OWNER_A_ACCOUNT_NUMBER];
    let labcoinInitialOwnerB = accounts[deployConfig.LABCOIN_INITIAL_OWNER_B_ACCOUNT_NUMBER];
    return deployer.deploy(LabCoin, labcoinInitialOwnerA, labcoinInitialOwnerB)
    .then(function() {
        /**Deployment of the presale**/
        const startTimePresale = presaleConfig.PRESALE_START_TIME;
        const endTimePresale = presaleConfig.PRESALE_END_TIME;
        const ratePresale = presaleConfig.PRESALE_RATE;
        const capPresale = presaleConfig.PRESALE_CAP;

        console.log('Presale --', 'startTimePresale: ' + startTimePresale,
            'endTimePresale: ' + endTimePresale, 'ratePresale: ' + ratePresale,
            'capPresale: ' + capPresale, accounts[0]);
        return deployer.deploy(LabStartPresale, startTimePresale, endTimePresale,
            ratePresale, accounts[0], capPresale, LabCoin.address);
    })
    .then(function() {
        /**Deployment of the ico**/
        const startTimeIco = icoConfig.ICO_START_TIME;
        const secondPhaseStartTimeIco = icoConfig.ICO_SECOND_PHASE_START_TIME;
        const endTimeIco = icoConfig.ICO_END_TIME;
        const rateFirstPhaseIco = icoConfig.ICO_RATE_FIRST_PHASE;
        const rateSecondPhaseIco = icoConfig.ICO_RATE_SECOND_PHASE;
        const capIco = icoConfig.ICO_CAP;

        console.log('ICO --', 'startTimeIco: ' + startTimeIco, 'secondPhaseStartTimeIco: '
            + secondPhaseStartTimeIco, 'endTimeIco: ' + endTimeIco,
            'rateFirstPhaseIco: ' + rateFirstPhaseIco, 'rateSecondPhaseIco: '
            + rateSecondPhaseIco, 'capIco: ' + capIco, accounts[0]);
        return deployer.deploy(LabStartICO, startTimeIco, secondPhaseStartTimeIco,
            endTimeIco, rateFirstPhaseIco, rateSecondPhaseIco, accounts[0],
            capIco, LabCoin.address);
    })
    .then(function() {
        /**Transferring the minting control of the LabCoin to the presale**/
        return LabCoin.deployed().then((labcoinInstance) => {
            return labcoinInstance.transferOwnership(LabStartPresale.address,
                {from: labcoinInitialOwnerA});
        }).then(function() {
            console.log('LabCoin minting control transferred to the Presale contract');
        });
    })
    .then(function() {
        /**Transferring the minting control of the LabCoin to the ICO**/
        return LabCoin.deployed().then((labcoinInstance) => {
            return labcoinInstance.transferOwnership(LabStartICO.address,
                {from: labcoinInitialOwnerB});
        }).then(function() {
            console.log('LabCoin minting control transferred to the ICO contract');
        });
    })

};
