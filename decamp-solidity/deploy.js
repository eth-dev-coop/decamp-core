const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const memberPoolFactoryCompiled = require('../build/MemberPoolFactory.json');
const applicantPoolCompiled = require('../build/ApplicantPool.json');
const memberPoolCompiled = require('../build/MemberPool.json');
const memberMapCompiled = require('../build/MemberMap.json');
const ProposalFactoryCompiled = require('../build/ProposalFactory.json');
const proposalCompiled = require('../build/Proposal.json');
const projectFactoryCompiled = require('../build/ProjectFactory.json');
const projectCompiled = require('../build/Project.json');


const SECRET_WALLET_KEY = "";
const INFURA_API = "";

const provider = new HDWalletProvider(
  SECRET_WALLET_KEY,
  INFURA_API
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();





};
deploy();