// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract InterviewFactory {
    mapping(address => address) interviews;

    function createInterview(string memory applicantWords) public {
        address newInterview = address(new Interview(applicantWords));
        interviews[msg.sender] = newInterview;
    }

    function getInterview(address id) public view returns (address) {
        return interviews[id];
    }
}

contract Interview {
    enum ApplicantStatus {
        SUBMITTED,
        CALL_ONE,
        CALL_TWO,
        VOTE,
        APPROVED,
        HALTED,
        RESUBMITED
    }

    ApplicantStatus status;
    string[] interviewerNotes;
    string applicantsWords;

    constructor(string memory words) {
        applicantsWords = words;
    }
}

contract MemberPool {
    enum MemberType {
        DEV_THREE,
        DEV_TWO,
        DEV_ONE,
        UX_TWO,
        UX_ONE,
        PM_TWO,
        PM_ONE
    }

    mapping(address => MemberType) members;
    mapping(address => uint256) memberPoints;
}

contract ProjectFactory {
    mapping(address => address) projects;
}

contract Project {
    string name;
    string repoURL;
    address ideaMember;
    address leadDev;
    address project_manger;
    address[] team;
}
