// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

/**
 * @title Simple voting contract
 */
 
contract SimpleVoting {
    
    // Set variables
    uint public expiration;
    uint public countA;
    uint public countB;
    bool public started;
    address owner;
    
    //Set deployer as owner
    constructor() {
        owner = msg.sender;
    }
    
    
    //create a modifier to easily check expiration and if voting started.
    modifier expiredOrNot {
        require(block.timestamp < expiration);
        require(started == true);
        _;
    }
    
    //Start the voting.If time expires you need to invoke stopVoting function to be able to start again
    function startVoting() external  {
        require(owner == msg.sender);
        require(started == false);
        expiration = block.timestamp + 10 seconds;
        started = true;
    }
    
    //Stop voting and reset variables if _reset passed true by owner.Else voting info stays.
    function stopVoting(bool _reset) external {
        require(owner == msg.sender);
        if(_reset == true) {
        started = false;
        countA = 0;
        countB = 0;
        expiration = 0;
        }else {
            started = false;
        }

    }
    
    
    //Add +1 to voteA or voteB .Looking for ways to allow only 1 vote for 1 address or only vote for a or b.
    function voteA() external expiredOrNot {
        countA += 1;
    }
     function voteB() external expiredOrNot {
        countB += 1;
    }
    
    //get total vote count
    function getTotalVotes() external view returns(uint _totalVotesA, uint _totalVotesB) {
        uint votesA = countA;
        uint votesB = countB;
        return(votesA, votesB);
    }
    
}