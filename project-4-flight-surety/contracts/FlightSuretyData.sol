pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping(address => bool) private authorizedContracts;
    struct Airline{
        bool isRegistered;
        bool isFunded;
        uint amount;
    }
    mapping(address => Airline) airlines;
    uint256 private numberOfRegisteredAirlines = 0;
    uint256 private numberOfFundedAirlines = 0;
    uint private constant MINIMUM_FUNDING_AMOUNT = 10 ether;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AirlineRegistered(address _airline);
    event AirlineFunded(address _airline);

    mapping(address => mapping(bytes32 => uint256)) private insurance_info;
    mapping(address => uint256) private passenger_credit_accounts;
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address _airline) public
    {
        contractOwner = msg.sender;
        airlines[_airline] = Airline({isRegistered: true,
                                      isFunded: false,
                                      amount: 0});
        numberOfRegisteredAirlines = numberOfRegisteredAirlines.add(1);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireOnlyAuthorizedCaller()
    {
        require(authorizedContracts[msg.sender], "not authorized caller");
        _;
    }

    modifier requireAirlineToBeRegistered()
    {
        require(airlines[msg.sender].isRegistered, "airline not registered");
        _;
    }
    
    modifier requireAirlineToNotBeFunded()
    {
        require(!airlines[msg.sender].isFunded, "airline is already funded");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) external requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function isAirlineRegistered(address _airline) public view
            requireIsOperational returns (bool)
    {
        return airlines[_airline].isRegistered;
    }
    
    function isAirlineFunded(address _airline) public view
            requireIsOperational returns (bool)
    {
        return airlines[_airline].isFunded;
    }

    // function getAllFundedAirlines() external view 
    //         requireIsOperational requireContractOwner returns (mapping(address => Airline))
    // {
        
    // }
    
    function getNumberOfRegisteredAirlines() external view
            requireIsOperational returns (uint256)
    {
        return numberOfRegisteredAirlines;
    }

    function getNumberOfFundedAirlines() public view
            requireIsOperational returns (uint256)
    {
        return numberOfFundedAirlines;
    }

    function authorizeCaller(address contractAddress) public requireContractOwner
    {
        authorizedContracts[contractAddress] = true;
    }

    function revokeAuthorization(address contractAddress) public requireContractOwner
    {
        delete authorizedContracts[contractAddress];
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _airline) external requireIsOperational
             requireOnlyAuthorizedCaller
    {
        airlines[_airline] = Airline({isRegistered : true, isFunded : false, amount : 0});
        numberOfRegisteredAirlines = numberOfRegisteredAirlines.add(1);
        emit AirlineRegistered(_airline);
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy(address passenger, bytes32 flightKey) external payable
        requireIsOperational requireOnlyAuthorizedCaller
    {
        // store the passenger insurance details passenger => flightKey => insurance 
        insurance_info[passenger][flightKey] = insurance_info[passenger][flightKey].add(msg.value);
    }

    function getInsurancePremium(address passenger, bytes32 flightKey) public view 
        requireIsOperational requireOnlyAuthorizedCaller
        returns (uint256)
    {
        return insurance_info[passenger][flightKey];
    }
    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(address passenger, address airline, string calldata flight, 
                            uint256 timestamp, uint256 amount) 
        external requireIsOperational requireOnlyAuthorizedCaller
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        delete insurance_info[passenger][flightKey];
        passenger_credit_accounts[passenger] = passenger_credit_accounts[passenger].add(amount);
    }
    
    function getPassengerBalance(address passenger) external view 
            requireIsOperational requireOnlyAuthorizedCaller returns (uint256)
    {
        return passenger_credit_accounts[passenger];
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(address payable passenger) external requireIsOperational requireOnlyAuthorizedCaller
    {   
        uint256 amount = passenger_credit_accounts[passenger];
        require(amount > 0, "no money available for the passenger to withdraw");
        passenger_credit_accounts[passenger] = 0;
        passenger.transfer(amount);
    }
   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund() public payable requireIsOperational 
            requireAirlineToBeRegistered
            requireAirlineToNotBeFunded
    {
        uint initialAmount = airlines[msg.sender].amount;
        airlines[msg.sender].amount = initialAmount.add(msg.value); // add payable value to amount
        if(airlines[msg.sender].amount >= MINIMUM_FUNDING_AMOUNT){
            airlines[msg.sender].isFunded = true;
            numberOfFundedAirlines = numberOfFundedAirlines.add(1);
            emit AirlineFunded(msg.sender);
        }
    }

    function getFlightKey(address airline, string memory flight,uint256 timestamp) 
            pure internal returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable
    {
        fund();
    }

    receive() external payable 
    {
        fund();
    }
    

}

