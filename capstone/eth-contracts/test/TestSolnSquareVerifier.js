var SquareVerifier = artifacts.require('SquareVerifier');
var SolnSquareVerifier = artifacts.require('SolnSquareVerifier');
var proof = require("../../zokrates/code/output/proof");
const truffleAssert = require('truffle-assertions');

contract("test SolnSquareVerifier contract", accounts => {
    const firstAccount = accounts[0];
    const secondAccount = accounts[1];
    const thirdAccount = accounts[2];

    describe('SolnSquareVerifier', async function() {
        beforeEach(async function() {
            try{
                let verifier = await SquareVerifier.new({from: firstAccount});
                this.contract = await SolnSquareVerifier.new(verifier.address, {from: firstAccount});
            } catch(e) {
                console.log(e);
            }
        });
        // Test if a new solution can be added for contract - SolnSquareVerifier
        it("should test if new solution can be added to contract", async function(){
            let result = await this.contract.mintToken(firstAccount, 100, proof.proof.a, proof.proof.b, 
                        proof.proof.c, proof.inputs, {from: firstAccount});
            truffleAssert.eventEmitted(result, "SolutionAdded");

        })
        // Test if an ERC721 token can be minted for contract - SolnSquareVerifier      
        it("should test if an ERC721 token can be minted for contract", async function() {
            
            let mint = await this.contract.mintToken(firstAccount, 100, proof.proof.a, 
                        proof.proof.b, proof.proof.c, proof.inputs, {from: firstAccount});
            
            assert.equal(await this.contract.ownerOf(100), firstAccount, "failed during minting of token");
            assert.equal(await this.contract.balanceOf(firstAccount), 1, "failed during minting of token");
        })

    });
})





