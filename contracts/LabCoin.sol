pragma solidity ^0.4.19;

import "./SharedMintableToken.sol";

contract LabCoin is SharedMintableToken {
    string public constant name = "LabCoin";
    string public constant symbol = "LAB";
    uint8 public constant decimals = 18;

    function LabCoin(address ownerA, address ownerB)
        SharedMintableToken(ownerA, ownerB) public {

    }
}
