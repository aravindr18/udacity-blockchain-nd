pragma solidity >=0.4.24;

contract StarNotaryV1 {

    string public starName;
    address public starOwner;

    event starClaimed(address owner);

    constructor() public {
        starName = "Awesome Star";
    }

    function claimStar() public {
        starOwner = msg.sender;
        emit starClaimed(msg.sender);
    }

    function changeName(string memory _name) public {
        starName = _name;
    }  

}