import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const NUMBER_OF_ORACLES = 20;
let oracles = [];
let indexes = []

// Register oracles

async function registerOracles() {
  let accounts = await web3.eth.getAccounts();
  let registrationFee = await flightSuretyApp.methods.REGISTRATION_FEE().call()
  let statusCodeArray = [0, 10, 20, 30, 40, 50]
  
  for(var i = 0; i < NUMBER_OF_ORACLES; i++){
    let account = accounts[i];
    await flightSuretyApp.methods.registerOracle().send({from: account, value: registrationFee, gas: 100000000});

    let indexes = await flightSuretyApp.methods.getMyIndexes().call({from: account});
    
    var statusCode = statusCodeArray[Math.floor(Math.random() * statusCodeArray.length)];
    
    oracles.push({account, indexes, statusCode});
  }

  console.log(oracles);
}

async function submitOracleResponse(index, airline, flight, timestamp){
  let chosenOracles = [];
  console.log(`${index}, ${airline}  ${flight}   ${timestamp}`)
  oracles.forEach(x => {
    x.indexes.forEach(i => {
      if(i == index){
        chosenOracles.push(x);
      }
    })
  })

  console.log(chosenOracles)
  chosenOracles.forEach(oracle => {
    flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, oracle.statusCode)
        .send({from: oracle.account, gas: 300000}).then(() => {
          console.log(`statusCode: ${oracle.statusCode}`);
        }).catch(error => console.log(error));
  })
}

async function eventTrigger(){
  flightSuretyApp.events.OracleRequest({
    fromBlock: 'latest'
  }, async function (error, event) {
    if(error) console.log(error);
    else {
    let index = event.returnValues[0];
    let airline = event.returnValues[1];
    let flight = event.returnValues[2];
    let timestamp = event.returnValues[3];
      await submitOracleResponse(index, airline, flight, timestamp);
    }

  })
}
registerOracles();
eventTrigger();


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!!'
    })
})

export default app;