import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet was previously connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);

      window.ethereum.request({ method: 'eth_chainId' })
        .then(setChainId)
        .catch(console.error);

      // Listen for account/network switches
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts.length > 0 ? accounts[0] : null);
      };

      const handleChainChanged = (newChainId) => {
        setChainId(newChainId);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      const err = new Error('No Web3 wallet found. Please install MetaMask to pay with cryptocurrency.');
      setError(err.message);
      throw err;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      setAccount(accounts[0]);
      setChainId(currentChainId);
      return accounts[0];
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'User rejected wallet connection');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  /**
   * Send an on-chain payment in ETH to the NEXORA receiver address
   */
  const sendCryptoPayment = async (receiverAddress, ethAmount) => {
    if (!window.ethereum || !account) {
      throw new Error('Please connect your Web3 wallet first.');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: receiverAddress,
        value: ethers.parseEther(ethAmount.toString())
      });

      // Wait for 1 confirmation
      const receipt = await tx.wait(1);

      return {
        transactionHash: tx.hash,
        receipt,
        blockNumber: receipt.blockNumber
      };
    } catch (err) {
      console.error('Crypto payment transaction failed:', err);
      throw err;
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        sendCryptoPayment,
        formatAddress,
        isConnected: Boolean(account),
        isSepolia: chainId === SEPOLIA_CHAIN_ID || chainId === '11155111'
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
