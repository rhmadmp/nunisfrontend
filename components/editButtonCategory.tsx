// File: src/components/EditButtonCategory.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Pen} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';

interface EditButtonProps {
  category: {
    id: string;
    name: string;
    icon: string | null;
    description: string;
  };
  onCategoryEdited: () => void;
}

export default function EditButton({ category, onCategoryEdited }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
  });


  useEffect(() => {
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
    });
  }, [category]);

  const EditCategoryForm = ({ className }: React.ComponentProps<'form'>) => {
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
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
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      const form = new FormData(event.currentTarget);
      form.delete("icon");
      if (base64Image) {
        form.append("icon", base64Image);
      }
      try {
        const response = await axios.post(API_ENDPOINTS.EDIT_CATEGORY, form);
        console.log('Category edited successfully:', response.data);
        setOpen(false);
        onCategoryEdited(); // Call the function to refresh the category list
      } catch (error) {
        console.error('Error editing category:', error);
        setError('Failed to edit category. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className={cn('grid items-start gap-4 w-full', className)}>
        <div className="flex flex-row w-full gap-2">
          <div className="flex flex-col w-1/2">
            <div className="grid gap-2">
              <Label htmlFor="id">Category ID</Label>
              <Input name="id" type="text" id="id" className="rounded-xl" value={formData.id} readOnly />
            </div>
            <div className="h-full mt-2">
              <Label className="w-full mb-2 h-fit" htmlFor="description">Description</Label>
              <Textarea
                name="description"
                className="rounded-xl h-full"
                id="description"
                placeholder="Description of Category"
                defaultValue={formData.description}
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2">
          <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input name="name" defaultValue={formData.name} id="name" className="rounded-xl" placeholder="Name of Category" />
            </div>
            <div className="mt-2">
              <Label
                htmlFor="icon">
                Gambar
              </Label>
              <Input name="icon" id="icon"  onChangeCapture={handleFileChange} className=" mt-1 rounded-xl" type="file" accept="image/*"/>
              {formData.icon && !imagePreview && (
                  <div className="w-[300px] h-[180px] mt-2 rounded-xl p-3 border-[1px] bg-white">
                    <AspectRatio ratio={16 / 9} className="rounded-xl">
                      <Image
                        className="rounded-xl"
                        fill
                        src={`data:image/jpeg;base64,${formData.icon}`}
                        alt="Current"
                      />
                    </AspectRatio>
                  </div>
                )}
                {imagePreview && (
                  <div className="w-[300px] h-[180px] mt-2 rounded-xl p-3 border-[1px] bg-white">
                    <AspectRatio ratio={16 / 9} className="rounded-xl">
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
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4 mt-4">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Editing...' : 'Edit'}
          </Button>
        </div>
      </form>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
      </DialogHeader>
      <EditCategoryForm />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button className="bg-[#2B3674] sm:mr-3 mb-2 sm:opacity-75 sm:w-[70px] text-white w-[50px] p-2">
            <Pen className="sm:mr-2" size={12} />
            <span className="hidden sm:inline text-[12px]">Edit</span>
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] sm:max--[500px] bg-[#F4F7FE]">
        <Content />
      </DialogContent>
    </Dialog>
  );
}
