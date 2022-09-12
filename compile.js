const path = require("path");
const fs = require('fs-extra');
const solc = require("solc");
const { Console } = require("console");

const campPath = path.resolve(__dirname, "contracts", "Coop.sol");
const source = fs.readFileSync(campPath, "utf8");

var input = {
    language: 'Solidity',
    sources: {
        'Coop.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 


const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

var outputString = solc.compile(JSON.stringify(input));

var output = JSON.parse(outputString);

fs.ensureDirSync(buildPath);

for (let contract in output.contracts["Coop.sol"]) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output.contracts["Coop.sol"][contract]
  );
}

console.log("Build compile complete!");