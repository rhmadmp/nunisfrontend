"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ButtonAdd from "@/components/addButtonMenu";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pen, Search, Trash2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import EditButton from "@/components/editButtonMenu";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface Menu {
  kode_menu: string;
  category_id: string;
  name: string;
  image: string;
  description: string;
  price: string;
  diskon_persen: string;
  diskon_rupiah: string;
}

const fetchMenu = async (): Promise<Menu[]> => {
  const response = await axios.get(API_ENDPOINTS.MENU_ITEMS);
  return response.data;
};

const deleteMenu = async (kode_menu: string): Promise<void> => {
  await axios.delete(API_ENDPOINTS.DELETE_MENU_ITEM(kode_menu));
};

export default function Menu() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshMenu = useCallback(async () => {
    const menuItems = await fetchMenu();
    setMenu(menuItems);
    setTotalPages(Math.ceil(menuItems.length / itemsPerPage));
  }, [itemsPerPage]);

  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  const handleDelete = async (kode_menu: string) => {
    try {
      await deleteMenu(kode_menu);
      setMenu(menu.filter((product) => product.kode_menu !== kode_menu));
      console.log(`Deleted menu item with id: ${kode_menu}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const openModal = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const onGetExportProduct = async (title?: string, worksheetname?: string) => {
    try {
      setLoading(true);
      if (menu && Array.isArray(menu)) {
        const dataToExport = menu.map((pro: any) => ({
          id: pro.id,
          category_id: pro.category_id,
          name: pro.name,
          description: pro.description,
          price: pro.price
        }));
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
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

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none p-6 space-y-6 bg-white shadow-md z-10">
        <div>
          <p className="text-sm text-gray-500">Pages / Menu</p>
          <h1 className="text-4xl font-semibold mt-2">Menu</h1>
        </div>
        <div className="flex justify-start flex-col items-center w-full gap-4">
          <div className="w-full">
            <input
              type="text"
              className="w-1/3 bg-[#F4F7FE] p-2 border border-gray-300 rounded-xl shadow-xl pl-10"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-row w-full items-center">
            <div className="w-1/2">
              <ButtonAdd onMenuAdded={refreshMenu} />
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
              <Button
                variant={"outline"}
                onClick={() => onGetExportProduct("Menu", "MenuExport")}
                className="bg-[#F4F7FE] rounded-xl text-gray-700 px-4 py-2 flex items-center"
              >
                <span className="mr-2">
                  <Upload size={15} />
                </span>{" "}
                {loading ? "Loading..." : "Export"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <Table className="min-w-full border">
          <TableHeader>
            <TableRow>
              <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
                ID Menu
              </TableHead>
              <TableHead className="text-[11px] w-[90px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                ID Category
              </TableHead>
              <TableHead className="text-[11px] w-[90px] p-0 text-black text-center bg-gray-300">
                Name
              </TableHead>
              <TableHead className="text-[11px] w-[90px] p-0 text-black text-center bg-gray-300 hidden sm:table-cell">
                Pictures
              </TableHead>
              <TableHead className="text-[11px] w-[250px] p-0 text-black text-center bg-gray-300 hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="text-[11px] w-[90px] p-0 text-black text-center bg-gray-300 hidden md:table-cell">
                Price
              </TableHead>
              <TableHead className="text-[11px] w-[100px] p-0 text-black text-center bg-gray-300">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((product) => (
              <TableRow key={product.kode_menu}>
                <TableCell className="text-blue-500">{product.kode_menu}</TableCell>
                <TableCell className="text-blue-500 hidden sm:table-cell">
                  {product.category_id}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {product.image && (
                    <Image
                      src={`data:image/jpeg;base64,${product.image}`}
                      alt={product.name}
                      width={50}
                      height={50}
                      style={{ maxWidth: "50px", maxHeight: "50px" }}
                    />
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.description}
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  Rp {product.price}
                </TableCell>
                <TableCell>
                  <div className="flex center flex-col gap-2 sm:flex-row">
                    <EditButton menu={product} onMenuEdited={refreshMenu} />
                    <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-[#F13023] sm:opacity-80 sm:w-[70px] text-white w-[50px] p-2"
                          onClick={() => openModal(product)}
                        >
                          <Trash2 size={15} className="sm:mr-2" />
                          <span className="hidden sm:inline text-[12px]">
                            Delete
                          </span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription className="text-black">
                          Are you sure you want to delete menu item <strong>{selectedMenu?.name}</strong>?
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2">
                          <Button onClick={() => setIsModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-red-700 text-white" onClick={() => handleDelete(selectedMenu!.kode_menu)}>
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center p-2 mt-1">
          <div>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMenu.length)} of {filteredMenu.length} entries
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