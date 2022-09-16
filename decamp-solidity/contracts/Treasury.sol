// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.17;

contract Treasury {
    address public owner;
    uint256 public balance;

    uint256 public newApplicantFee = 1000000000000000;
    uint256 public newPoolFee = 1000000000000000;
    uint256 public newProposalFee = 1000000000000000;

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public {
        require(msg.sender == owner);
        owner = newOwner;
    }

    function setNewApplicantFee(uint256 amount) public {
        require(msg.sender == owner);
        newApplicantFee = amount;
    }

    function setNewPoolFee(uint256 amount) public {
        require(msg.sender == owner);
        newPoolFee = amount;
    }

    function setNewProposalFee(uint256 amount) public {
        require(msg.sender == owner);
        newProposalFee = amount;
    }

    function payNewProposalFee() public payable {
        require(msg.value > 0);
        balance += msg.value;
    }

    function payNewApplicantFee() public payable {
        require(msg.value > 0);
        balance += msg.value;
    }

    function payNewPoolFee() public payable {
        require(msg.value > 0);
        balance += msg.value;
    }

    function withdraw(uint256 amount) public payable {
        require(msg.sender == owner, "Not the owner");
        require(amount >= amount);
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transaction Failed");
    }
}
