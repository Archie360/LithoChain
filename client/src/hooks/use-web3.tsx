import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { formatEther } from "@/lib/utils";

// Add MetaMask ethereum provider to window interface
declare global {
  interface Window {
    ethereum: any;
  }
}

interface Web3ContextValue {
  account: string | undefined;
  chainId: number | undefined;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const Web3Context = createContext<Web3ContextValue>({
  account: undefined,
  chainId: undefined,
  balance: "0.000",
  connect: async () => {},
  disconnect: async () => {},
  isConnected: false,
  isConnecting: false,
  provider: null,
  signer: null,
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [balance, setBalance] = useState("0.000");
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return typeof window !== "undefined" && window.ethereum !== undefined;
  };

  // Initialize provider
  const initProvider = async () => {
    if (!isMetaMaskAvailable()) return null;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      return provider;
    } catch (error) {
      console.error("Error initializing provider:", error);
      return null;
    }
  };

  // Connect wallet
  const connect = async () => {
    if (!isMetaMaskAvailable()) {
      window.alert("Please install MetaMask to use this application");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const provider = await initProvider();
      if (!provider) throw new Error("Failed to initialize provider");
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Get signer for signature
      const signer = await provider.getSigner();
      setSigner(signer);
      
      // Create message to sign
      const message = `Sign this message to authenticate with LithoChain: ${Date.now()}`;
      
      // Request signature from user
      const signature = await signer.signMessage(message);
      
      // Send to backend for verification and session creation
      const response = await fetch('/api/auth/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          signature,
          message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with server');
      }
      
      // Set account info after successful authentication
      setAccount(address);
      
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      
      const balanceWei = await provider.getBalance(address);
      setBalance(formatEther(balanceWei.toString()).substring(0, 5));
      
      // Store connection state in local storage
      localStorage.setItem("wallet_connected", "true");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      // Call backend to clear session
      await fetch('/api/auth/wallet/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error disconnecting from server:", error);
    } finally {
      // Clear local state
      setAccount(undefined);
      setChainId(undefined);
      setBalance("0.000");
      setSigner(null);
      localStorage.removeItem("wallet_connected");
    }
  };

  // Update account details when events occur
  useEffect(() => {
    if (!isMetaMaskAvailable() || !provider) return;
    
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else {
        setAccount(accounts[0]);
        
        if (provider) {
          const balanceWei = await provider.getBalance(accounts[0]);
          setBalance(formatEther(balanceWei.toString()).substring(0, 5));
          
          const signer = await provider.getSigner();
          setSigner(signer);
        }
      }
    };
    
    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
      window.location.reload();
    };
    
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider]);

  // Auto-connect on app load if previously connected
  useEffect(() => {
    const isConnected = localStorage.getItem("wallet_connected") === "true";
    if (isConnected) {
      connect();
    }
  }, []);

  const value: Web3ContextValue = {
    account,
    chainId,
    balance,
    connect,
    disconnect,
    isConnected: !!account,
    isConnecting,
    provider,
    signer,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
