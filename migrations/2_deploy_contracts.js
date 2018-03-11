var LabCoin = artifacts.require("./LabCoin.sol");
var LabStartPresale = artifacts.require("./LabStartPresale.sol");
let LabStartICO = artifacts.require("./LabStartICO.sol");
var LabCoin = artifacts.require("./LabCoin.sol");
var deployConfig = require('../config/deployConfig.js');
var presaleConfig = require('../config/presaleConfig.js');
var icoConfig = require('../config/icoConfig.js');

module.exports = function(deployer, network, accounts) {
    const wallet = accounts[presaleConfig.PRESALE_WALLET_ACCOUNT_NUMBER];

    /**Deployment of the LabCoin**/
    let labCoinInstance;
    const maxAmountCrowdsale = presaleConfig.PRESALE_LABCOIN_CAP
        + icoConfig.ICO_TOKEN_AMOUNT;
    console.log('maxAmountCrowdsale', maxAmountCrowdsale);

    return deployer.deploy(LabCoin, maxAmountCrowdsale)
    .then(function() {
        return LabCoin.deployed().then((labCoinInstanceDeployed) => {
            labCoinInstance = labCoinInstanceDeployed;
        });
    })
    .then(function() {
        /**Deployment of the presale**/
        const startTimePresale = presaleConfig.PRESALE_START_TIME;
        const endTimePresale = presaleConfig.PRESALE_END_TIME;
        const ratePresale = presaleConfig.PRESALE_RATE;
        const minInvestAmount = presaleConfig.PRESALE_MIN_INVEST_AMOUNT;
        const maxInvestAmount = presaleConfig.PRESALE_MAX_INVEST_AMOUNT;
        const labCoinCap =  presaleConfig.PRESALE_LABCOIN_CAP;

        console.log('Presale --', 'startTimePresale: ' + startTimePresale,
            'endTimePresale: ' + endTimePresale, 'ratePresale: ' + ratePresale,
            'minInvestAmount' + minInvestAmount,
            accounts[0]);
        return deployer.deploy(LabStartPresale, startTimePresale, endTimePresale,
            ratePresale, wallet, labCoinCap, minInvestAmount, maxInvestAmount,
            LabCoin.address);
    })
    .then(function() {
        /** Sending enough LabCoin for the presale **/
        return labCoinInstance.transfer(LabStartPresale.address,
            presaleConfig.PRESALE_LABCOIN_CAP);
    })
    .then(function() {
        /**Deployment of the ico**/
        const startTimeIco = icoConfig.ICO_START_TIME;
        const secondPhaseStartTimeIco = icoConfig.ICO_SECOND_PHASE_START_TIME;
        const endTimeIco = icoConfig.ICO_END_TIME;
        const rateFirstPhaseIco = icoConfig.ICO_RATE_FIRST_PHASE;
        const rateSecondPhaseIco = icoConfig.ICO_RATE_SECOND_PHASE;
        const minInvestAmount = icoConfig.ICO_MIN_INVEST_AMOUNT;
        const maxInvestAmount = icoConfig.ICO_MAX_INVEST_AMOUNT;
        const labCoinCap =  icoConfig.ICO_LABCOIN_CAP;
        const icoGoal = icoConfig.ICO_SOFT_CAP;

        console.log('ICO --', 'startTimeIco: ' + startTimeIco, 'secondPhaseStartTimeIco: '
            + secondPhaseStartTimeIco, 'endTimeIco: ' + endTimeIco,
            'rateFirstPhaseIco: ' + rateFirstPhaseIco, 'rateSecondPhaseIco: '
            + rateSecondPhaseIco, wallet);
        return deployer.deploy(LabStartICO, startTimeIco, secondPhaseStartTimeIco,
            endTimeIco, rateFirstPhaseIco, rateSecondPhaseIco, wallet, labCoinCap,
            minInvestAmount, maxInvestAmount, LabCoin.address,
            LabStartPresale.address, icoGoal);
    })
    .then(function() {
        /** Sending enough LabCoin for the ICO **/
        return labCoinInstance.transfer(LabStartICO.address,
            icoConfig.ICO_TOKEN_AMOUNT);
    })

};
