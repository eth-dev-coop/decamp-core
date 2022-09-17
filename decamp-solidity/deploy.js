const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const path = require("path");
const fs = require('fs-extra');

const memberPoolFactoryCompiled = require('./build/MemberPoolFactory.json');
const applicantPoolCompiled = require('./build/ApplicantPool.json');
const memberPoolCompiled = require('./build/MemberPool.json');
const memberMapCompiled = require('./build/MemberMap.json');
const ProposalFactoryCompiled = require('./build/ProposalFactory.json');
const proposalCompiled = require('./build/Proposal.json');
const projectFactoryCompiled = require('./build/ProjectFactory.json');
const projectCompiled = require('./build/Project.json');
const treasuryCompiled = require('./build/Treasury.json');

let memberPoolFactory;
let proposalFactory;
let memberMap;
let projectFactory;
let treasury;

const SECRET_WALLET_KEY = "";
const INFURA_API = "";

const provider = new HDWalletProvider(
  SECRET_WALLET_KEY,
  INFURA_API
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  treasury = await new web3.eth.Contract(treasuryCompiled.abi)
    .deploy({ data: treasuryCompiled.evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000' })

  memberMap = await new web3.eth.Contract(memberMapCompiled.abi)
    .deploy({ data: memberMapCompiled.evm.bytecode.object })
    .send({ from: accounts[0], gas: '2000000' })

  memberPoolFactory = await new web3.eth.Contract(memberPoolFactoryCompiled.abi)
    .deploy({ data: memberPoolFactoryCompiled.evm.bytecode.object, arguments: [treasury.options.address, memberMap.options.address]] })
    .send({ from: accounts[0], gas: '6000000' })

  projectFactory = await new web3.eth.Contract(projectFactoryCompiled.abi)
    .deploy({ data: projectFactoryCompiled.evm.bytecode.object })
    .send({ from: accounts[0], gas: '4000000' })

  proposalFactory = await new web3.eth.Contract(ProposalFactoryCompiled.abi)
    .deploy({ data: ProposalFactoryCompiled.evm.bytecode.object, arguments: [memberMap.options.address, projectFactory.options.address, treasury.options.address] })
    .send({ from: accounts[0], gas: '4000000' })

  var newWebsiteABI = {
    treasuryAddress: treasury.options.address,
    memberMapAddress: memberMap.options.address,
    memberPoolFactoryAddress: memberPoolFactory.options.address,
    projectFactoryAddress: projectFactory.options.address,
    proposalFactoryAddress: proposalFactory.options.address,
    memberPoolFactoryABI: memberPoolFactoryCompiled.abi,
    applicantPoolABI: applicantPoolCompiled.abi,
    memberPoolABI: memberPoolCompiled.abi,
    memberMapABI: memberMapCompiled.abi,
    ProposalFactoryABI: ProposalFactoryCompiled.abi,
    proposalABI: proposalCompiled.abi,
    projectFactoryABI: projectFactoryCompiled.abi,
    projectABI: projectCompiled.abi,
    treasuryABI: treasuryCompiled.abi
  };

  const buildPath = path.resolve(__dirname, 'build');
  fs.outputJsonSync(
    path.resolve(buildPath, 'abi.json'),
    newWebsiteABI
  );

};
deploy();


