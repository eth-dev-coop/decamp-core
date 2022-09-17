// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MemberMap.sol";
import "../Treasury.sol";

contract ApplicantPool {
    event CreateApplicant();
    event ApplicantVote();
    event ApplicantVoteEnd(address applicant);
    event ApplicantCreated(address sender);

    address[] public applicantList;
    mapping(address => address[]) applicantVotes;
    mapping(address => int256) applicantPoints;
    mapping(address => bool) activeApplicants;
    mapping(address => string) applicantWords;
    mapping(address => uint256) voteEndTime;
    MemberMap map;
    address immutable treasuryAddress;
    address public memberPoolAddress;

    constructor(
        address memberMap,
        address _treasuryAddress,
        address _memberPoolAddress
    ) {
        map = MemberMap(memberMap);
        treasuryAddress = _treasuryAddress;
        memberPoolAddress = _memberPoolAddress;
    }

    modifier memberOnly(address sender) {
        require(
            map.isMember(sender, memberPoolAddress),
            "Required to be a memeber"
        );
        _;
    }

    modifier memberPoolOnly(address sender) {
        require(sender == memberPoolAddress, "Access Denied");
        _;
    }

    function getApplicants()
        public
        view
        memberOnly(msg.sender)
        returns (address[] memory)
    {
        return applicantList;
    }

    function createApplicant(string calldata reason) public payable {
        require(
            !map.isMember(msg.sender, memberPoolAddress),
            "Already active member"
        );

        Treasury t = Treasury(treasuryAddress);
        bool didPayFee = t.didPayApplicantFee(msg.sender, memberPoolAddress);

        require(didPayFee == true, "New Applicant Fee Required");
        require(!activeApplicants[msg.sender], "Already active applicant");
        require(applicantPoints[msg.sender] > -3, "account rejected");

        applicantWords[msg.sender] = reason;
        applicantList.push(msg.sender);
        voteEndTime[msg.sender] = block.timestamp + 259200000; //3 days
    }

    function voteForApplicant(address applicant) public memberOnly(msg.sender) {
        require(activeApplicants[applicant], "Not a applicant");
        bool didVote = false;
        for (uint256 i = 0; i < applicantVotes[applicant].length; i++) {
            if (applicantVotes[applicant][i] == msg.sender) {
                didVote = true;
            }
        }
        require(!didVote, "Sender already voted");
        applicantVotes[applicant].push(msg.sender);
        applicantPoints[applicant] += 1;
    }

    function getApplicantVoteEndDate(address applicant)
        public
        view
        returns (uint256)
    {
        return voteEndTime[applicant];
    }

    function getApplicantWords(address applicant)
        public
        view
        memberOnly(msg.sender)
        returns (string memory)
    {
        return applicantWords[applicant];
    }

    function getApplicantVoteCount(address applicant)
        external
        view
        returns (uint256)
    {
        return applicantVotes[applicant].length;
    }

    function approveApplicant(address applicant)
        public
        memberPoolOnly(msg.sender)
    {
        require(msg.sender == memberPoolAddress);
        map.addMember(memberPoolAddress, applicant);
        _burnApplicant(applicant);
        delete applicantVotes[msg.sender];
    }

    function rejectApplicant(address applicant)
        public
        memberPoolOnly(msg.sender)
    {
        require(activeApplicants[applicant], "Invalid applicant address");
        activeApplicants[applicant] = false;
        applicantPoints[msg.sender] -= 1;
        _burnApplicant(applicant);
        delete applicantVotes[msg.sender];
    }

    function _burnApplicant(address applicant) internal {
        uint256 index = 0;
        for (index = 0; index < applicantList.length; index++) {
            if (applicantList[index] == applicant) {
                break;
            }
        }
        applicantList[index] = applicantList[applicantList.length - 1];
        applicantList.pop();
    }
}
