const path = require("path");
const fs = require('fs');

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

const buildPath = path.resolve(__dirname, 'build/text.sol');

fs.writeFile(buildPath, "", err => {
    if (err) {
        console.error(err);
    }
});

fs.appendFile(buildPath, noDelegateSource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, memberPoolFactorySource, err => {
    if (err) {
        console.error(err);
    }
});

fs.appendFile(buildPath, memberMapSource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, treasurySource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, applicationPoolSource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, projectFactorySource, err => {
    if (err) {
        console.error(err);
    }
});



fs.appendFile(buildPath, projectSource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, projectTypeSource, err => {
    if (err) {
        console.error(err);
    }
});





fs.appendFile(buildPath, proposalFactorySource, err => {
    if (err) {
        console.error(err);
    }
});


fs.appendFile(buildPath, proposalSource, err => {
    if (err) {
        console.error(err);
    }
});

fs.appendFile(buildPath, memberPoolSource, err => {
    if (err) {
        console.error(err);
    }
});






