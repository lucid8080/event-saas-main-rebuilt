"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, DollarSign, RefreshCw } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "subscription" | "one_time" | "refund";
  status: "succeeded" | "pending" | "failed" | "refunded";
  amount: number;
  currency: string;
  createdAt: string;
}

interface RealTransactionsListProps {
  loading?: boolean;
}

export default function RealTransactionsList({ loading = false }: RealTransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(loading);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    } as const;

    return (
      <Badge className="text-xs" variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "subscription":
        return <RefreshCw className="size-4" />;
      case "one_time":
        return <DollarSign className="size-4" />;
      case "refund":
        return <CreditCard className="size-4" />;
      default:
        return <DollarSign className="size-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  if (isLoading) {
    return (
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <div className="w-32 h-6 bg-muted rounded animate-pulse" />
            <div className="w-48 h-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-20 h-8 ml-auto bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 items-center">
                <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="w-20 h-4 ml-auto bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Transactions</CardTitle>
            <CardDescription className="text-balance">
              No transactions available yet. Transactions will appear here as users make purchases.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col py-8 text-center items-center justify-center">
            <CreditCard className="size-12 mb-4 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Transactions Yet</h3>
            <p className="max-w-sm mb-4 text-muted-foreground">
              Transaction data will appear here as users complete purchases and subscriptions.
            </p>
            <p className="text-sm text-muted-foreground">
              The system is ready to track real transaction data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transactions</CardTitle>
          <CardDescription className="text-balance">
            Recent transactions from your store.
          </CardDescription>
        </div>
        <Button size="sm" className="px-4 ml-auto shrink-0 gap-1">
          <Link href="#" className="flex items-center gap-2">
            <span>View All</span>
            <ArrowUpRight className="hidden size-4 sm:block" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden xl:table-column">Type</TableHead>
              <TableHead className="hidden xl:table-column">Status</TableHead>
              <TableHead className="hidden xl:table-column">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.customerName}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {transaction.customerEmail}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-column">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(transaction.type)}
                    <span className="capitalize">{transaction.type.replace("_", " ")}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-column">
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                  {format(new Date(transaction.createdAt), "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 