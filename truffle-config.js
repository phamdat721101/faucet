var HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC = '6ee44874d355c054c138a417c5a725cccf7353460892125e028e60ebc8c77129'
module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
      host: "202.143.111.229",     // Localhost (default: none)
      port: 32003,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    fxce: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "http://202.143.111.229:32003")
      },
      network_id: 1306,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  },
  
  compilers: {
    solc: {
      version: "0.8.10",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
};
