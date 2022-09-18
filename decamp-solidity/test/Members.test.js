const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = new require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const memberPoolFactoryCompiled = require('../build/MemberPoolFactory.json');
const applicantPoolCompiled = require('../build/ApplicantPool.json');
const memberPoolCompiled = require('../build/MemberPool.json');
const memberMapCompiled = require('../build/MemberMap.json');
const ProposalFactoryCompiled = require('../build/ProposalFactory.json');
const proposalCompiled = require('../build/Proposal.json');
const projectFactoryCompiled = require('../build/ProjectFactory.json');
const projectCompiled = require('../build/Project.json');

let accounts;
let memberPoolFactory;
let memberPool;
let applicantPool;
let proposalFactory;
let memberMap;
let proposal;
let projectFactory;

async function baseFullSetup() {
    accounts = await web3.eth.getAccounts();

    memberMap = await new web3.eth.Contract(memberMapCompiled.abi)
        .deploy({ data: memberMapCompiled.evm.bytecode.object })
        .send({ from: accounts[1], gas: '2000000' })

    memberPoolFactory = await new web3.eth.Contract(memberPoolFactoryCompiled.abi)
        .deploy({ data: memberPoolFactoryCompiled.evm.bytecode.object, arguments: [memberMap.options.address] })
        .send({ from: accounts[1], gas: '6000000' })

    projectFactory = await new web3.eth.Contract(projectFactoryCompiled.abi)
        .deploy({ data: projectFactoryCompiled.evm.bytecode.object })
        .send({ from: accounts[1], gas: '4000000' })

    proposalFactory = await new web3.eth.Contract(ProposalFactoryCompiled.abi)
        .deploy({ data: ProposalFactoryCompiled.evm.bytecode.object, arguments: [memberMap.options.address, projectFactory.options.address] })
        .send({ from: accounts[1], gas: '4000000' })

    await memberPoolFactory.methods.createMemberPool("Pool Name").send({ from: accounts[1], gas: '5404199' });

    [memberPoolAddress] = await memberPoolFactory.methods.getMemberPools().call();

    memberPool = await new web3.eth.Contract(
        memberPoolCompiled.abi,
        memberPoolAddress
    );

    var applicantPoolAddress = await memberPool.methods.applicantPoolAddress().call();

    applicantPool = await new web3.eth.Contract(
        applicantPoolCompiled.abi,
        applicantPoolAddress
    );

}

describe("Base Test Setup", () => {

    before(async () => {
        await baseFullSetup();
    });

    it('has test accounts available', () => {
        assert.ok(accounts.length > 0);
    });

    it('has an instance of memberMap', () => {
        assert.ok(memberMap.options.address);
    });

    it('has an instance of memberPoolFactory', () => {
        assert.ok(memberPoolFactory.options.address);
    });

    it('has an instance of memberPool', () => {
        assert.ok(memberPool.options.address);
    });

    it('has an instance of applicant pool', async () => {
        assert.ok(applicantPool.options.address);
    });

    it('has an instance of project factory', () => {
        assert.ok(projectFactory.options.address);
    });

    it('has an instance of proposal factory', () => {
        assert.ok(proposalFactory.options.address);
    });

    it('pool creator is member', async () => {
        var isMember = await memberMap.methods.isMember(accounts[1], memberPool.options.address).call();
        assert.equal(isMember, true);
    });

});


describe("Applicant Workflow", () => {

    before(async () => {
        await baseFullSetup();
    });

    it('did apply applicant fee and create applicant', async () => {
        var memPoolAddFromAppPool = await applicantPool.methods.memberPoolAddress().call();
        assert.equal(memPoolAddFromAppPool, memberPool.options.address);

        await applicantPool.methods.createApplicant("I am super smart guys.. believe me.")
            .send({ from: accounts[3], gas: '3404199', value: "1000000000000000" });

        const balance = await web3.eth.getBalance(applicantPool.options.address);
        assert.equal(balance, '1000000000000000');

        var applicants = await memberPool.methods.getApplicants().call({ from: accounts[1] });
        assert.equal(applicants.length, 1);
    });


    it('can vote on applicant', async () => {
        await applicantPool.methods.voteForApplicant(accounts[3])
            .send({ from: accounts[1], gas: '3404199' });
        var votes = await applicantPool.methods.getApplicantVoteCount(accounts[3]).call({ from: accounts[1] });
        assert.equal(votes, 1);
    });

    it('can admit applicant', async () => {
        await memberPool.methods.admitApplicant(accounts[3]).send({ from: accounts[1], gas: '3404199' });
        var memberCount = await memberPool.methods.getMemberCount().call({ from: accounts[1] });
        assert.equal(memberCount, 2);
        var isAny = await memberMap.methods.memberIsInAnyPool(accounts[3]).call();
        assert.equal(isAny, true);
    });

    it('can submit proposal', async () => {

        await proposalFactory.methods
            .createProposal("Info about prooposal")
            .send({ from: accounts[4], gas: '3404199' });

        await proposalFactory.methods
            .createProposal("Info about prooposal")
            .send({ from: accounts[1], gas: '3404199' });

        [proposalAddress] = await proposalFactory.methods.getProposals().call();

        proposal = await new web3.eth.Contract(
            proposalCompiled.abi,
            proposalAddress
        );

        await proposal.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '20000' });
        await proposal.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '10000' });
        await proposal.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '1000' });
        await proposal.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '40000' });
        await proposal.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '50000' });

        const balance = await web3.eth.getBalance(proposalAddress);
        assert.equal(balance > 100000, true);

        await proposal.methods.submitBid("This is my proposal.. It is very good.", '500')
            .send({ from: accounts[3], gas: '1000000' });

        await proposal.methods.submitBid("This is my proposal.. It is very good.", '750')
            .send({ from: accounts[1], gas: '1000000' });


        await proposal.methods.voteOnBid(accounts[1]).send({ from: accounts[5], gas: '1000000' });
        await proposal.methods.voteOnBid(accounts[1]).send({ from: accounts[4], gas: '1000000' });
        await proposal.methods.voteOnBid(accounts[1]).send({ from: accounts[3], gas: '1000000' });
        await proposal.methods.voteOnBid(accounts[3]).send({ from: accounts[1], gas: '1000000' });

    });

    it('did set leader as eligible', async () => {
        var isEli = await proposal.methods.leaderIsEligible().call();
        assert.equal(isEli, true);
    });

    it('did contribute', async () => {
        var response = await proposal.methods.isContributor(accounts[4]).call();
        assert.equal(response, true);
    })

    it('allows members to apply', async () => {
        const members = await proposal.methods.getBids().call();
        assert.equal(members.length, 2);
    });

    it('can vote for member', async () => {
        const votes = await proposal.methods.getVotesForBid(accounts[1]).call();
        assert.equal(votes, 3);
    });

    it('does not let user vote twice for member', async () => {
        try {
            await proposal.methods.voteOnBid(accounts[1]).send({ from: accounts[5], gas: '1000000' });
            assert.fail();
        } catch (ex) {
            assert.ok(ex);
        }
    });

    it('selects new project leader', async () => {
        await proposal.methods.createProject().send({ from: accounts[1], gas: '4000000' });
        const leader = await proposal.methods.leader().call();
        assert.equal(leader, accounts[1]);
        const state = await proposal.methods.proposalState().call();
        assert.equal(state, 2);
    });


});


