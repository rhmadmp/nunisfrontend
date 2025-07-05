// File: src/pages/category.tsx

"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ButtonAdd from "@/components/addButtonCategory";
import EditButton from "@/components/editButtonCategory";
import { Button } from "@/components/ui/button";
import { Pen, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get(API_ENDPOINTS.CATEGORIES);
  return response.data;
};

const deleteCategory = async (id: string): Promise<void> => {
  await axios.delete(API_ENDPOINTS.DELETE_CATEGORY(id));
};

export default function CategoryPage() {
  const [products, setProducts] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    const categories = await fetchCategories();
    setProducts(categories);
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setProducts(products.filter((product) => product.id !== id));
      console.log(`Deleted category with id: ${id}`);
      setIsModalOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.reason || "Failed to delete category";
        setErrorMessage(errorMessage);
      } else {
        console.error("Failed to delete category:", error);
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  const openModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  const filteredCategories = products.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-sm text-gray-500">Pages / Category</p>
        <h1 className="text-4xl font-semibold mt-2">Category</h1>
      </div>
      <div className="flex justify-end items-end flex-col space-y-4">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            className="w-full bg-[#F4F7FE] p-2 border border-gray-300 rounded-xl shadow-xl pl-10"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
        <div className="flex gap-4">
          <ButtonAdd onCategoryAdded={refreshCategories} />
        </div>
      </div>
      <Table className="min-w-full overflow-x-auto border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              ID Category
            </TableHead>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              Name
            </TableHead>
            <TableHead className="text-[13px] w-[90px] p-0 text-black text-center bg-gray-300">
              Icon
            </TableHead>
            <TableHead className="text-[13px] w-[250px] p-0 text-black text-center bg-gray-300">
              Description
            </TableHead>
            <TableHead className="text-[13px] w-[100px] p-0 text-black text-center bg-gray-300">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCategories.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="text-blue-500 text-center">
                {product.id}
              </TableCell>
              <TableCell className=" text-center">{product.name}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  {product.icon && (
                    <img
                      src={`data:image/jpeg;base64,${product.icon}`}
                      alt={product.name}
                      style={{ maxWidth: "50px", maxHeight: "50px" }}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {product.description}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <EditButton
                      category={product}
                      onCategoryEdited={refreshCategories}
                    />
                    <Button
                      className="bg-[#F13023] opacity-80 sm:w-[70px] text-white w-[50px] p-2"
                      onClick={() => openModal(product)}
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

      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-red-100 bg-opacity-75">
          <div className="bg-red-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete category {selectedCategory.name}?
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                className="bg-gray-300 text-black"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-700 text-white"
                onClick={() => handleDelete(selectedCategory.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-transparent">
          <div className="bg-red-500 p-6 rounded-lg h-[150px] w-[400px] shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Error</h2>
            <p>{errorMessage}</p>
            <div className="flex justify-end mt-4">
              <Button
                className="bg-gray-300 text-black"
                onClick={() => {
                  setErrorMessage(null);
                  setIsModalOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
