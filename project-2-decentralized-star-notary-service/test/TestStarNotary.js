const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let tokenId = 111;
    let owner = accounts[0];
    let instance = await StarNotary.deployed();
    await instance.createStar('Star-111', tokenId, {from: owner});
    assert.equal(await instance.symbol.call(), 'ETS');
    assert.equal(await instance.name.call(), 'EthStar');


});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let tokenId1 = 10;
    let tokenId2 = 200;
    let owner1 = accounts[0];
    let owner2 = accounts[1];
    let owner3 = accounts[2];
    let instance = await StarNotary.deployed();
    await instance.createStar('Star-10', tokenId1, {from: owner1});
    await instance.createStar('Star-200', tokenId2, {from: owner2});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId1), 'Star-10');
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId2), 'Star-200');
    await instance.exchangeStars(tokenId1, tokenId2, {from: owner1}); 
    assert.equal(await instance.ownerOf(tokenId1), owner2);
    assert.equal(await instance.ownerOf(tokenId2), owner1);

    await instance.exchangeStars(tokenId1, tokenId2, {from: owner2}); 
    assert.equal(await instance.ownerOf(tokenId1), owner1);
    assert.equal(await instance.ownerOf(tokenId2), owner2);
    
    try{
        await instance.exchangeStars(tokenId1, tokenId2, {from: owner3})
    }catch (error){
        assert.include(error.message, "The Sender is not the owner of token specified for exchange!")
    }
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let tokenId1 = 101;
    let fromAddress = accounts[0];
    let toAddress = accounts[1];
    let instance = await StarNotary.deployed();
    await instance.createStar('Star-101', tokenId1, {from: fromAddress});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId1), 'Star-101');
    assert.equal(await instance.ownerOf(tokenId1), fromAddress);
    await instance.transferStar(toAddress, tokenId1, {from: fromAddress});
    assert.equal(await instance.ownerOf(tokenId1), toAddress)
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let tokenId = 9000;
    let owner = accounts[0];
    let instance = await StarNotary.deployed();
    await instance.createStar('Star-9000', tokenId, {from:owner});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Star-9000')

    try{
        let tokenId = 900;
        await instance.tokenIdToStarInfo.call(tokenId)
    }catch (error){
        assert.include(error.message, "Token Id does not exist")
    }

});