// migrating the appropriate contracts
var SquareVerifier = artifacts.require("./verifier.sol");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");
module.exports = function(deployer, network, accounts) {
  deployer.then(async() => {
    await deployer.deploy(SquareVerifier);
    await deployer.deploy(SolnSquareVerifier, SquareVerifier.address);
  })
};
