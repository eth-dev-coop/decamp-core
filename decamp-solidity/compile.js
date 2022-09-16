const path = require("path");
const fs = require('fs-extra');
const solc = require("solc");
const { Console } = require("console");

const memberPoolFactoryPath = path.resolve(__dirname, "contracts/members", "MemberPoolFactory.sol");
const memberPoolFactorySource = fs.readFileSync(memberPoolFactoryPath, "utf8");

const memberMapPath = path.resolve(__dirname, "contracts/members", "MemberMap.sol");
const memberMapSource = fs.readFileSync(memberMapPath, "utf8");

const applicationPoolPath = path.resolve(__dirname, "contracts/members", "ApplicantPool.sol");
const applicationPoolSource = fs.readFileSync(applicationPoolPath, "utf8");

const memberPoolPath = path.resolve(__dirname, "contracts/members", "MemberPool.sol");
const memberPoolSource = fs.readFileSync(memberPoolPath, "utf8");

const proposalFactoryPath = path.resolve(__dirname, "contracts/projects", "ProposalFactory.sol");
const proposalFactorySource = fs.readFileSync(proposalFactoryPath, "utf8");

const projectTypePath = path.resolve(__dirname, "contracts/projects", "ProjectType.sol");
const projectTypeSource = fs.readFileSync(projectTypePath, "utf8");

const projectFactoryPath = path.resolve(__dirname, "contracts/projects", "ProjectFactory.sol");
const projectFactorySource = fs.readFileSync(projectFactoryPath, "utf8");

const projectPath = path.resolve(__dirname, "contracts/projects", "Project.sol");
const projectSource = fs.readFileSync(projectPath, "utf8");

const proposalPath = path.resolve(__dirname, "contracts/projects", "Proposal.sol");
const proposalSource = fs.readFileSync(proposalPath, "utf8");

const noDelegate = path.resolve(__dirname, "contracts/lib", "NoDelegateCall.sol");
const noDelegateSource = fs.readFileSync(noDelegate, "utf8");

const treasuryPath = path.resolve(__dirname, "contracts", "Treasury.sol");
const treasurySource = fs.readFileSync(treasuryPath, "utf8");


var input = {
    language: 'Solidity',
    sources: {
        'MemberPoolFactory.sol': {
            content: memberPoolFactorySource
        },
        'MemberMap.sol': {
            content: memberMapSource
        },
        'ApplicantPool.sol': {
            content: applicationPoolSource
        },
        'MemberPool.sol': {
            content: memberPoolSource
        },
        'ProposalFactory.sol': {
            content: proposalFactorySource
        },
        'ProjectType.sol': {
            content: projectTypeSource
        },
        'ProjectFactory.sol': {
            content: projectFactorySource
        },
        'Project.sol': {
            content: projectSource
        },
        'Proposal.sol': {
            content: proposalSource
        },
        'Treasury.sol': {
            content: treasurySource
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};


const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);


function findImports(path) {
    if (path === "Treasury.sol") return { contents: `${treasurySource}` };
    if (path === "lib/NoDelegateCall.sol") return { contents: `${noDelegateSource}` };
    if (path === "members/MemberPoolFactory.sol") return { contents: `${memberPoolFactorySource}` };
    if (path === "members/MemberMap.sol") return { contents: `${memberMapSource}` };
    if (path === "members/ApplicantPool.sol") return { contents: `${applicationPoolSource}` };
    if (path === "members/MemberPool.sol") return { contents: `${memberPoolSource}` };
    if (path === "projects/ProposalFactory.sol") return { contents: `${proposalFactorySource}` };
    if (path === "projects/ProjectType.sol") return { contents: `${projectTypeSource}` };
    if (path === "projects/ProjectFactory.sol") return { contents: `${projectFactorySource}` };
    if (path === "projects/Project.sol") return { contents: `${projectSource}` };
    if (path === "projects/Proposal.sol") return { contents: `${proposalSource}` };
    else return { error: "File not found" };
}

let output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));


if (output.errors) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++ERRORS++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    for (var i = 0; i < output.errors.length; i++) {
        console.log(output.errors[i].formattedMessage);
    }
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++ERRORS++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    return;
}

fs.ensureDirSync(buildPath);

for (let contract in output.contracts["MemberPoolFactory.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["MemberPoolFactory.sol"][contract]
    );
}

for (let contract in output.contracts["MemberMap.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["MemberMap.sol"][contract]
    );
}


for (let contract in output.contracts["Treasury.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["Treasury.sol"][contract]
    );
}



for (let contract in output.contracts["ApplicantPool.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["ApplicantPool.sol"][contract]
    );
}


for (let contract in output.contracts["MemberPool.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["MemberPool.sol"][contract]
    );
}


for (let contract in output.contracts["ProposalFactory.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["ProposalFactory.sol"][contract]
    );
}


for (let contract in output.contracts["ProjectType.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["ProjectType.sol"][contract]
    );
}


for (let contract in output.contracts["ProjectFactory.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["ProjectFactory.sol"][contract]
    );
}


for (let contract in output.contracts["Project.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["Project.sol"][contract]
    );
}


for (let contract in output.contracts["Proposal.sol"]) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output.contracts["Proposal.sol"][contract]
    );
}


console.log("Build compile complete!");