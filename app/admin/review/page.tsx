"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Upload } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface Review {
  id: string;
  email: string;
  message: string;
}

export default function Component() {
  const [review, setReview] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get(API_ENDPOINTS.CONTACT, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        setReview(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("There was an error!", error);
      } finally {
      }
    }
    fetchUsers();
  }, []);


  const onGetExporProduct = async (title?: string, worksheetname?: string) => {
    try {
      setLoading(true);
      // Check if the action result contains data and if it's an array
      if (products && Array.isArray(products)) {
        const dataToExport = products.map((pro: any) => ({
          id: pro.id,
          email: pro.email,
          message: pro.message
        })
          ,);
        // Create Excel workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `${title}.xlsx`);
        console.log(`Exported data to ${title}.xlsx`);
        setLoading(false);
      } else {
        setLoading(false);
        console.log("#==================Export Error")
      }
    } catch (error: any) {
      setLoading(false);
      console.log("#==================Export Error", error.message);

    }
  };


  // const onGetExportProduct = async (title = 'ExportedData', worksheetname = 'Sheet1') => {
  //   try {
  //     setLoading(true);


  //     if (response.data && response.data.data && Array.isArray(response.data.data)) {
  //       const { columns, data } = response.data;

  //       // Buat data dalam bentuk AoA (Array of Arrays)
  //       const worksheetData = [columns, ...data.map(item => columns.map(col => item[col]))];

  //       // Buat workbook dan worksheet
  //       const workbook = XLSX.utils.book_new();
  //       const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  //       XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);

  //       // Simpan workbook sebagai file Excel
  //       XLSX.writeFile(workbook, `${title}.xlsx`);
  //       console.log(`Exported data to ${title}.xlsx`);
  //     } else {
  //       console.log("#==================Export Error: No data found");
  //     }
  //   } catch (error: any) {
  //     console.log("#==================Export Error", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // delete
  const deleteReview = async (id: string): Promise<void> => {
    await axios.delete(API_ENDPOINTS.DELETE_CONTACT(id));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReview(review.filter((product) => product.id !== id));
      console.log(`Deleted review with id: ${id}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };
  const openModal = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb and Header */}
      <div>
        <p className="text-sm text-gray-500">Pages / Reviews</p>
        <h1 className="text-4xl font-semibold mt-2">Reviews</h1>
      </div>

      {/* Search and Action Buttons on the right, with Search above Add and Export */}
      <div className="flex justify-end items-end flex-col space-y-4">
        {/* <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            className="w-full bg-[#F4F7FE] p-2 border border-gray-300 rounded-xl shadow-xl pl-10"
            placeholder="Search"
          />
          <Search
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div> */}
        <div className="flex gap-4">
          <Button variant={"outline"} onClick={() => onGetExporProduct("Review", "ReviewExport")} className="bg-[#F4F7FE] rounded-full text-gray-700 px-4 py-2 flex items-center hover:bg-gray-300" >
            <span className="mr-2">
              <Upload size={15} />
            </span>
            {loading ? "Loading..." : "Export"}
          </Button>

          {/* <button onClick={() => onGetExporProduct("Product", "ProductExport")} className="group relative h-12 overflow-hidden rounded-md bg-blue-500 px-6 text-neutral-50 transition hover:bg-blue-600">
            <span className="relative">
              {loading ? "Loading..." : "Export"}
            </span>
            <div className="animate-shine-infinite absolute inset-0 -top-[20px] flex h-[calc(100%+40px)] w-full justify-center blur-[12px]">
              <div className="relative h-full w-8 bg-white/30">
              </div>
            </div>
          </button> */}

          {/* <div>
             <button onClick={() => onGetExportProduct()}>Export to Excel</button>
             <ExportButton />
            {loading && <p>Loading...</p>}
          </div> */}

        </div>
      </div>
      {/* Table */}
      <Table className="min-w-full overflow-x-auto border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              ID
            </TableHead>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              Email
            </TableHead>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              Review
            </TableHead>
            <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {review.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="text-blue-500 text-center">
                {product.id}
              </TableCell>
              <TableCell className="text-black text-center">
                {product.email}
              </TableCell>
              <TableCell className="text-black text-center">
                {product.message}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    {/* <Button
                        className="bg-[#F13023] opacity-80 sm:w-[70px] text-white w-[50px] p-2"
                        onClick={() => handleDelete(selectedReview!.id)}>
                        <Trash2 size={15} className="sm:mr-2" />
                        <span className="hidden sm:inline text-[12px]">
                          Delete
                        </span>
                      </Button> */}
                    <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-[#F13023] opacity-80 sm:w-[70px] text-white w-[50px] p-2"
                          onClick={() => openModal(product)}>
                          <Trash2 size={15} className="sm:mr-2" />
                          <span className="hidden sm:inline text-[12px]">
                            Delete
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription className="text-black">
                          Are you sure you want to delete message <strong>{selectedReview?.message}</strong>?
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2">
                          <Button onClick={() => setIsModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-red-700 text-white" onClick={() => handleDelete(selectedReview!.id)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
