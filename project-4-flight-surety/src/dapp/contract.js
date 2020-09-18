import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from "../../build/contracts/FlightSuretyData.json";
import Config from './config.json';
import Web3 from 'web3';
let config = null;

export default class Contract {
    constructor(network, callback) {
        config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            let self = this; 
            while(this.airlines.length < 5) {
                self.airlines.push(accts[counter++]);
            }

            while(self.passengers.length < 5) {
                self.passengers.push(accts[counter++]);
            }
            self.flightSuretyData.methods.authorizeCaller(config.appAddress).send({from: self.owner});
            self.flightSuretyData.methods.fund().send({from: self.airlines[0],
            value: self.web3.utils.toWei('10', 'ether'),
            gas: 300000});
            
            this.flights[0] = {flight: 'MAA-DBX', address: self.airlines[0], timestamp: null, landed: false};
            this.flights[1] = {flight: 'DBX-JFK', address: this.airlines[0], timestamp: null, landed: false};
            this.flights[2] = {flight: 'JFK-DBX', address: this.airlines[0], timestamp: null, landed: false};
            this.flights[3] = {flight: 'DBX-MAA', address: this.airlines[0], timestamp: null, landed: false};

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    registerFlight(flight, callback){
        let self = this;
        let payload = {
            flight: flight.flight,
            airline: flight.address,
            timestamp: flight.timestamp
        };
        self.flightSuretyApp.methods.registerFlight(payload.airline, payload.flight, payload.timestamp)
                    .send({ from: payload.airline, gas: 3000000}, (error, result) => {
                        callback(error, result);
                    });

    }

    getRegisteredFlightStatusCode(flight, callback){
        let self = this;
        let payload = {
            flight: flight.flight,
            airline: flight.address,
            timestamp: flight.timestamp
        } 
        self.flightSuretyApp.methods.getRegisteredFlightStatusCode(payload.airline, payload.flight, payload.timestamp)
            .call({from: self.owner}, (error, result) => {
                console.log(result, error);
                callback(error, result);
            });
    }

    buy(flight, premium, callback) {
        let self = this;
        let payload = {
            flight: flight.flight,
            airline: flight.address,
            timestamp: flight.timestamp
        } 
        self.flightSuretyApp.methods.buy(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.passengers[0], value: premium, gas: 3000000}, (error, result) => {
                callback(error, payload);
            });
    }

    getBalance(callback) {
        let self = this;
        self.flightSuretyApp.methods.getBalance()
             .call({from: self.passengers[0], gas: 3000000}, (error, result) => {
                callback(error, result);
            });
    }

    withdraw(callback) {
        let self = this;
        self.flightSuretyApp.methods.withdraw()
             .send({from: self.passengers[0], gas: 6700000}, (error, result) => {
                callback(error, result);
            });
    }
    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: flight.address,
            flight: flight.flight,
            timestamp: flight.timestamp
        } 
        
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}