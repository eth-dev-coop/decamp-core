// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ApplicantPool.sol";

contract MemberPool {
    event MemberReportUpdate(address member);
    event MemberCreated(address sender);
    event MemberPunished(address sender);
    event MemberRewarded(address sender);
    event VoteAgainstMemberStart(address sender);
    event VoteAgainstMemberEnd(address sender);

    string public name;
    string public shortSummary;
    string public longSummary;
    address[] public members;
    mapping(address => bool) public memberActive;
    address[] public projects;
    mapping(address => address) public userToMemberUp;
    mapping(address => int256) public memberPoints;
    address public applicantPoolAddress;
    address public creator;
    address public memberMapAddress;

    constructor(
        address _creator,
        string memory _name,
        address memMap
    ) {
        creator = _creator;
        name = _name;
        applicantPoolAddress = address(
            new ApplicantPool(memMap, address(this))
        );
        memberActive[creator] = true;
        members.push(creator);
        memberMapAddress = memMap;
    }

    modifier memberOnly(address sender) {
        require(memberActive[sender], "Required to be a memeber");
        _;
    }

    function getMembers()
        public
        view
        memberOnly(msg.sender)
        returns (address[] memory)
    {}

    function getMemberRep(address member) public view returns (int32) {}

    function isMember(address id) public view returns (bool) {
        return memberActive[id];
    }

    function increaseMemberRep(address member) public {
        address caller = userToMemberUp[msg.sender];
        require(member != caller, "Already voted");
        memberPoints[member] += 1;
        userToMemberUp[msg.sender] = member;
        emit MemberRewarded(msg.sender);
    }

    function reportMember(address member, string calldata report)
        public
        view
        returns (uint32)
    {}

    function getMemberReports(address member)
        public
        view
        returns (string[] memory)
    {}

    function dismissMemberReport(address member)
        public
        memberOnly(msg.sender)
    {}

    function highlightReport(address member, string calldata comment)
        public
        memberOnly(msg.sender)
    {}

    function admitApplicant(address applicant) public memberOnly(msg.sender) {
        ApplicantPool pool = ApplicantPool(applicantPoolAddress);
        uint256 voteCount = pool.getApplicantVoteCount(applicant);
        require((voteCount >= 1), "Invalid number of votes or proceed.");
        MemberMap map = MemberMap(memberMapAddress);
        map.addMember(applicant, memberMapAddress);
        pool.approveApplicant(applicant);
        members.push(applicant);
        memberActive[applicant] = true;
    }

    function getMemberCount() public view returns (uint256) {
        return members.length;
    }

    function getApplicants()
        public
        view
        memberOnly(msg.sender)
        returns (address[] memory)
    {
        ApplicantPool pool = ApplicantPool(applicantPoolAddress);
        return pool.getApplicants();
    }
}
