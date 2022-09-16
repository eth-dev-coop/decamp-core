// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ProjectType.sol";

contract Project {
    address immutable originalPoster;
    address immutable leaderAddress;
    ProjectType public projectType;
    bool public isPrivate;

    constructor(
        address _leader,
        address _originalPoster,
        ProjectType _projectType
    ) {
        leaderAddress = _leader;
        originalPoster = _originalPoster;
        projectType = _projectType;
    }

    function addProjectMember(address member) public {}

    function removeProjectMember(address member) public {}

    function getProjectMembers() public view returns (address[] memory) {}

    function setProjectLeader(address member) public {}

    function setProjectManager(address member) public {}

    function setProjectDescription(string memory description) public {}

    function setIsPrivate(bool _isPrivate) public {}
}
