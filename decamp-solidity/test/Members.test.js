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
let proposal;
let memberMap;
let projectFactory;
let project;

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

    await proposalFactory.methods
        .createProposal("Info about prooposal")
        .send({ from: accounts[1], gas: '3404199' });

    [proposalAddress] = await proposalFactory.methods.getProposals().call();

    proposal = await new web3.eth.Contract(
        proposalCompiled.abi,
        proposalAddress
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

    it('has an instance of proposal', () => {
        assert.ok(proposal.options.address);
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

    it('can select that applicant', async () => {
        //await memberPool.methods.admitApplicant(accounts[3]).send({ from: accounts[1], gas: '3404199' });
    });


});

describe("Proposal Workflow", () => {

    before(async () => {
        await baseFullSetup();
    });

});


describe("Applicant to Member workflow", () => {

    before(async () => {
        await baseFullSetup();
    });


});


// describe("proposal Factory Contract", () => {

//     before(async () => {
//         await baseSetup();
//     });

//     it('can get deployed proposal', async () => {
//         const proposalsR = await factory.methods.getDeployedproposals().call();
//         assert.equal(proposalsR.length, 1);
//     });

//     it('can get active proposal', async () => {
//         const proposalsR = await factory.methods.getActiveproposals().call();
//         assert.equal(proposalsR.length, 1);
//     });

//     it('can remove active proposal', async () => {
//         await factory.methods.removeActiveproposal(0).send({ from: accounts[0], gas: '1000000' });
//         const proposalsR = await factory.methods.getActiveproposals().call();
//         assert.equal(proposalsR.length, 0);
//     });

// });


// describe("member Pool Contract", () => {

//     before(async () => {
//         await baseSetup();
//         await memberPool.methods.createmember().send({ from: accounts[3], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[4], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[5], gas: '3000000' });
//     });

//     it('has members in pool', async () => {
//         const membersR = await memberPool.methods.getmembers().call();
//         assert.equal(membersR.length, 3);
//     });

//     it('can reward member', async () => {
//         var pointsAtStart = await memberPool.methods.getmemberPoints(accounts[3]).call();
//         await memberPool.methods.rewardmember(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//         var pointsAfter = await memberPool.methods.getmemberPoints(accounts[3]).call();
//         assert.equal(pointsAtStart < pointsAfter, true);
//     });

//     it('can punish member', async () => {
//         var pointsAtStart = await memberPool.methods.getmemberPoints(accounts[3]).call();
//         await memberPool.methods.punishmember(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//         var pointsAfter = await memberPool.methods.getmemberPoints(accounts[3]).call();
//         assert.equal(pointsAtStart > pointsAfter, true);
//     });

//     it('cannot punish member twice', async () => {
//         try {
//             await memberPool.methods.punishmember(accounts[4]).send({ from: accounts[4], gas: '3000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }

//     });

//     it('cannot reward member twice', async () => {
//         try {
//             await memberPool.methods.rewardmember(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//     });


// });

// describe("proposal Contract", () => {


//     before(async () => {

//         await baseSetup();

//         await memberPool.methods.createmember().send({ from: accounts[3], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[4], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[5], gas: '3000000' });

//         await proposal.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '20000' });
//         await proposal.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '10000' });
//         await proposal.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '1000' });
//         await proposal.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '40000' });
//         await proposal.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '50000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[4], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });

//     });

//     it('can contribute to proposal', async () => {
//         const balance = await web3.eth.getBalance(proposalAddress);
//         assert.equal(balance, '121000');
//     })

//     it('did set leader as eligible', async () => {
//         var isEli = await proposal.methods.leaderIsEligible().call();
//         assert.equal(isEli, true);
//     });

//     it('did contribute', async () => {
//         var response = await proposal.methods.isContributor(accounts[4]).call();
//         assert.equal(response, true);
//     })

//     it('allows members to apply', async () => {
//         const members = await proposal.methods.getProposals().call();
//         assert.equal(members.length, 3);
//     });

//     it('can vote for member', async () => {
//         const votes = await proposal.methods.getVotesFormember(accounts[4]).call();
//         assert.equal(votes, 3);
//     });

//     it('does not let user vote twice for member', async () => {
//         try {
//             await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//     });

//     it('selects new member', async () => {

//         await proposal.methods.assignproposal().send({ from: accounts[5], gas: '1000000' });
//         const member = await proposal.methods.member().call();
//         assert.equal(member, accounts[4]);
//         const state = await proposal.methods.proposalState().call();
//         assert.equal(state, 1);


//     });

//     it('fails when none members tries to withdrawl funds', async () => {
//         try {
//             await proposal.methods.withdrawalFunds().send({ from: accounts[1], gas: '1000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//         const state = await proposal.methods.proposalState().call();
//         assert.equal(state, 1);
//     });

//     it('allows members to withdrawl funds', async () => {
//         const firstBalance = await web3.eth.getBalance(accounts[4]);
//         var member = await proposal.methods.member().call();
//         await proposal.methods.withdrawalFunds().send({ from: accounts[4], gas: '1000000' });
//         const secondBalance = await web3.eth.getBalance(accounts[4]);
//         assert.notEqual(firstBalance, secondBalance);
//         const state = await proposal.methods.proposalState().call();
//     });

//     it('can can halt proposal', async () => {
//         await proposal.methods.haltproposal().send({ from: accounts[4], gas: '1000000' });
//         const state = await proposal.methods.proposalState().call();
//         assert.equal(state, 3);
//     });


// });



// describe("proposal Contract More", () => {


//     before(async () => {
//         await baseSetup();

//         await memberPool.methods.createmember().send({ from: accounts[3], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[4], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[5], gas: '3000000' });

//         await proposal.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '2000' });
//         await logBalance();
//         await proposal.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '1000' });
//         await logBalance();
//         await proposal.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '100' });
//         await logBalance();
//         await proposal.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '400' });
//         await logBalance();
//         await proposal.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '50000' });
//         await logBalance();

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });
//     });



//     it('user can get refund', async () => {
//         await logBalance();
//         await proposal.methods.refund().send({ from: accounts[0], gas: '1000000' });
//         await logBalance();
//     });

//     it('cannot get refund twice', async () => {
//         // assert.fail();
//     });


//     it('can get member description', async () => {
//         // assert.fail();
//     });


// });


// describe("proposal Contract More", () => {


//     before(async () => {
//         await baseSetup();

//         await memberPool.methods.createmember().send({ from: accounts[3], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[4], gas: '3000000' });
//         await memberPool.methods.createmember().send({ from: accounts[5], gas: '3000000' });

//         await proposal.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '2000' });
//         await proposal.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '1000' });
//         await proposal.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '100' });
//         await proposal.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '400' });
//         await proposal.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '500' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await proposal.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await proposal.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });


//     });






// });