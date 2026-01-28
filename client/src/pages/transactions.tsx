import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_TRANSACTIONS } from "@/lib/mockData";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Transactions = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage and view your transaction history.</p>
        </div>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search transactions..." 
                className="pl-9 bg-secondary/50 border-transparent focus:border-primary/50 transition-colors"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/10">
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TRANSACTIONS.map((txn) => (
                <TableRow key={txn.id} className="hover:bg-secondary/30 border-primary/5">
                  <TableCell className="font-medium text-muted-foreground text-xs">{txn.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{txn.merchant}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs bg-primary/5 text-primary hover:bg-primary/10">
                      {txn.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-mono font-medium",
                    txn.type === 'income' ? "text-emerald-500" : ""
                  )}>
                    {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
