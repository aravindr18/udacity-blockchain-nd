var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      gasPrice: 20000000000,
      gas:300000000,
      accounts: 30
    },
    develop: {
      accounts: 30,
      defaultEtherBalance: 3000
    }
  },
  compilers: {
    solc: {
      version: "0.6.2"
    }
  }
};