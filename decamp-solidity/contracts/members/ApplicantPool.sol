// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MemberMap.sol";

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
    MemberMap map;
    address public memberPoolAddress;
    uint256 public balance;
    uint256 public applicantFeeAmount = 1000000;

    constructor(address memberMap, address _memberPoolAddress) {
        map = MemberMap(memberMap);
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
        memberPoolOnly(msg.sender)
        returns (address[] memory)
    {
        return applicantList;
    }

    function createApplicant(string calldata reason) public payable {
        require(
            !map.isMember(msg.sender, memberPoolAddress),
            "Already active member"
        );
        require(!activeApplicants[msg.sender], "Already active applicant");
        require(applicantPoints[msg.sender] > -3, "account rejected");
        require(msg.value >= applicantFeeAmount);
        balance += msg.value;
        applicantWords[msg.sender] = reason;
        activeApplicants[msg.sender] = true;
        applicantList.push(msg.sender);
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

    function getApplicantWords(address applicant)
        public
        view
        memberOnly(msg.sender)
        returns (string memory)
    {
        return applicantWords[applicant];
    }

    function getApplicantVoteCount(address applicant)
        public
        view
        returns (uint256)
    {
        return applicantVotes[applicant].length;
    }

    function approveApplicant(address applicant)
        public
        memberPoolOnly(msg.sender)
    {
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
