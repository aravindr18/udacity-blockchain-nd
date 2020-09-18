
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(airline) can register an Airline only when existing airline is funded', async() => {
    // check if registered
    assert.equal(await config.flightSuretyData.isAirlineRegistered(config.firstAirline), true);
    // check if funded
    assert.equal(await config.flightSuretyData.isAirlineFunded(config.firstAirline), false);
    // start funding with 9 ether
    await config.flightSuretyData.fund({from: config.firstAirline, value: web3.utils.toWei("9", "ether")});
    // check funding 
    assert.equal(await config.flightSuretyData.isAirlineFunded(config.firstAirline), false);                   
    // fund some more
    let funding = await config.flightSuretyData.fund({from: config.firstAirline, 
      value: web3.utils.toWei("2", "ether")});
    assert.equal(await config.flightSuretyData.isAirlineFunded(config.firstAirline), true);
    truffleAssert.eventEmitted(funding, "AirlineFunded");
  });
 
  it('(multiparty consensus) only existing airlines can register new airlines until 4' +
  ' registered airlines', async() => {
    
    let secondAirline = accounts[2];
    let thirdAirline = accounts[3];
    let fourthAirline = accounts[4];
    let fifthAirline = accounts[5];

    try {
      await config.flightSuretyApp.registerAirline(secondAirline, {from: config.firstAirline});  
      await config.flightSuretyApp.registerAirline(thirdAirline, {from: config.firstAirline});
      await config.flightSuretyApp.registerAirline(fourthAirline, {from: config.firstAirline});
    }
  catch(e) {}
  
  assert.equal(await config.flightSuretyData.isAirlineRegistered.call(secondAirline), true, 
  "second airline not registered");
  assert.equal(await config.flightSuretyData.isAirlineRegistered.call(thirdAirline), true,
  "third airline not reigstered");
  assert.equal(await config.flightSuretyData.isAirlineRegistered.call(fourthAirline), true,
  "fourth airline not registered");
  
  // fund airline 2
  await config.flightSuretyData.fund({from: secondAirline, value:web3.utils.toWei("10", "ether")});
  fundedAirlineCount = await config.flightSuretyData.getNumberOfFundedAirlines();

  // fund airline 3 
  await config.flightSuretyData.fund({from: thirdAirline, value:web3.utils.toWei("10", "ether")});
  fundedAirlineCount = await config.flightSuretyData.getNumberOfFundedAirlines();
  assert.equal(new BigNumber(fundedAirlineCount).toString(), '3');

  // registering the fifth airline requires 2 already funded airlines to vote
  await config.flightSuretyApp.registerAirline(fifthAirline, {from: secondAirline});
  assert.equal(await config.flightSuretyData.isAirlineRegistered.call(fifthAirline), false, 
  "fifth airline registered without consensus, something wrong!");

  await config.flightSuretyApp.registerAirline(fifthAirline, {from: thirdAirline});
  assert.equal(await config.flightSuretyData.isAirlineRegistered.call(fifthAirline), true, 
  "fifth airline should've been registered with consensus, something wrong!");
   });
  
   // Buy Insurance Test
  it('(buy) passenger insurance should update the insurance info in data contract', async() => {
    
    let passengerAddress = accounts[3];
    
    let purchase = await config.flightSuretyApp.buy(config.firstAirline, "ABCDE", 123455, 
              {from: passengerAddress, value:web3.utils.toWei("0.9", "ether")});
    truffleAssert.eventEmitted(purchase, "InsurancePurchased");    
  });
  
  // Buy insurance with premium > MAX CAP and verify that the change is received 
  it('(buy) passenger trying to buy insurance again should result in error', async() => {
    let passengerAddress = accounts[3];

    await truffleAssert.reverts(config.flightSuretyApp.buy(config.firstAirline, "ABCDE", 123455, 
      {from: passengerAddress, value:web3.utils.toWei("0.9", "ether")}), null, "assenger has already insured for this flight");

  });

  it('(buy) verify the getInsurancePremium method ', async() => {
    let premium = await config.flightSuretyApp.getInsurancePremium(config.firstAirline, "ABCDE", 123455,
                            {from: accounts[3]});
    assert.equal(premium, web3.utils.toWei("0.9", "ether"));
  });

  it('(buy) verify that insurance premium is capped at 1 ether', async() => {
    let purchase = await config.flightSuretyApp.buy(config.firstAirline, "MAA-JFK", 123455, 
              {from: accounts[4], value:web3.utils.toWei("2", "ether")});

    truffleAssert.eventEmitted(purchase, "InsurancePurchased");
    
    let premium = await config.flightSuretyApp.getInsurancePremium(config.firstAirline, "MAA-JFK", 123455,
                            {from: accounts[4]});
    assert.equal(premium, web3.utils.toWei("1", "ether"));
  });
  
  it('(registerFlight) verify that a registeredAirline can call this function', async() => {
    let flightRegistration = await config.flightSuretyApp.registerFlight(config.firstAirline, "MAA-JFK", 123456, {from: config.firstAirline})
    truffleAssert.eventEmitted(flightRegistration, "FlightRegistered");
  });

  it('(registerFlight) will fail when an airline not registered tries to call this function', async() => {
    await truffleAssert.reverts(config.flightSuretyApp.registerFlight(config.firstAirline, "MAA-JFK", 123456, {from: accounts[6]})
                        , null, "caller not funded");
  });
  
  it('(getRegisteredFlightDetails) should return registered flight details', async() => {
    let registeredFlightDetails = await config.flightSuretyApp.isFlightRegistered("MAA-JFK", 123456, {from:config.firstAirline});
    assert.equal(registeredFlightDetails, true);
  });


});
