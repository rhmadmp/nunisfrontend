"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface User {
  id: string;
  nama: string;
  pictures: string;
  email: string;
  address: string;
  phone: string;
}

export default function Component() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.GET_USER, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        setUsers(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("There was an error!", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [itemsPerPage]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(API_ENDPOINTS.DELETE_USER(id), {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== id));
        setTotalPages(Math.ceil((users.length - 1) / itemsPerPage));
      } else {
        setShowAlert(true);
      }
    } catch (error) {
      console.error("There was an error!", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-6 space-y-6 bg-white shadow-md z-10">
        {/* Breadcrumb and Header */}
        <div>
          <p className="text-sm text-gray-500">Pages / Users</p>
          <h1 className="text-4xl font-semibold mt-2">Users</h1>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex justify-start flex-col items-center w-full gap-4">
          <div className="w-full">
            <Input
              type="text"
              className="w-1/2 sm:w-1/3 bg-[#F4F7FE] p-2 border border-gray-300 rounded-xl shadow-xl pl-10"
              placeholder="Search by Name or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-row w-full items-center">
            <div className="w-1/2">
              {/* Add any additional buttons here if needed */}
            </div>
            <div className="flex flex-row justify-end gap-2 w-1/2">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-[#F4F7FE] rounded-xl text-gray-700 px-4 py-2"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto">
        <Table className="min-w-full border">
          <TableHeader>
            <TableRow>
              <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
                ID User
              </TableHead>
              <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
                Pictures
              </TableHead>
              <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                Name
              </TableHead>
              <TableHead className="text-[13px] w-[250px] p-0 text-black text-center bg-gray-300 hidden md:table-cell">
                Email
              </TableHead>
              <TableHead className="text-[13px] w-[250px] p-0 text-black text-center bg-gray-300 hidden md:table-cell">
                Address
              </TableHead>
              <TableHead className="text-[13px] w-[250px] p-0 text-black text-center bg-gray-300 hidden md:table-cell">
                No Telp
              </TableHead>
              <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-blue-500 text-center">
                  {user.id}
                </TableCell>
                <TableCell className="text-black text-center">
                  {user.pictures && (
                    <Image
                      src={user.pictures}
                      alt={user.nama}
                      width={50}
                      height={50} 
                      style={{ maxWidth: "50px", maxHeight: "50px" }}
                    />
                  )}
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">
                  {user.nama}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {user.address}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {user.phone}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <Button
                        className="bg-[#F13023] opacity-80 sm:w-[70px] text-white w-[50px] p-2"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Trash2 size={15} className="sm:mr-2" />
                        <span className="hidden sm:inline text-[12px]">
                          Delete
                        </span>
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center p-2 mt-1">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
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

      {/* Confirmation Dialog */}
      {selectedUser && (
        <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
          <DialogOverlay className="fixed inset-0" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user {selectedUser.nama}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
              <Button
                className="bg-red-600 text-white"
                onClick={() => handleDelete(selectedUser.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}