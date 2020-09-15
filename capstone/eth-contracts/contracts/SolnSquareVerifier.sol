pragma solidity ^0.5.0;

import "./ERC721Mintable.sol";
import "./verifier.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
contract SquareVerifier is Verifier {}

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is MyRealEstateToken { 

SquareVerifier public verifier; 

constructor(address verifierAddress) public {
    verifier = SquareVerifier(verifierAddress);
}

// TODO define a solutions struct that can hold an index & an address
struct Solution{
    uint256 index;
    address ownerAddress;
}

// TODO define an array of the above struct
Solution[] private solutions;

// TODO define a mapping to store unique solutions submitted
mapping(bytes32 => Solution) private uniqueSolutions; 

// TODO Create an event to emit when a solution is added
event SolutionAdded(uint256 index, address ownerAddress);

// TODO Create a function to add the solutions to the array and emit the event
function addSolution(uint256 index, address ownerAddress, bytes32 key) private {
    Solution memory solution = Solution({index: index, ownerAddress: ownerAddress});
    solutions.push(solution);
    uniqueSolutions[key] = solution;
    emit SolutionAdded(index, ownerAddress);
}


// TODO Create a function to mint new NFT only after the solution has been verified
function mintToken(address ownerAddress, uint256 index, 
                uint[2] memory proof_a, uint[2][2] memory proof_b, uint[2] memory proof_c,
                uint[2] memory inputs) public { 
    require(verifier.verifyTx(proof_a, proof_b, proof_c, inputs), "solution not correct");

    bytes32 key = keccak256(abi.encodePacked(proof_a, proof_b, proof_c, inputs));
    //  - make sure the solution is unique (has not been used before)
    require(uniqueSolutions[key].ownerAddress == address(0), "solution already used");
    addSolution(index, ownerAddress, key);

    //  - make sure you handle metadata as well as tokenSuplly
    super.mint(ownerAddress, index);
}
  
}