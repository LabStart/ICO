pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract LabCoin is MintableToken {
    string public constant name = "LabCoin";
    string public constant symbol = "LAB";
    uint8 public constant decimals = 18;
}
