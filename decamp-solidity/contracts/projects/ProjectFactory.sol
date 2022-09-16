// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

import "../lib/NoDelegateCall.sol";
import "./Project.sol";
import "./ProjectType.sol";

contract ProjectFactory is NoDelegateCall {
    event ProjectCreated(address sender, address pool);
    mapping(address => address[]) projects;

    function createProject(
        address memberPool,
        address leader,
        address op,
        ProjectType pType
    ) public noDelegateCall {
        address poolAddress = address(new Project(leader, op, pType));
        projects[memberPool].push(poolAddress);
        emit ProjectCreated(msg.sender, poolAddress);
    }

    function getProjectsByGroup(address memberPool)
        public
        view
        returns (address[] memory)
    {
        return projects[memberPool];
    }
}
