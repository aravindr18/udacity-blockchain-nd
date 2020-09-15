var MyRealEstateToken = artifacts.require('MyRealEstateToken');
const truffleAssert = require('truffle-assertions');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];


    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await MyRealEstateToken.new({from: account_one});

            // TODO: mint multiple tokens
            for(let iter = 0; iter < 5; iter++){
                await this.contract.mint(accounts[iter], iter);
            }
        })

        it('should return total supply', async function () { 
            let getTotalSupply = await this.contract.totalSupply({from: account_one});
            assert.equal(getTotalSupply, 5, "total supply should be 10");
        })

        it('should get token balance', async function () { 
            let getBalance = await this.contract.balanceOf(accounts[2]);
            assert.equal(getBalance, 1, "ERC721 token balance should be 1");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            let getTokenURI = await this.contract.tokenURI(1);
            assert.equal(getTokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1", "invalid token uri set");
        })

        it('should transfer token from one owner to another', async function () { 
            await this.contract.transferFrom(accounts[1], accounts[2], 1, {from: accounts[1]})
            assert.equal(await this.contract.ownerOf(1), accounts[2], "Token failed to transfer")  
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await MyRealEstateToken.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            await truffleAssert.reverts(this.contract.mint(account_two, 100, {from: account_two}), null, "sender is not the owner");
        })

        it('should return contract owner', async function () { 
            assert.equal(await this.contract.getOwner.call(), account_one, "incorrect contract owner");
        })

    });
})