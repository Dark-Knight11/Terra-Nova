import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SiweMessage } from 'siwe';
import { api } from '../api/client';
import { ethers } from 'ethers';




export const WalletConnection = () => {
  const { user, refreshUser } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  // Handle wallet connection flow
  const handleWalletConnection = useCallback(async (address: string) => {
    try {
      setError(null);
      setSuccess(null);
      setIsConnecting(true);

      // Step 1: Get nonce for linking
      const nonceResponse = await api.auth.generateLinkingNonce();
      const nonce = nonceResponse.nonce;

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect your wallet');
      }

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (!chainId) {
        throw new Error('Could not get chain ID');
      }

      // Create SIWE-compliant message

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: ethers.getAddress(address),
        statement: 'Welcome to Terra-Nova. This request will link your wallet to your account.',
        uri: window.location.origin,
        version: '1',
        chainId: parseInt(chainId as string, 16),
        nonce: nonce,
      });
      const messageToSign = siweMessage.prepareMessage();

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, address],
      });

      // Link the wallet
      await api.auth.linkWallet({
        message: messageToSign,
        signature: signature,
      });

      setSuccess('Wallet connected successfully!');
      await refreshUser();
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error in wallet connection flow:', error);
      setError(error.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshUser]);

  // Handle wallet connection
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('Please install MetaMask to connect your wallet');
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      // Request account access
      const accounts = await window.ethereum?.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts?.[0]) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      await handleWalletConnection(address);
    } catch (err) {
      const error = err as Error;
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [handleWalletConnection]);

  // Handle wallet disconnection
  const disconnectWallet = useCallback(async () => {
    try {
      // Call your API to disconnect the wallet
      // This is a placeholder - implement based on your API
      // await api.auth.unlinkWallet();
      setSuccess('Wallet disconnected successfully!');
      await refreshUser();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error disconnecting wallet:', error);
      setError(error.message || 'Failed to disconnect wallet');
    }
  }, [refreshUser]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled() || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet was disconnected
        void disconnectWallet();
      } else if (user?.walletAddress && accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
        // Different account connected
        void connectWallet();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [user?.walletAddress, connectWallet, disconnectWallet]);

  if (!isMetaMaskInstalled()) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <p>Please install MetaMask to connect your wallet</p>
        <a
          href="https://metamask.io/download.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  return (
    <div className="w-full">
      {user?.walletAddress ? (
        <p className="text-sm text-white/80">
          Wallet: <span className="font-mono text-emerald-400">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
        </p>
      ) : (
        <div className="w-full">
          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-white/5 text-white border border-white/10 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <span>Connect MetaMask</span>
              </>
            )}
          </button>
          {success && (
            <div className="mt-2 text-sm text-green-400">
              {success}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
