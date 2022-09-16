// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

import "../lib/NoDelegateCall.sol";
import "./MemberPool.sol";
import "./ApplicantPool.sol";
import "./MemberMap.sol";

contract MemberPoolFactory is NoDelegateCall {
    event MemberPoolCreated(address sender, address pool);
    address public owner;
    address[] public pools;
    address immutable memberMapAddress;
    address immutable treasuryAddress;

    constructor(address _treasuryAddress) {
        owner = msg.sender;
        memberMapAddress = address(new MemberMap());
        treasuryAddress = _treasuryAddress;
    }

    function createMemberPool(string memory name) public noDelegateCall {
        address applicantPoolAddress = address(
            new ApplicantPool(memberMapAddress, address(this), treasuryAddress)
        );
        address poolAddress = address(
            new MemberPool(applicantPoolAddress, msg.sender, name)
        );
        pools.push(poolAddress);
        MemberMap map = MemberMap(memberMapAddress);
        map.addPoolCreator(msg.sender, poolAddress);
        emit MemberPoolCreated(msg.sender, poolAddress);
    }

    function getMemberPools() public view returns (address[] memory) {
        return pools;
    }
}
