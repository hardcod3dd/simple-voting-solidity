import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// The ABI for your SimpleVoting contract
const abi = [
  {
    "inputs": [],
    "name": "expiration",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "countA",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "countB",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "started",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "address" }],
    "name": "hasVoted",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "address" }],
    "name": "changeOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetEntered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bool" }],
    "name": "stopVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteA",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const SimpleVotingUI = () => {
  // State variables for blockchain connection, contract state, and UI
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [expiration, setExpiration] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [newOwner, setNewOwner] = useState("");

  // Automatically connect to MetaMask on mount using ethers v5
  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          // Create a new provider from window.ethereum
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          // Request account access if needed
          await provider.send("eth_requestAccounts", []);
          // Get the signer
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setProvider(provider);
          setSigner(signer);
          setAccount(account);
        } catch (err) {
          setError("Failed to connect wallet: " + err.message);
        }
      } else {
        setError("Please install MetaMask");
      }
    }
    connectWallet();
  }, []);

  // Initialize contract using the provided address
  const initializeContract = () => {
    if (!ethers.utils.isAddress(contractAddress)) {
      setError("Invalid contract address");
      return;
    }
    try {
      const contractInstance = new ethers.Contract(contractAddress, abi, signer);
      setContract(contractInstance);
      updateContractState(contractInstance);
    } catch (err) {
      setError("Failed to initialize contract: " + err.message);
    }
  };

  // Fetch and update contract state
  const updateContractState = async (contractInstance) => {
    try {
      const ownerAddr = await contractInstance.owner();
      const started = await contractInstance.started();
      const countA = await contractInstance.countA();
      const countB = await contractInstance.countB();
      const totalVotes = await contractInstance.getTotalVotes();
      const expiration = await contractInstance.expiration();
      const voted = await contractInstance.hasVoted(account);

      setIsOwner(ownerAddr.toLowerCase() === account.toLowerCase());
      setVotingStarted(started);
      setCountA(countA.toNumber());
      setCountB(countB.toNumber());
      setTotalVotes(totalVotes.toNumber());
      setExpiration(expiration.toNumber());
      setHasVoted(voted);
    } catch (err) {
      setError("Failed to update contract state: " + err.message);
    }
  };

  // Vote for option A or B
  const handleVote = async (option) => {
    if (!contract) return;
    try {
      const tx = option === "A" ? await contract.voteA() : await contract.voteB();
      await tx.wait();
      updateContractState(contract);
    } catch (err) {
      setError("Failed to vote: " + err.message);
    }
  };

  // Start the voting (owner only)
  const handleStartVoting = async () => {
    if (!contract) return;
    try {
      const tx = await contract.startVoting();
      await tx.wait();
      updateContractState(contract);
    } catch (err) {
      setError("Failed to start voting: " + err.message);
    }
  };

  // Stop voting with or without resetting (owner only)
  const handleStopVoting = async (reset) => {
    if (!contract) return;
    try {
      const tx = await contract.stopVoting(reset);
      await tx.wait();
      updateContractState(contract);
    } catch (err) {
      setError("Failed to stop voting: " + err.message);
    }
  };

  // Change the owner of the contract (owner only)
  const handleChangeOwner = async () => {
    if (!contract) return;
    if (!ethers.utils.isAddress(newOwner)) {
      setError("Invalid address for new owner");
      return;
    }
    try {
      const tx = await contract.changeOwner(newOwner);
      await tx.wait();
      updateContractState(contract);
    } catch (err) {
      setError("Failed to change owner: " + err.message);
    }
  };

  // Reset voter's status (when voting is not active)
  const handleResetEntered = async () => {
    if (!contract) return;
    try {
      const tx = await contract.resetEntered();
      await tx.wait();
      updateContractState(contract);
    } catch (err) {
      setError("Failed to reset voter status: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Simple Voting dApp</h1>
      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ width: "300px", padding: "8px", marginRight: "8px" }}
        />
        <button onClick={initializeContract} style={{ padding: "8px 16px" }}>
          Initialize
        </button>
      </div>

      <p>Connected Account: {account || "Not connected"}</p>

      {contract && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "500px",
          }}
        >
          <p>Owner: {isOwner ? "Yes (you)" : "No"}</p>
          <p>Voting Started: {votingStarted ? "Yes" : "No"}</p>
          <p>
            Expiration:{" "}
            {expiration
              ? new Date(expiration * 1000).toLocaleString()
              : "N/A"}
          </p>
          <hr />
          <p>Count A: {countA}</p>
          <p>Count B: {countB}</p>
          <p>Total Votes: {totalVotes}</p>
          <p>Has Voted: {hasVoted ? "Yes" : "No"}</p>

          <div style={{ marginTop: "16px" }}>
            <button
              onClick={() => handleVote("A")}
              disabled={!votingStarted || hasVoted}
              style={{ padding: "8px 16px", marginRight: "8px" }}
            >
              Vote A
            </button>
            <button
              onClick={() => handleVote("B")}
              disabled={!votingStarted || hasVoted}
              style={{ padding: "8px 16px" }}
            >
              Vote B
            </button>
          </div>

          {isOwner && (
            <div
              style={{
                marginTop: "20px",
                padding: "10px",
                border: "1px dashed #ccc",
              }}
            >
              <h3>Owner Controls</h3>
              <button
                onClick={handleStartVoting}
                disabled={votingStarted}
                style={{ padding: "8px 16px", marginRight: "8px" }}
              >
                Start Voting
              </button>
              <button
                onClick={() => handleStopVoting(false)}
                style={{ padding: "8px 16px", marginRight: "8px" }}
              >
                Stop Voting
              </button>
              <button onClick={() => handleStopVoting(true)} style={{ padding: "8px 16px" }}>
                Stop & Reset
              </button>
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  placeholder="New Owner Address"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  style={{ width: "300px", padding: "8px", marginRight: "8px" }}
                />
                <button onClick={handleChangeOwner} style={{ padding: "8px 16px" }}>
                  Change Owner
                </button>
              </div>
            </div>
          )}

          {!votingStarted && (
            <div style={{ marginTop: "20px" }}>
              <button onClick={handleResetEntered} style={{ padding: "8px 16px" }}>
                Reset Voter Status
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleVotingUI;
