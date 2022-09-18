// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

contract MemberMap {
    mapping(address => mapping(address => bool)) public memberMap;
    mapping(address => address[]) public memberPools;
    mapping(address => address[]) public memberProjects;

    mapping(address => mapping(address => bool)) public stakeholderMap;
    mapping(address => address[]) public stakeholderProposals;

    mapping(address => mapping(address => bool)) public creatorPoolsMap;
    mapping(address => address[]) public creatorPools;
    address[] public pools;

    function poolUpOne(uint256 atIndex) public {
        require(atIndex > pools.length, "Index out of range");
        address temp = pools[atIndex];
        pools[atIndex] = pools[atIndex + 1];
        pools[atIndex + 1] = temp;
    }

    function addMember(address member, address memberPool) public {
        memberMap[member][memberPool] = true;
        memberPools[member].push(memberPool);
    }

    function memberIsInAnyPool(address member) public view returns (bool) {
        return memberPools[member].length > 0;
    }

    function isMember(address member, address memberPool)
        public
        view
        returns (bool)
    {
        return memberMap[member][memberPool];
    }

    function getMemberPools(address member)
        public
        view
        returns (address[] memory)
    {
        {
            return memberProjects[member];
        }
    }

    function addMemberProject(address member, address project) public {
        memberProjects[member].push(project);
    }

    function removeMemberProject(address member, uint256 index) public {
        require(memberProjects[member].length >= index, "Out of Index");
        memberProjects[member][index] = memberProjects[member][
            memberProjects[member].length - 1
        ];
        memberProjects[member].pop();
    }

    function isStakeholder(address account, address project)
        public
        view
        returns (bool)
    {
        return stakeholderMap[account][project];
    }

    function addStakeholderToProposal(address account, address proposal)
        public
    {
        stakeholderMap[account][proposal] = true;
        stakeholderProposals[account].push(proposal);
    }

    function getStakeholderProposals(address account)
        public
        view
        returns (address[] memory)
    {
        return stakeholderProposals[account];
    }

    function addPoolCreator(address account, address pool) public {
        creatorPoolsMap[account][pool] = true;
        creatorPools[account].push(pool);
        pools.push(pool);
    }

    function getCreatorPools(address account)
        public
        view
        returns (address[] memory)
    {
        return creatorPools[account];
    }

    function isPoolCreator(address account, address pool)
        public
        view
        returns (bool)
    {
        return stakeholderMap[account][pool];
    }
}
