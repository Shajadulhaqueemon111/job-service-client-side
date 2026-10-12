"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Columns,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  MessageSquare,
  CreditCard,
  Receipt,
  Star,
  Clock,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn, formatBDT, formatDateBD, formatBDPhone } from "@/lib/utils";

export interface ServiceRequestItem {
  _id: string;
  title: string;
  description: string;
  division: string;
  district: string;
  area?: string;
  address: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  estimatedBudget?: number;
  finalPrice?: number;
  commissionRate?: number;
  commissionAmount?: number;
  providerEarnings?: number;
  paymentStatus?: "pending" | "paid" | "settled";
  paymentMethod?: "bkash" | "nagad" | "cash" | "none";
  transactionId?: string;
  senderMfsNumber?: string;
  paidAmount?: number;
  paidAt?: string;
  status: "pending" | "accepted" | "completed" | "rejected" | "cancelled";
  hasReview: boolean;
  providerNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  provider: {
    _id: string;
    businessTitle: string;
    phone: string;
    rating: number;
    user?: {
      name: string;
    };
    category?: {
      name: string;
      nameBn: string;
    };
  };
}

interface DataTableProps {
  requests: ServiceRequestItem[];
  loading?: boolean;
  onPay?: (req: ServiceRequestItem) => void;
  onReceipt?: (req: ServiceRequestItem) => void;
  onReview?: (req: ServiceRequestItem) => void;
  onChat?: (req: ServiceRequestItem) => void;
}

export function DataTable({
  requests,
  loading = false,
  onPay,
  onReceipt,
  onReview,
  onChat,
}: DataTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const pendingRequests = React.useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  );
  const acceptedRequests = React.useMemo(
    () => requests.filter((r) => r.status === "accepted"),
    [requests]
  );
  const completedRequests = React.useMemo(
    () => requests.filter((r) => r.status === "completed"),
    [requests]
  );

  const filteredRequests = React.useMemo(() => {
    return requests.filter((r) => {
      const matchesTab =
        activeTab === "all" ? true : r.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.provider?.businessTitle?.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((d) => d._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
          {/* Tabs on Left */}
          <TabsList className="bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="text-xs px-3 py-1.5 font-semibold rounded-lg text-slate-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs"
            >
              All Requests ({requests.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs px-3 py-1.5 font-semibold rounded-lg text-slate-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs flex items-center gap-1.5"
            >
              <span>Pending</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                {pendingRequests.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="accepted"
              className="text-xs px-3 py-1.5 font-semibold rounded-lg text-slate-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs flex items-center gap-1.5"
            >
              <span>Active</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                {acceptedRequests.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs px-3 py-1.5 font-semibold rounded-lg text-slate-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-2xs flex items-center gap-1.5"
            >
              <span>Completed</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                {completedRequests.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Action buttons & Search on Right */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              />
            </div>

            <Link href="/services">
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 shadow-2xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Book Service</span>
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-500" />
                <span>Loading your service orders...</span>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 text-center p-6 space-y-2">
                <Clock className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                  No service bookings found in this tab
                </p>
                <p className="text-xs text-slate-500">
                  You can explore our marketplace to book verified home technicians.
                </p>
                <div className="pt-2">
                  <Link href="/services">
                    <Button size="sm" className="rounded-xl text-xs font-semibold">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs">
                  <TableRow className="border-b border-slate-200 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="w-10 px-3">
                      <Checkbox
                        checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Service Request</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Provider</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Appointment</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs text-right">Price</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Status</TableHead>
                    <TableHead className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Payment</TableHead>
                    <TableHead className="text-right pr-4 font-bold text-slate-700 dark:text-zinc-300 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRequests.map((req) => {
                    const isSelected = selectedIds.includes(req._id);
                    return (
                      <TableRow
                        key={req._id}
                        className={cn(
                          "border-b border-slate-100 dark:border-zinc-800/60 text-xs transition-colors",
                          isSelected && "bg-slate-50 dark:bg-zinc-800/40"
                        )}
                      >
                        <TableCell className="w-10 px-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(req._id)}
                          />
                        </TableCell>

                        {/* Title & Description */}
                        <TableCell className="font-medium text-slate-900 dark:text-white max-w-xs">
                          <div>
                            <p className="font-bold truncate">{req.title}</p>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block">
                              {req.address}
                            </span>
                          </div>
                        </TableCell>

                        {/* Provider */}
                        <TableCell className="text-slate-700 dark:text-zinc-300">
                          {req.provider?.businessTitle ? (
                            <div>
                              <span className="font-semibold">{req.provider.businessTitle}</span>
                              {req.provider.phone && (
                                <span className="block text-[11px] text-slate-500">
                                  {formatBDPhone(req.provider.phone)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Assigning...</span>
                          )}
                        </TableCell>

                        {/* Appointment */}
                        <TableCell className="text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                          <div>
                            <span>{formatDateBD(req.preferredDate)}</span>
                            <span className="block text-[11px] text-slate-500">{req.preferredTime}</span>
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatBDT(req.finalPrice || req.estimatedBudget || 0)}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={
                              req.status === "completed"
                                ? "default"
                                : req.status === "accepted"
                                ? "verified"
                                : req.status === "pending"
                                ? "warning"
                                : "secondary"
                            }
                            className="capitalize text-[10px] font-bold rounded-lg"
                          >
                            {req.status}
                          </Badge>
                        </TableCell>

                        {/* Payment */}
                        <TableCell>
                          <Badge
                            variant={req.paymentStatus === "paid" ? "default" : "outline"}
                            className={cn(
                              "text-[10px] font-bold rounded-lg capitalize",
                              req.paymentStatus === "paid"
                                ? "bg-emerald-600 text-white"
                                : "text-amber-600 border-amber-300 dark:border-amber-800"
                            )}
                          >
                            {req.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right pr-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Chat */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onChat?.(req)}
                              title="Chat with Provider"
                              className="h-7 px-2 text-xs font-semibold rounded-lg border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600"
                            >
                              <MessageSquare className="h-3 w-3 mr-1 text-emerald-500" />
                              <span>Chat</span>
                            </Button>

                            {/* Pay button */}
                            {req.status === "completed" && req.paymentStatus !== "paid" && (
                              <Button
                                size="sm"
                                onClick={() => onPay?.(req)}
                                className="h-7 px-2 text-xs font-bold rounded-lg bg-pink-600 hover:bg-pink-700 text-white"
                              >
                                <CreditCard className="h-3 w-3 mr-1" />
                                <span>Pay</span>
                              </Button>
                            )}

                            {/* Receipt button */}
                            {req.paymentStatus === "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReceipt?.(req)}
                                className="h-7 px-2 text-xs font-semibold rounded-lg border-slate-200 dark:border-zinc-800"
                              >
                                <Receipt className="h-3 w-3 mr-1 text-emerald-500" />
                                <span>Receipt</span>
                              </Button>
                            )}

                            {/* Leave Review button */}
                            {req.status === "completed" && !req.hasReview && (
                              <Button
                                size="sm"
                                onClick={() => onReview?.(req)}
                                className="h-7 px-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                              >
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                <span>Review</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
