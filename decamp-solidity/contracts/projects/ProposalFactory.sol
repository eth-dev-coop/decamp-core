// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

import "../lib/NoDelegateCall.sol";
import "./Proposal.sol";
import "../members/MemberMap.sol";

contract ProposalFactory is NoDelegateCall {
    event ProposalCreated(address sender, address);
    address public owner;

    address[] public proposals;
    address immutable memberMap;
    address immutable projectFactoryAddress;

    constructor(address map, address _projectFactoryAddress) {
        memberMap = map;
        projectFactoryAddress = _projectFactoryAddress;
    }

    function createProposal(string calldata description) public noDelegateCall {
        address proposalAddress = address(
            new Proposal(
                msg.sender,
                description,
                memberMap,
                projectFactoryAddress
            )
        );
        proposals.push(proposalAddress);
        emit ProposalCreated(msg.sender, proposalAddress);
    }

    function getProposals() public view returns (address[] memory) {
        return proposals;
    }
}
