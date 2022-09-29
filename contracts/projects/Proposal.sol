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
                proposalState == ProposalState.FUNDING,
            "Invalid state for contribution"
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
        require(
            proposalState == ProposalState.BIDDING,
            "Must be in bidding state"
        );
        MemberMap map = MemberMap(memberMap);
        require(map.memberIsInAnyPool(msg.sender), "Must be a member");
        require(bidsAmount[msg.sender] == 0, "address has already bid");
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
        require(!didVote[msg.sender], "Already voted");
        require(
            proposalState == ProposalState.BIDDING,
            "Must be in bidding state to vote"
        );
        require(bidsAmount[id] > 0, "address did not give bid amount");
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
        require(msg.sender == leader, "must be leader");
        require(leaderIsEligible, "leader is not eligible");
        require(block.timestamp > voteBufferDate, "must wait longer");
        uint256 neededAmount = bidsAmount[leader];
        require(balance > neededAmount, "Funding amount not met");
        winningBidder = leader;
        MemberMap map = MemberMap(memberMap);
        proposalState = ProposalState.APPROVED;
        ProjectFactory projFactory = ProjectFactory(projectFactoryAddress);
        //TODO fix
        address[] memory membersPools = map.getMemberPools(leader);
        projFactory.createProject(
            membersPools[0],
            winningBidder,
            creator,
            ProjectType.FUNDED,
            address(this)
        );
        emit CampaignAssigned();
    }

    function withdrawalFunds() public payable {
        require(winningBidder == msg.sender, "address denied");
        (bool success, ) = winningBidder.call{value: balance}("");
        require(success, "Failed to send Ether");
    }

    function haltCampaign() public {
        require(
            msg.sender == winningBidder || msg.sender == creator,
            "invalid address to halt"
        );
        proposalState = ProposalState.HALTED;
        emit ProjectHalted();
    }

    function refund() public payable {
        require(
            proposalState != ProposalState.APPROVED,
            "already funded state"
        );
        uint256 gweiAmount = contributors[msg.sender];
        require(gweiAmount > 0, "inalid amount for refund");
        payable(msg.sender).transfer(gweiAmount);
        contributors[msg.sender] = 0;
        emit UserRefunded(msg.sender);
    }
}
