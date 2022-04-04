// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

/**
 * @title Simple voting contract from hardcod3d.eth
 */
 
contract SimpleVoting {
    
    // Set variables
    uint public expiration;
    uint public countA;
    uint public countB;
    bool public started;
    address owner;
    address sender;
    // create mapping so users can only vote once
    mapping(address => bool) public hasVoted;

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

   // modifier to check if user voted before 

    modifier checkVoted {
        require(hasVoted[msg.sender] == false);
        _;
    }
    
    //Start the voting.If time expires you need to invoke stopVoting function to be able to start again
    function startVoting() external  {
        require(owner == msg.sender);
        require(started == false);
        expiration = block.timestamp + 10 seconds; //you can change this.i set to 10 seconds so i can play with it and still can wait for expiration.
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
    function voteA() external expiredOrNot checkVoted {
        countA += 1;
        hasVoted[msg.sender] = true;
    }
     function voteB() external expiredOrNot checkVoted {
        countB += 1;
        hasVoted[msg.sender] = true;
    }
    
    //get total vote count
    function getTotalVotes() external view returns(uint) {
        uint totalvotes = countA + countB;
        return(totalvotes);
    }
    
}
