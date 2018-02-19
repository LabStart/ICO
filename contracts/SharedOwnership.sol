pragma solidity ^0.4.18;


/**
 * @title SharedOwnership
 * @dev A version of Ownable with two owners
 */
contract SharedOwnership {
  address public _ownerA;
  address public _ownerB;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


  /**
   * @dev The SharedOwnership constructor sets the original `owners` of the contract
   */
  function SharedOwnership(address ownerA, address ownerB) public {
      require(ownerA != ownerB);
      _ownerA = ownerA;
      _ownerB = ownerB;
  }

  /**
   * @dev Throws if called by any account other than one of the two owners
   */
  modifier onlyOwners() {
    require(msg.sender == _ownerA || msg.sender == _ownerB);
    _;
  }

  /**
   * @dev Allows one of the two owners to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwners {
    require(newOwner != address(0));
    require(newOwner != _ownerA && newOwner != _ownerB);
    if(msg.sender == _ownerA) {
        OwnershipTransferred(_ownerA, newOwner);
        _ownerA = newOwner;
    }
    else if(msg.sender == _ownerB) {
        OwnershipTransferred(_ownerB, newOwner);
        _ownerB = newOwner;
    }
    else {
        revert();
    }

  }

}
