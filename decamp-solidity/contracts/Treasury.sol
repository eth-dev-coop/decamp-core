// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

contract Treasury {
    uint256 public balance;

    uint256 public newApplicantFee = 1000000000000000;
    uint256 public newPoolFee = 1000000000000000;
    uint256 public newProposalFee = 1000000000000000;

    mapping(address => uint256) memberAllocation;
    mapping(address => bool) memberHasAllocation;

    mapping(address => mapping(address => bool)) applicantFeeRecords;

    address governanceAddress;

    constructor() {
        //TODO set governance address
    }

    function setGovernance(address newGovernance) public {
        require(msg.sender == governanceAddress);
        governanceAddress = newGovernance;
    }

    function setNewApplicantFee(uint256 amount) public {
        require(msg.sender == governanceAddress);
        newApplicantFee = amount;
    }

    function setNewPoolFee(uint256 amount) public {
        require(msg.sender == governanceAddress);
        newPoolFee = amount;
    }

    function setNewProposalFee(uint256 amount) public {
        require(msg.sender == governanceAddress);
        newProposalFee = amount;
    }

    function payNewProposalFee() public payable {
        require(msg.value > 0);
        balance += msg.value;
    }

    function payNewApplicantFee(address pool) public payable {
        require(msg.value > 0);
        balance += msg.value;
        applicantFeeRecords[msg.sender][pool] = true;
    }

    function payNewPoolFee() public payable {
        require(msg.value > 0);
        balance += msg.value;
    }

    function allocateFunds(address account, uint256 amount) public payable {
        require(msg.sender == governanceAddress);
        require(balance >= amount);
        require(amount > 0);
        memberAllocation[account] += amount;
        balance -= amount;
        memberHasAllocation[account] = true;
    }

    function didPayApplicantFee(address person, address pool)
        public
        view
        returns (bool)
    {
        return applicantFeeRecords[person][pool];
    }

    function hasAllocation() public view returns (bool) {
        return memberHasAllocation[msg.sender];
    }

    function getMemberAllocation(address member) public view returns (uint256) {
        return memberAllocation[member];
    }

    function withdraw() public payable {
        require(memberHasAllocation[msg.sender]);
        (bool sent, ) = msg.sender.call{value: memberAllocation[msg.sender]}(
            ""
        );
        require(sent, "Transaction Failed");
        memberAllocation[msg.sender] = 0;
        memberHasAllocation[msg.sender] = false;
    }
}
