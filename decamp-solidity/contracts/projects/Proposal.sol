// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../members/MemberMap.sol";
import "./ProjectFactory.sol";
import "./ProjectType.sol";

contract Proposal {
    event Contributed(address sender);
    event ProposalSubmitted(address sender);
    event UserVoted(address sender);
    event UserRefunded(address sender);
    event ProjectHalted();
    event ProjectFunded();
    event CampaignAssigned();
    enum ProposalState {
        BIDDING,
        FUNDING,
        APPROVED,
        HALTED
    }

    uint256 public balance;
    address immutable creator;
    address immutable memberMap;
    address immutable projectFactoryAddress;
    string public initialDescription;

    ProposalState public proposalState;

    mapping(address => uint256) contributors;

    mapping(address => string) bidDescriptions;
    mapping(address => uint256) bidsAmount;

    uint256 public dateCreated;
    uint32 public voteBufferSeconds = 0;
    uint256 public voteBufferDate;
    uint32 public voteCountThreshold = 3;

    bool public leaderIsEligible = false;
    uint32 numberOfVotes = 0;

    address[] public bidders;
    address public leader;
    address public winningBidder;
    mapping(address => uint256) voteCount;
    mapping(address => bool) didVote;

    constructor(
        address creatorIn,
        string memory description,
        address memMap,
        address projectFactory
    ) {
        creator = creatorIn;
        initialDescription = description;
        proposalState = ProposalState.BIDDING;
        memberMap = memMap;
        dateCreated = block.timestamp;
        voteBufferDate = block.timestamp + voteBufferSeconds;
        projectFactoryAddress = projectFactory;
    }

    function contribute() public payable {
        require(
            proposalState == ProposalState.BIDDING ||
                proposalState == ProposalState.FUNDING
        );
        contributors[msg.sender] += msg.value;
        balance += msg.value;
        emit Contributed(msg.sender);
    }

    function isContributor(address id) public view returns (bool) {
        return (contributors[id] > 0);
    }

    function submitBid(string memory descriptionSet, uint256 amountNeeded)
        public
    {
        require(proposalState == ProposalState.BIDDING);
        bytes memory tempEmptyStringTest = bytes(descriptionSet);
        require(tempEmptyStringTest.length > 0);
        MemberMap map = MemberMap(memberMap);
        require(map.memberIsInAnyPool(msg.sender));
        require(bidsAmount[msg.sender] == 0);
        bidDescriptions[msg.sender] = descriptionSet;
        bidsAmount[msg.sender] = amountNeeded;
        bidders.push(msg.sender);
        emit ProposalSubmitted(msg.sender);
    }

    function getBids() public view returns (address[] memory) {
        return bidders;
    }

    function getBidDescription(address bidder)
        public
        view
        returns (string memory)
    {
        return bidDescriptions[bidder];
    }

    function voteOnBid(address payable id) public {
        require(!didVote[msg.sender]);
        require(proposalState == ProposalState.BIDDING);
        voteCount[id] += 1;
        numberOfVotes++;
        didVote[msg.sender] = true;

        if (voteCount[leader] == 0) {
            leader = id;
        } else if (numberOfVotes < voteCount[leader]) {
            leader = id;
        }

        if (voteCount[id] >= voteCountThreshold) {
            leaderIsEligible = true;
        }
        emit UserVoted(msg.sender);
    }

    function getVotesForBid(address id) public view returns (uint256) {
        return voteCount[id];
    }

    function getAmountForBid(address id) public view returns (uint256) {
        return bidsAmount[id];
    }

    function createProject() public {
        require(msg.sender == leader);
        require(leaderIsEligible);
        require(block.timestamp > voteBufferDate);
        uint256 neededAmount = bidsAmount[leader];
        require(balance > neededAmount);
        winningBidder = leader;
        MemberMap map = MemberMap(memberMap);
        address[] memory membersPools = map.getMemberPools(leader);
        proposalState = ProposalState.APPROVED;
        ProjectFactory projFactory = ProjectFactory(projectFactoryAddress);
        //TODO fix
        projFactory.createProject(
            membersPools[0],
            winningBidder,
            creator,
            ProjectType.FUNDED
        );
        emit CampaignAssigned();
    }

    function withdrawalFunds() public payable {
        require(winningBidder == msg.sender, "address denied");
        (bool success, ) = winningBidder.call{value: balance}("");
        require(success, "Failed to send Ether");
    }

    function haltCampaign() public {
        require(msg.sender == winningBidder || msg.sender == creator);
        proposalState = ProposalState.HALTED;
        emit ProjectHalted();
    }

    function refund() public payable {
        require(proposalState != ProposalState.APPROVED);
        uint256 gweiAmount = contributors[msg.sender];
        require(gweiAmount > 0);
        payable(msg.sender).transfer(gweiAmount);
        contributors[msg.sender] = 0;
        emit UserRefunded(msg.sender);
    }
}
