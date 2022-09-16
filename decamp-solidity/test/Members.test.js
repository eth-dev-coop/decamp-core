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
const treasuryCompiled = require('../build/Treasury.json');

let accounts;

let memberPoolFactory;
let memberPool;
let applicantPool;
let proposalFactory;
let proposal;
let memberMap;
let projectFactory;
let project;
let treasury;

async function baseFullSetup() {
    accounts = await web3.eth.getAccounts();

    treasury = await new web3.eth.Contract(treasuryCompiled.abi)
        .deploy({ data: treasuryCompiled.evm.bytecode.object })
        .send({ from: accounts[1], gas: '1000000' })

    memberMap = await new web3.eth.Contract(memberMapCompiled.abi)
        .deploy({ data: memberMapCompiled.evm.bytecode.object })
        .send({ from: accounts[1], gas: '2000000' })

    memberPoolFactory = await new web3.eth.Contract(memberPoolFactoryCompiled.abi)
        .deploy({ data: memberPoolFactoryCompiled.evm.bytecode.object, arguments: [treasury.options.address] })
        .send({ from: accounts[1], gas: '6000000' })

    projectFactory = await new web3.eth.Contract(projectFactoryCompiled.abi)
        .deploy({ data: projectFactoryCompiled.evm.bytecode.object })
        .send({ from: accounts[1], gas: '4000000' })

    proposalFactory = await new web3.eth.Contract(ProposalFactoryCompiled.abi)
        .deploy({ data: ProposalFactoryCompiled.evm.bytecode.object, arguments: [memberMap.options.address, projectFactory.options.address, treasury.options.address] })
        .send({ from: accounts[1], gas: '4000000' })

    await memberPoolFactory.methods.createMemberPool("Pool Name").send({ from: accounts[0], gas: '5404199' });

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
        .send({ from: accounts[0], gas: '3404199' });

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

    it('has an instance of treasury', () => {
        assert.ok(memberMap.options.address);
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
});


describe("Treasury", () => {

    before(async () => {
        await baseFullSetup();
    });

    it('did apply applicant fee', async () => {
        await applicantPool.methods.createApplicant("I am super smart guys.. believe me.")
            .send({ from: accounts[1], gas: '3404199', value: "" });
    });

});

describe("Propoal to Project workflow", () => {

    before(async () => {
        await baseFullSetup();
    });

    it('did set creator ', async () => {

    });

});


describe("Applicant to Member workflow", () => {

    before(async () => {
        await baseFullSetup();
    });

    it('did set creator ', async () => {

    });

});


// describe("Campaign Factory Contract", () => {

//     before(async () => {
//         await baseSetup();
//     });

//     it('can get deployed campaign', async () => {
//         const campaignsR = await factory.methods.getDeployedCampaigns().call();
//         assert.equal(campaignsR.length, 1);
//     });

//     it('can get active campaign', async () => {
//         const campaignsR = await factory.methods.getActiveCampaigns().call();
//         assert.equal(campaignsR.length, 1);
//     });

//     it('can remove active campaign', async () => {
//         await factory.methods.removeActiveCampaign(0).send({ from: accounts[0], gas: '1000000' });
//         const campaignsR = await factory.methods.getActiveCampaigns().call();
//         assert.equal(campaignsR.length, 0);
//     });

// });


// describe("Manager Pool Contract", () => {

//     before(async () => {
//         await baseSetup();
//         await managerPool.methods.createManager().send({ from: accounts[3], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[4], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[5], gas: '3000000' });
//     });

//     it('has managers in pool', async () => {
//         const managersR = await managerPool.methods.getManagers().call();
//         assert.equal(managersR.length, 3);
//     });

//     it('can reward manager', async () => {
//         var pointsAtStart = await managerPool.methods.getManagerPoints(accounts[3]).call();
//         await managerPool.methods.rewardManager(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//         var pointsAfter = await managerPool.methods.getManagerPoints(accounts[3]).call();
//         assert.equal(pointsAtStart < pointsAfter, true);
//     });

//     it('can punish manager', async () => {
//         var pointsAtStart = await managerPool.methods.getManagerPoints(accounts[3]).call();
//         await managerPool.methods.punishManager(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//         var pointsAfter = await managerPool.methods.getManagerPoints(accounts[3]).call();
//         assert.equal(pointsAtStart > pointsAfter, true);
//     });

//     it('cannot punish manager twice', async () => {
//         try {
//             await managerPool.methods.punishManager(accounts[4]).send({ from: accounts[4], gas: '3000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }

//     });

//     it('cannot reward manager twice', async () => {
//         try {
//             await managerPool.methods.rewardManager(accounts[3]).send({ from: accounts[4], gas: '3000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//     });


// });

// describe("Campaign Contract", () => {


//     before(async () => {

//         await baseSetup();

//         await managerPool.methods.createManager().send({ from: accounts[3], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[4], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[5], gas: '3000000' });

//         await campaign.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '20000' });
//         await campaign.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '10000' });
//         await campaign.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '1000' });
//         await campaign.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '40000' });
//         await campaign.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '50000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[4], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });

//     });

//     it('can contribute to campaign', async () => {
//         const balance = await web3.eth.getBalance(campaignAddress);
//         assert.equal(balance, '121000');
//     })

//     it('did set leader as eligible', async () => {
//         var isEli = await campaign.methods.leaderIsEligible().call();
//         assert.equal(isEli, true);
//     });

//     it('did contribute', async () => {
//         var response = await campaign.methods.isContributor(accounts[4]).call();
//         assert.equal(response, true);
//     })

//     it('allows managers to apply', async () => {
//         const managers = await campaign.methods.getProposals().call();
//         assert.equal(managers.length, 3);
//     });

//     it('can vote for manager', async () => {
//         const votes = await campaign.methods.getVotesForManager(accounts[4]).call();
//         assert.equal(votes, 3);
//     });

//     it('does not let user vote twice for manager', async () => {
//         try {
//             await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//     });

//     it('selects new manager', async () => {

//         await campaign.methods.assignCampaign().send({ from: accounts[5], gas: '1000000' });
//         const manager = await campaign.methods.manager().call();
//         assert.equal(manager, accounts[4]);
//         const state = await campaign.methods.campaignState().call();
//         assert.equal(state, 1);


//     });

//     it('fails when none managers tries to withdrawl funds', async () => {
//         try {
//             await campaign.methods.withdrawalFunds().send({ from: accounts[1], gas: '1000000' });
//             assert.fail();
//         } catch (ex) {
//             assert.ok(ex);
//         }
//         const state = await campaign.methods.campaignState().call();
//         assert.equal(state, 1);
//     });

//     it('allows managers to withdrawl funds', async () => {
//         const firstBalance = await web3.eth.getBalance(accounts[4]);
//         var manager = await campaign.methods.manager().call();
//         await campaign.methods.withdrawalFunds().send({ from: accounts[4], gas: '1000000' });
//         const secondBalance = await web3.eth.getBalance(accounts[4]);
//         assert.notEqual(firstBalance, secondBalance);
//         const state = await campaign.methods.campaignState().call();
//     });

//     it('can can halt campaign', async () => {
//         await campaign.methods.haltCampaign().send({ from: accounts[4], gas: '1000000' });
//         const state = await campaign.methods.campaignState().call();
//         assert.equal(state, 3);
//     });


// });



// describe("Campaign Contract More", () => {


//     before(async () => {
//         await baseSetup();

//         await managerPool.methods.createManager().send({ from: accounts[3], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[4], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[5], gas: '3000000' });

//         await campaign.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '2000' });
//         await logBalance();
//         await campaign.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '1000' });
//         await logBalance();
//         await campaign.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '100' });
//         await logBalance();
//         await campaign.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '400' });
//         await logBalance();
//         await campaign.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '50000' });
//         await logBalance();

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });
//     });



//     it('user can get refund', async () => {
//         await logBalance();
//         await campaign.methods.refund().send({ from: accounts[0], gas: '1000000' });
//         await logBalance();
//     });

//     it('cannot get refund twice', async () => {
//         // assert.fail();
//     });


//     it('can get manager description', async () => {
//         // assert.fail();
//     });


// });


// describe("Campaign Contract More", () => {


//     before(async () => {
//         await baseSetup();

//         await managerPool.methods.createManager().send({ from: accounts[3], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[4], gas: '3000000' });
//         await managerPool.methods.createManager().send({ from: accounts[5], gas: '3000000' });

//         await campaign.methods.contribute().send({ from: accounts[0], gas: '1000000', value: '2000' });
//         await campaign.methods.contribute().send({ from: accounts[1], gas: '1000000', value: '1000' });
//         await campaign.methods.contribute().send({ from: accounts[2], gas: '1000000', value: '100' });
//         await campaign.methods.contribute().send({ from: accounts[3], gas: '1000000', value: '400' });
//         await campaign.methods.contribute().send({ from: accounts[4], gas: '1000000', value: '500' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '500')
//             .send({ from: accounts[3], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '400')
//             .send({ from: accounts[4], gas: '1000000' });

//         await campaign.methods.submitProposal("This is my proposal.. It is very good.", '750')
//             .send({ from: accounts[5], gas: '1000000' });


//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[5], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[4]).send({ from: accounts[3], gas: '1000000' });
//         await campaign.methods.voteOnProposal(accounts[3]).send({ from: accounts[1], gas: '1000000' });


//     });






// });