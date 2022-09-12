const assert = require('assert');
const ganache = require('ganache-cli');
const { interfaces } = require('mocha');
const Web3 = new require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledInterview = require('../build/Interview.json');
const compiledInterviewFactory = require('../build/InterviewFactory.json');
const compiledMemberPool = require('../build/MemberPool.json');
const compiledProject = require('../build/Project.json');
const compiledProjectFactory = require('../build/ProjectFactory.json');

let accounts;
let interviewFactory;
let interviewContract;

describe("Campaign Factory Contract", () => {

    before(async () => {
        accounts = await web3.eth.getAccounts();

        interviewFactory = await new web3.eth.Contract(compiledInterviewFactory.abi)
            .deploy({ data: compiledInterviewFactory.evm.bytecode.object })
            .send({ from: accounts[0], gas: '4000000' });



    });


    it('has accounts', async () => {
        assert.equal(accounts.length > 0, true);
    });

    it('coop did deploy', async () => {
        assert.ok(interviewFactory.options.address);
    });

    it('can create and get interview', async () => {
        await interviewFactory.methods.createInterview("I really want this job.")
            .send({ from: accounts[0], gas: '4000000' });
        var interviewId = await interviewFactory.methods.getInterview(accounts[0])
            .call();

        interviewContract = await new web3.eth.Contract(
            compiledInterview.abi,
            interviewId
        );

        assert.ok(interviewContract);
    });


});