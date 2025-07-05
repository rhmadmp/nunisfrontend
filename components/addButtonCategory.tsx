import React, { ChangeEvent, useState } from "react";
import axios from "axios";
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
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { log } from "console";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface ButtonAddProps {
  onCategoryAdded: () => void;
}

export default function ButtonAdd({ onCategoryAdded }: ButtonAddProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const AddCategoryForm = ({ className }: React.ComponentProps<"form">) => {
    const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the prefix from the base64 string
        const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, '');
        setBase64Image(base64WithoutPrefix);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.delete('icon');

    // Add the base64 image string if it exists
    if (base64Image) {
      formData.append('icon', base64Image);
    }
    // fo
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    try {
      const response = await axios.post(API_ENDPOINTS.ADD_CATEGORY,formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Category added successfully:', response.data);
      setOpen(false);
      onCategoryAdded();
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
    return (
      <form onSubmit={handleSubmit} className={cn("grid items-start gap-4 w-full", className)}>
        <div className="flex flex-row w-full gap-2">
          <div className="flex flex-col w-1/2">
            <div className="grid gap-2">
              <Label htmlFor="id">Category ID</Label>
              <Input name="id" type="text" id="id" className="rounded-xl" placeholder="G-21 Category" required />
            </div>
            <div className="h-full mt-2">
              <Label className="w-full mb-2 h-fit" htmlFor="description">Description</Label>
              <Textarea
                name="description"
                className="rounded-xl h-[217px] resize-none"
                id="description"
                placeholder="Description of Category"
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input name="name" id="name" className="rounded-xl" placeholder="Name of Category" required />
            </div>
            <div className="mt-2">
              <Label
                htmlFor="icon">
                Gambar
              </Label>
              <Input name="icon" id="icon"  onChangeCapture={handleFileChange} className=" mt-1 rounded-xl" type="file" accept="image/*" required />
              <div className="w-[300px] h-[180px] mt-2 rounded-xl p-3 border-[1px] bg-white">
                <AspectRatio ratio={16 / 9}  className="rounded-xl">
                <Image
                    className="rounded-xl "
                    fill
                    src={imagePreview}
                    alt="Preview"
                  />
                </AspectRatio>
              </div>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4 mt-4">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </form>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Add Category</DialogTitle>
      </DialogHeader>
      <AddCategoryForm />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-[#F4F7FE] text-black rounded-full hover:bg-gray-300">
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] sm:max--[500px] bg-[#F4F7FE]">
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="bg-[#F4F7FE] text-black rounded-full hover:bg-gray-300">
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Category</DrawerTitle>
        </DrawerHeader>
        <Content />
      </DrawerContent>
    </Drawer>
  );
}