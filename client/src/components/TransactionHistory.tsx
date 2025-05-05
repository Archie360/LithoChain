import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatTimestamp, shortenAddress } from "@/lib/utils";
import { ShoppingCart, SquareSplitHorizontal, PlusCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: 'job_payment' | 'model_purchase' | 'deposit';
  amount: string;
  timestamp: string;
  txHash: string;
  metadata?: {
    jobId?: string;
    modelName?: string;
    from?: string;
  };
}

const TransactionHistory = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions/recent'],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'job_payment':
        return <SquareSplitHorizontal className="h-4 w-4 text-primary" />;
      case 'model_purchase':
        return <ShoppingCart className="h-4 w-4 text-accent" />;
      case 'deposit':
        return <PlusCircle className="h-4 w-4 text-secondary" />;
      default:
        return <SquareSplitHorizontal className="h-4 w-4 text-primary" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'job_payment':
        return 'Job Payment';
      case 'model_purchase':
        return 'Model Purchase';
      case 'deposit':
        return 'Wallet Deposit';
      default:
        return 'Transaction';
    }
  };

  const getTransactionDetail = (tx: Transaction) => {
    if (tx.type === 'job_payment' && tx.metadata?.jobId) {
      return `Job #${tx.metadata.jobId}`;
    } else if (tx.type === 'model_purchase' && tx.metadata?.modelName) {
      return tx.metadata.modelName;
    } else if (tx.type === 'deposit' && tx.metadata?.from) {
      return 'From External Wallet';
    }
    return '';
  };

  const isPositiveAmount = (type: string) => {
    return type === 'deposit';
  };

  if (isLoading) {
    return (
      <Card className="shadow-fluent">
        <CardHeader className="px-6 py-5 border-b border-neutral-lighter">
          <h2 className="text-lg font-medium text-neutral-dark">Recent Transactions</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <p>Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-fluent">
      <CardHeader className="px-6 py-5 border-b border-neutral-lighter">
        <h2 className="text-lg font-medium text-neutral-dark">Recent Transactions</h2>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral">No recent transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-lighter">
            {transactions.map((tx: Transaction) => (
              <div key={tx.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      {getTransactionIcon(tx.type)}
                      <span className="text-sm font-medium text-neutral-dark ml-2">
                        {getTransactionLabel(tx.type)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral mt-1">{getTransactionDetail(tx)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isPositiveAmount(tx.type) ? 'text-status-success' : 'text-status-error'}`}>
                      {isPositiveAmount(tx.type) ? '+' : '-'}{tx.amount}
                    </div>
                    <p className="text-xs text-neutral mt-1">{formatTimestamp(tx.timestamp)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <a 
                    href={`https://polygonscan.com/tx/${tx.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary hover:text-primary-dark font-mono"
                  >
                    {shortenAddress(tx.txHash, 6)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-neutral-lightest px-6 py-4 border-t border-neutral-lighter">
        <Link href="/transactions" className="text-sm text-primary hover:text-primary-dark font-medium">
          View all transactions →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TransactionHistory;
