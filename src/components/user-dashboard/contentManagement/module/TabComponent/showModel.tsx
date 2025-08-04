import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCategories, getModels } from "@/service/product-Service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";


export default function ShowModel() {
        const [model, setModel] = useState<any[]>([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [loading, setLoading] = useState(false);
        const itemPerPage = 10;
    
          const totalPages = Math.ceil(model.length / itemPerPage);
      const paginatedData = model.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
      );
         useEffect(() => {
            const fetchData = async () => {
                setLoading(true);
              try {
                const response = await getModels();
                setLoading(false);
                if (!response || !response.data) {
                  console.error("No data found in response");
                  return;
                }
                const Items = response.data;
                setModel(Items);
              } catch (err: any) {
                console.error("Error fetching data:", err);
                setLoading(false);
              }
            };
            fetchData();
          }, []);
      
            if (loading) {
          return (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Model</h2>
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">Loading Models...</div>
              </div>
            </div>
          );
        }
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Models</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.model_name || "No Title"}</TableCell>
                <TableCell>
                  {item.brand_ref?.brand_name || "No Brand"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.model_Status === "Created"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {item.model_Status || "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No models found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - moved outside of table */}
      {model.length > 0 && totalPages > 1 && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mt-8">
          {/* Left: Showing X-Y of Z models */}
          <div className="text-sm text-gray-600 text-center sm:text-left">
            {`Showing ${(currentPage - 1) * itemPerPage + 1}-${Math.min(
              currentPage * itemPerPage,
              model.length
            )} of ${model.length} models`}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center sm:justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 3) }).map(
                  (_, idx) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 2) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + idx;
                    } else {
                      pageNum = currentPage - 1 + idx;
                    }

                    // Prevent out-of-bounds pageNum
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <PaginationItem
                        key={pageNum}
                        className="hidden sm:block"
                      >
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}
