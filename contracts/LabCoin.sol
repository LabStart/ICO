pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract LabCoin is StandardToken, BurnableToken {
    string public constant name = "LabCoin";
    string public constant symbol = "LAB";
    uint8 public constant decimals = 18;

    /**
    * @param totalSupply The amount of LabCoin available for the whole crowdsale
                      (i.e presale, ico and team)
    */
    function LabCoin(uint totalSupply) public {
        totalSupply_ = totalSupply;
        balances[msg.sender] = totalSupply;
    }
}
