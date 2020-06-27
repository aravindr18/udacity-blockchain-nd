pragma solidity >=0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract SampleToken is ERC20("SampleToken", "SPT") {
    uint public INITIAL_SUPPLY = 10000 * (10 ** 18);
    constructor() public {
        _totalSupply = INITIAL_SUPPLY;
        _balances[msg.sender] = INITIAL_SUPPLY;
    }
}