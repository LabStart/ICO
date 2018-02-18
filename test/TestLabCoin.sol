pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "../contracts/LabCoin.sol";

contract TestLabCoin {

  LabCoin private _labCoin;

  function beforeEach() public {
    _labCoin = new LabCoin();
  }

}
