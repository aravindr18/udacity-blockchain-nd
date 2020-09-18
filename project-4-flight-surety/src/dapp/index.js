
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
        // register flights
        let numberOfFlights = contract.flights.length;
        for(let i=0; i < numberOfFlights; i++){
            let timestamp = Math.floor(Date.now() / 1000);
            contract.flights[i].timestamp = timestamp;
            contract.registerFlight(contract.flights[i], (error, result) => {
                display('Flight', 'Register Flight', [{label: 'Flight Insurance Available', error: error, 
                                        value: contract.flights[i].flight}]);
            });
        }
        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = null;
            let flightCode = DOM.elid('flight-number').value;
            let flights = contract.flights;
            for(let i=0; i < numberOfFlights; i++){
                if(flights[i].flight == flightCode){
                    flight = flights[i];
                    break;
                }

            }
            // Write transaction
            flight.landed = true;
            if(flight != null){
                contract.fetchFlightStatus(flight, (error, result) => {
                    display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
                });
                
            }
        })

        DOM.elid("status").addEventListener('click', () => {
            let flight = null;
            let flightCode = DOM.elid('flight-number-status').value;
            let flights = contract.flights;
            for(let i=0; i < numberOfFlights; i++){
                if(flights[i].flight == flightCode){
                    flight = flights[i];
                    break;
                }
            }
            console.log(flight);
            if(flight != null){
                contract.getRegisteredFlightStatusCode(flight, (error, result) => {
                    let status = 'UNKNOWN';
                    if(result == 10){
                        status = 'ON_TIME';
                    }else if(result == 20){
                        status = 'LATE_AIRLINE';
                    }else if(result == 30){
                        status = 'LATE_WEATHER';
                    }else if(result == 40){
                        status = 'LATE_TECHNICAL';
                    }else if(result == 50){
                        status = 'LATE_OTHER';
                    }else if(result == 60){
                        status = 'LANDED_AND_INSURANCE_PROCESSED';
                    }
                    console.log(result);
                    console.log(status);
                    display('Flight', 'Check status', [ { label: 'Flight Status', error: error, value: status} ]);
                });
            }
        })

        DOM.elid('buyInsurance').addEventListener('click', (error, result) => {
            let flight = null;
            let flightCode = DOM.elid('flight-number').value;

            let flights = contract.flights;
            for(let i=0; i < numberOfFlights; i++){
                if(flights[i].flight == flightCode){
                    flight = flights[i];
                    break;
                }
            }
            if(flight.landed){
                display('Passenger', 'Buy Insurance', [ { label: 'Flight ', error: null, value: flight.flight + ' has landed, insurance purchase not possible!' }]);
            } 
            else if (flight != null){
                let insuranceAmount = DOM.elid('insuranceAmount').value;
                contract.buy(flight, insuranceAmount, (error, result) => {
                    display('Passenger', 'Buy Insurance', [ { label: 'Flight ', error: error, value: flight.flight + ' for ' + insuranceAmount + ' wei'} ])
                });
            }
        })

        DOM.elid('balance').addEventListener('click', (error, result) => {
            contract.getBalance((error, result) => {
                display('Passenger', 'Balance', [ { label: 'Current balance: ', error: error, value: result} ]);
            });
        })

        DOM.elid('withdraw').addEventListener('click', (error, result) => {
            contract.withdraw((error, result) => {
                display('Passenger', 'Withdraw', [ { label: 'Withdraw: ', error: error, value: 'Successfully Withdrawn'} ]);
            });
        })
    
    });
    

})();



function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







