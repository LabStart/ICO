pragma solidity ^0.4.19;

import "./ERC223ReceivingContract.sol";
import "./SafeMath.sol";
import "./ERC20.sol";
import "./Token.sol";

contract Crowdsale is ERC223ReceivingContract {
    using SafeMath for uint;

    Token private _tokenContract;
    address private _crowdSaleCreatorAddress;
    uint private constant _startTime = 1518716940; // 16/02/18 18:49:00 UTC+1
    uint private constant _endTime = 1518717060; // 17/02/18 00:01:00 UTC+1
    uint private constant _limit = 10; // 10 max token per person
    uint private _tokenPrice; // How much 1 token cost (in wei)
    uint private _hardCap;

    uint private _balance; // Token balance
    mapping (address => uint) private _limits;

    // Events
    event Buy(address buyer, uint amount); // amount: the amount of token bought

    // Modifiers
    modifier inTimeLimit() {
        require(block.timestamp >= _startTime && block.timestamp < _endTime);
        _;
    }

    modifier isAvailable() {
        require(block.timestamp >= _startTime && block.timestamp < _endTime);
        require(_balance > 0);
        _;
    }

    modifier withinLimits(address recipient, uint valueInWei) {
        uint amount = valueInWei.div(_tokenPrice); // Amount of token for this number of wei sent
        require(_limits[recipient].add(amount) <= _limit);
        _;
    }

    // Methods
    // @param tokenPrice: The price of 1 token (in ether)
    function Crowdsale(address tokenContractAddress, uint tokenPrice, uint hardCap) public {
        _crowdSaleCreatorAddress = msg.sender;
        _tokenContract = Token(tokenContractAddress);
        _tokenPrice = tokenPrice;
        _hardCap = hardCap;
    }

    function () public payable {
        revert();
    }

    function availableBalance() public view returns (uint) {
        return _balance;
    }

    function buy() public payable /*isAvailable withinLimits*/ {
        buyFor(msg.sender);
    }

    function buyFor(address beneficiary) public payable isAvailable
    withinLimits(beneficiary, msg.value) {
        if(msg.value > 0) {
            uint amount = (msg.value).div(_tokenPrice); // Amount of token for this number of wei sent
            _tokenContract.transfer(beneficiary, amount);
            _balance = _balance.sub(amount);
            _limits[beneficiary] = _limits[beneficiary].add(amount);
            Buy(beneficiary, amount);
        }
    }

    function tokenFallback(address from, uint value, bytes data) public inTimeLimit {
        require(from == address(_tokenContract) ||
                from == _crowdSaleCreatorAddress);
        _balance = _balance.add(value);
    }
}
