// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ProjectType.sol";

contract Project {
    address immutable originalPoster;
    address immutable leaderAddress;
    address immutable proposalAddress;
    ProjectType public projectType;
    bool public isPrivate;

    constructor(
        address _leader,
        address _originalPoster,
        ProjectType _projectType,
        address _proposalAddress
    ) {
        leaderAddress = _leader;
        originalPoster = _originalPoster;
        projectType = _projectType;
        proposalAddress = _proposalAddress;
    }

    function addProjectMember(address member) public {}

    function removeProjectMember(address member) public {}

    function getProjectMembers() public view returns (address[] memory) {}

    function setProjectLeader(address member) public {}

    function setProjectManager(address member) public {}

    function setProjectDescription(string memory description) public {}

    function setIsPrivate(bool _isPrivate) public {}
}
