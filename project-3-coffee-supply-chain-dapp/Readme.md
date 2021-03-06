## Coffee Supply Chain Using Ethereum and Solidity 
#### UML 
##### Activity 
![Activity](images/Activity.png)
##### Sequence
![Sequence](images/Sequence.png)
##### State
![State](images/State.png)
##### Class
![Class](images/Class.png)

#### Libraries
- truffle: `v5.1.31`
- node: `v8.9.4`
- ganache-cli: `^6.10.0-beta.2`
- truffle-hdwallet-provider: `^1.0.17`
- web3-eth: `^1.2.9`
- web3: `1.2.1`
- truffle-assertions: `^0.9.2`
- solidity-version: `0.6.2`

#### Contract Details 
- contract address: `0x0BFc5D73D7Cf950d2d928568Ce95413485783b8C`
- transaction hash: `0xa4795ffae4406bc45e1b4ff2a001aac40d9fb163f1a18dd5a8f5789e028efc11` 
- Etherscan: https://rinkeby.etherscan.io/address/0x0BFc5D73D7Cf950d2d928568Ce95413485783b8C


#### Running the project 
1. install npm packages `npm install`
2. run `npm run dev` which will start a local webserver at `localhost:8080`  
3. If you would like to run the blockchain locally run `truffle migrate` and configure metamask client to connect to the local blockchain