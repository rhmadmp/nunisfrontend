import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Pen } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import axios from "axios";
import { AspectRatio } from "./ui/aspect-ratio";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface EditButtonProps {
  menu: {
    kode_menu: string;
    category_id: string;
    name: string;
    image: string;
    description: string;
    price: string;
    diskon_persen: string;
    diskon_rupiah: string;
  };
  onMenuEdited: () => void;
}

export default function EditButton({ menu, onMenuEdited }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(menu);

  useEffect(() => {
    setFormData(menu);
  }, [menu]);

  const EditMenuForm = ({ className }: React.ComponentProps<"form">) => {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(formData.category_id);
    const [price, setPrice] = useState(formData.price);
    const [discountPercent, setDiscountPercent] = useState(formData.diskon_persen || "");
    const [discountAmount, setDiscountAmount] = useState(formData.diskon_rupiah || "");
    const [discountPercentError, setDiscountPercentError] = useState<string | null>(null);
    const [discountAmountError, setDiscountAmountError] = useState<string | null>(null);

    useEffect(() => {
      setPrice(formData.price);
      setDiscountPercent(formData.diskon_persen || "");
      setDiscountAmount(formData.diskon_rupiah || "");
      setSelectedCategoryId(formData.category_id);
    }, [formData]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, "");
          setBase64Image(base64WithoutPrefix);
          setImagePreview(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
      }
    };

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPrice(e.target.value);
      setDiscountPercent("");
      setDiscountAmount("");
      setDiscountPercentError(null);
      setDiscountAmountError(null);
    };

    const handleDiscountPercentChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (parseInt(value) > 100) {
        setDiscountPercentError("Discount percent cannot exceed 100%");
        setDiscountPercent("100");
      } else {
        setDiscountPercent(value);
        setDiscountPercentError(null);
        if (price && value) {
          const discount = (parseInt(price) * parseInt(value)) / 100;
          setDiscountAmount(discount.toFixed(2));
        }
      }
    };
    
    const handleDiscountAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (price && parseInt(value) > parseInt(price)) {
        setDiscountAmountError("Discount amount cannot exceed the price");
        setDiscountAmount(price);
      } else {
        setDiscountAmount(value);
        setDiscountAmountError(null);
        if (price && value) {
          const discount = (parseInt(value) / parseInt(price)) * 100;
          setDiscountPercent(discount.toFixed(2));
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    useEffect(() => {
      fetchCategories();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      const formData = new FormData(event.currentTarget);
      formData.delete("image");
      if (base64Image) {
        formData.append("image", base64Image);
      }
      
      try {
        const response = await axios.post(
          API_ENDPOINTS.EDIT_MENU,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Menu item updated successfully:", response.data);
        setOpen(false);
        onMenuEdited();
      } catch (error) {
        console.error("Error updating menu item:", error);
        setError("Failed to update menu item. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn("flex flex-row gap-4 w-full", className)}>
        <div className="w-1/3">
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="kode_menu">Kode Menu</Label>
              <Input
                id="kode_menu"
                name="kode_menu"
                defaultValue={formData.kode_menu}
                className="rounded-xl"
                placeholder="ID of Menu"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select
                name="category_id"
                value={selectedCategoryId}
                onValueChange={(value) => setSelectedCategoryId(value)}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue>
                    {selectedCategoryId ? `${selectedCategoryId}` : "Select a category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.id} : {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={formData.name}
                className="rounded-xl"
                placeholder="Name of Menu"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                value={price}
                onChange={handlePriceChange}
                className="rounded-xl"
                placeholder="Price of Menu"
              />
            </div>
            <div>
              <Label htmlFor="diskon_persen">Diskon Persen</Label>
              <Input
                id="diskon_persen"
                name="diskon_persen"
                value={discountPercent}
                onChange={handleDiscountPercentChange}
                className="rounded-xl"
                placeholder="Diskon Persen"
              />
              {discountPercentError && <p className="text-red-500">{discountPercentError}</p>}
            </div>
            <div>
              <Label htmlFor="diskon_rupiah">Diskon Rupiah</Label>
              <Input
                id="diskon_rupiah"
                name="diskon_rupiah"
                value={discountAmount}
                onChange={handleDiscountAmountChange}
                className="rounded-xl"
                placeholder="Diskon Rupiah"
              />
              {discountAmountError && <p className="text-red-500">{discountAmountError}</p>}
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex flex-col gap-2 w-full">
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                className="rounded-xl w-full"
                placeholder="Upload Image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.image && !imagePreview && (
                <div className="w-full h-[155px] p-3 bg-white mt-2 rounded-xl justify-center items-center flex border border-gray-400">
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    <Image
                      className="rounded-xl"
                      fill
                      src={`data:image/jpeg;base64,${formData.image}`}
                      alt="Current"
                    />
                  </AspectRatio>
                </div>
              )}
              {imagePreview && (
                <div className="w-full h-[155px] p-3 bg-white mt-2 rounded-xl justify-center items-center flex border border-gray-400">
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    <Image
                      className="rounded-xl"
                      fill
                      src={imagePreview}
                      alt="Preview"
                    />
                  </AspectRatio>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={formData.description}
              className="rounded-xl h-[190px] resize-none"
              placeholder="Description of Menu"
            />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    );
  };

  const Content = ({ children }: { children: React.ReactNode }) => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Edit Menu</DialogTitle>
      </DialogHeader>
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[50px] p-2">
            <Pen className="sm:mr-2" size={12} />
            <span className="hidden sm:inline text-[12px]">Edit</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] sm:max-h-[700px] bg-white">
          <Content>
            <EditMenuForm />
          </Content>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[50px] p-2">
          <Pen className="sm:mr-2" size={12} />
          <span className="hidden sm:inline text-[12px]">Edit</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Menu</DrawerTitle>
        </DrawerHeader>
        <Content>
          <EditMenuForm className="px-4" />
        </Content>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}