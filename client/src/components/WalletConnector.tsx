import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { CheckCircle } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WalletConnector = () => {
  const { account, chainId, balance, connect, disconnect, isConnected, isConnecting } = useWeb3();
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const chainName = (id: number) => {
    switch (id) {
      case 137:
        return "Polygon";
      case 80001:
        return "Mumbai Testnet";
      case 42161:
        return "Arbitrum One";
      case 421613:
        return "Arbitrum Goerli";
      default:
        return "Unknown Network";
    }
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting} 
        className="bg-primary text-white hover:bg-primary-dark"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center">
      <div className="bg-green-100 text-secondary px-3 py-1 rounded-full text-sm flex items-center mr-4">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span className="font-medium">Connected</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-neutral-lightest px-3 py-1 rounded-full border border-neutral-lighter text-sm">
            <span className="font-mono">{shortenAddress(account)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuItem className="flex justify-between">
            <span>Network:</span> 
            <span>{chainName(chainId || 0)}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between">
            <span>Balance:</span> 
            <span>{balance} MATIC</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletConnector;
