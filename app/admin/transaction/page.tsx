"use client";

import React, { useEffect, useState } from "react";
import { Search, Upload, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ButtonDetail from "@/components/detailButton";
import axios from "axios";
import { BreadcrumbSkeleton, SearchSkeleton, ActionButtonSkeleton, TableSkeleton } from "@/components/Skeletons";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface User {
  id: string;
  nama: string;
  pictures: string;
  email: string;
  address: string;
  phone: string;
}
interface Item {
  id: number;
  name: string;
  faktur: string;
  kode_menu: string;
  jumlah: number;
  subtotal: number;
  total: number;
  diskon_persen: string;
  diskon_rupiah: string;
}
interface Transaksi {
  faktur: string;
  sub_total:number;
  user: User;
  no_telepon: string;
  alamat: string;
  item: string; // JSON string
  tanggal: string;
  total: number;
  diskon_persen: number;
  diskon_rupiah: number;
  detail_penjualan: Item[];
}

export default function TransactionPage() {
  const [products, setProducts] = useState<Transaksi[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [items,setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function fetchTransaksi() {
      try {
        const response = await axios.get(API_ENDPOINTS.ALL_TRANSAKSI);
        setProducts(response.data);
        setFilteredProducts(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching transaksi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransaksi();
  }, [itemsPerPage]);

  useEffect(() => {
    filterProducts();
  }, [startDate, endDate, products, itemsPerPage, searchTerm]);

  const filterProducts = () => {
    let filtered = products;
    if (startDate && endDate) {
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.tanggal);
        return productDate >= new Date(startDate) && productDate <= new Date(endDate);
      });
    } else if (startDate) {
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.tanggal);
        const filterDate = new Date(startDate);
        return (
          productDate.getFullYear() === filterDate.getFullYear() &&
          productDate.getMonth() === filterDate.getMonth() &&
          productDate.getDate() === filterDate.getDate()
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.faktur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.alamat.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (new Date(e.target.value) > new Date(endDate)) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-6 space-y-6 bg-white shadow-md z-10">
        {/* Breadcrumb and Header */}
        {loading ? (
          <BreadcrumbSkeleton />
        ) : (
          <div>
            <p className="text-sm text-gray-500">Pages / Transaction</p>
            <h1 className="text-4xl font-semibold mt-2">Transaction</h1>
          </div>
        )}

        {/* Search, Filter, and Action Buttons */}
        <div className="flex justify-start flex-col items-center w-full gap-4">
          {loading ? (
            <SearchSkeleton/>
          ) : (
            <div className="w-full">
              <input
                type="text"
                className="w-1/3 bg-[#F4F7FE] p-2 border border-gray-300 rounded-xl shadow-xl pl-10"
                placeholder="Search by ID Order, Name, or Address"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          )}
          {loading ? (
            <ActionButtonSkeleton />
          ) : (
            <div className="flex flex-row w-full items-center">
              <div className="w-1/2">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-gray-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="bg-[#F4F7FE] rounded-2xl text-gray-700 px-4 py-2"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate}
                    className="bg-[#F4F7FE] rounded-xl text-gray-700 px-4 py-2"
                  />
                  <Button onClick={clearDateFilter} className="bg-[#F4F7FE] rounded-xl text-gray-700">
                    Clear
                  </Button>
                </div>
              </div>
              <div className="flex flex-row justify-end gap-2  w-1/2">
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="bg-[#F4F7FE] rounded-xl text-gray-700 px-4 py-2"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <Button className="bg-[#F4F7FE] rounded-xl text-gray-700 px-4 py-2 flex items-center">
                  <span className="mr-2">
                    <Upload size={15} />
                  </span>{" "}
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <Table className="min-w-full border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
                    ID Order
                  </TableHead>
                  <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
                    Name
                  </TableHead>
                  <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Discount %
                  </TableHead>
                  <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Discount
                  </TableHead>
                  <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Sub Total
                  </TableHead>
                  <TableHead className="text-[13px] w-[150px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Total
                  </TableHead>
                  <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300">
                    Detail
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((product) => (
                  <TableRow key={product.faktur}>
                    <TableCell className="text-blue-500 text-[12px] text-center">
                      {product.faktur}
                    </TableCell>
                    <TableCell className="text-blue-500 text-[12px] text-center">
                      {product.user.nama}
                    </TableCell>
                    <TableCell className="text-center hidden text-[12px] md:table-cell">
                      {product.diskon_persen}%
                    </TableCell>
                    <TableCell className="text-center hidden text-[12px] md:table-cell">
                      Rp. {product.diskon_rupiah}
                    </TableCell>
                    <TableCell className="text-center text-[12px] hidden md:table-cell">
                      Rp. {product.sub_total}
                    </TableCell>
                    <TableCell className="text-center hidden text-[12px] md:table-cell">
                      Rp. {product.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-[12px] hidden md:table-cell">
                      {new Date(product.tanggal).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <ButtonDetail itemmu={product}/>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
        <div className="flex justify-between items-center p-2 mt-1">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-[#F4F7FE] text-gray-700"
            >
              <ChevronLeft size={20} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-[#F4F7FE] text-gray-700'
                }`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-[#F4F7FE] text-gray-700"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
