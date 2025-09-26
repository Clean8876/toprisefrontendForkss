"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Edit, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { Ticket, TicketStatus } from "@/types/Ticket-types";
import UpdateStatus from "./popUp/updateStatus";
import UpdateNotes from "./popUp/UpdateNotes";

interface GeneralTicketsProps {
  tickets: Ticket[];
  searchQuery: string;
  loading: boolean;
  onViewTicket: (ticketId: string) => void;
  onTicketsRefresh?: () => void;
  filters?: {
    status: string;
    assigned: string;
    dateRange: string;
  };
}

export default function GeneralTickets({ 
  tickets, 
  searchQuery, 
  loading, 
  onViewTicket,
  onTicketsRefresh,
  filters = { status: "", assigned: "", dateRange: "" }
}: GeneralTicketsProps) {
  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Update status dialog state
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Update notes dialog state
  const [updateNotesOpen, setUpdateNotesOpen] = useState(false);
  const [selectedTicketForNotes, setSelectedTicketForNotes] = useState<Ticket | null>(null);

  // Filter tickets to only show General type
  const generalTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.ticketType === "General");
  }, [tickets]);

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let currentTickets = [...generalTickets];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      currentTickets = currentTickets.filter(
        (ticket) =>
          ticket._id?.toLowerCase().includes(q) ||
          ticket.description?.toLowerCase().includes(q) ||
          ticket.status?.toLowerCase().includes(q) ||
          ticket.userRef?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (filters.status) {
      currentTickets = currentTickets.filter(ticket => 
        ticket.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply assigned filter
    if (filters.assigned) {
      const isAssigned = filters.assigned === "true";
      currentTickets = currentTickets.filter(ticket => 
        ticket.assigned === isAssigned
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      currentTickets = currentTickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        
        switch (filters.dateRange) {
          case "today":
            return ticketDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return ticketDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return ticketDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort tickets
    if (sortField) {
      currentTickets.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case "_id":
            aValue = a._id?.toLowerCase() || "";
            bValue = b._id?.toLowerCase() || "";
            break;
          case "description":
            aValue = a.description?.toLowerCase() || "";
            bValue = b.description?.toLowerCase() || "";
            break;
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "updatedAt":
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case "status":
            aValue = a.status?.toLowerCase() || "";
            bValue = b.status?.toLowerCase() || "";
            break;
          case "assigned":
            aValue = a.assigned ? 1 : 0;
            bValue = b.assigned ? 1 : 0;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === "asc") {
          return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
          return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
      });
    }
    
    return currentTickets;
  }, [generalTickets, searchQuery, sortField, sortDirection, filters]);

  // Pagination
  const totalItems = filteredAndSortedTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedTickets.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-4 h-4 text-[#C72920]" /> : 
      <ChevronDown className="w-4 h-4 text-[#C72920]" />;
  };

  const getStatusBadge = (status: TicketStatus) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (status.toLowerCase()) {
      case "open":
        return `${baseClasses} text-green-700 bg-green-100`;
      case "in progress":
        return `${baseClasses} text-blue-700 bg-blue-100`;
      case "closed":
        return `${baseClasses} text-gray-700 bg-gray-100`;
      case "pending":
        return `${baseClasses} text-yellow-700 bg-yellow-100`;
      case "resolved":
        return `${baseClasses} text-purple-700 bg-purple-100`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleUpdateStatus = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setUpdateStatusOpen(true);
  };

  const handleUpdateNotes = (ticket: Ticket) => {
    setSelectedTicketForNotes(ticket);
    setUpdateNotesOpen(true);
  };

  const handleStatusUpdated = () => {
    if (onTicketsRefresh) {
      onTicketsRefresh();
    }
  };

  return (
    <div>
      <div className="hidden sm:block overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-[#E5E5E5] bg-gray-50/50">
              <TableHead className="px-4 py-4 w-8 font-[Red Hat Display]">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("_id")}
              >
                <div className="flex items-center gap-1">
                  Ticket ID
                  {getSortIcon("_id")}
                </div>
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("description")}
              >
                <div className="flex items-center gap-1">
                  Message
                  {getSortIcon("description")}
                </div>
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("assigned")}
              >
                <div className="flex items-center gap-1">
                  Assigned
                  {getSortIcon("assigned")}
                </div>
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead 
                className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display] cursor-pointer hover:text-[#C72920] transition-colors"
                onClick={() => handleSort("updatedAt")}
              >
                <div className="flex items-center gap-1">
                  Updated
                  {getSortIcon("updatedAt")}
                </div>
              </TableHead>
              <TableHead className="b2 text-gray-700 font-medium px-6 py-4 text-left font-[Red Hat Display]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="px-4 py-4 w-8">
                      <Skeleton className="w-5 h-5 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-1/2" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-8 w-16 rounded" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedData.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="px-4 py-4 w-8">
                      <Checkbox />
                    </TableCell>
                    <TableCell 
                      className="px-6 py-4 font-medium cursor-pointer hover:text-[#C72920] transition-colors"
                      onClick={() => onViewTicket(ticket._id)}
                    >
                      {ticket._id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium max-w-xs">
                      <div className="truncate" title={ticket.description}>
                        {truncateText(ticket.description, 60)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={getStatusBadge(ticket.status)}>
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-[#000000]">
                      {ticket.assigned ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-[#000000] font-sans">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(ticket._id)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateNotes(ticket)}
                              className="cursor-pointer"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Update Remarks
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalItems > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8 px-6 pb-6">
          {/* Left: Showing X-Y of Z tickets */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} general tickets`}
          </div>
          {/* Right: Pagination Controls */}
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            showItemsInfo={false}
          />
        </div>
      )}

      {/* Empty State */}
      {paginatedData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">No general tickets found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? "Try adjusting your search terms" : "No general support tickets available"}
          </p>
        </div>
      )}

      {/* Update Status Dialog */}
      <UpdateStatus
        open={updateStatusOpen}
        onClose={() => setUpdateStatusOpen(false)}
        ticketId={selectedTicketId}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Update Notes Dialog */}
                        <UpdateNotes
                            open={updateNotesOpen}
                            onClose={() => setUpdateNotesOpen(false)}
                            ticketId={selectedTicketForNotes?._id || null}
                            currentNotes={selectedTicketForNotes?.remarks || ""}
                            onNotesUpdated={handleStatusUpdated}
                        />
    </div>
  );
}
