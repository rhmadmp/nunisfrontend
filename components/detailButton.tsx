import React, { useEffect, useState } from "react";
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
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import axios from "axios";

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
  user: User;
  no_telepon: string;
  alamat: string;
  item: string;
  sub_total:number; // JSON string
  tanggal: string;
  total: number;
  diskon_persen: number;
  diskon_rupiah: number;
  detail_penjualan: Item[];
}

interface ButtonDetailProps {
  itemmu: Transaksi;
}

export default function ButtonDetail({ itemmu }: ButtonDetailProps) {
  const [open, setOpen] = useState(false);
  const [item, setItems] = useState<Transaksi[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Set items from itemmu when the component mounts or itemmu changes
  useEffect(() => {
    setItems([itemmu]);
  }, [itemmu]);

  function formatCurrency(value: number) {
    return value
      .toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace("Rp", "Rp.")
      .trim();
  }

  const AddDetailForm = ({ className }: React.ComponentProps<"form">) => {
    return (
      <div className={cn("grid items-start gap-4 w-full", className)}>
        <div className="flex flex-row w-full gap-2">
          <div className="flex flex-col w-1/2 ">
            <div>
              <Label htmlFor="id">Order Id</Label>
              <p className="border p-2 rounded">{itemmu.faktur}</p>
            </div>
            <div>
              <Label htmlFor="">Orderer's Name</Label>
              <p className="border p-2 rounded">{itemmu.user.nama}</p>
            </div>
            <div className="h-full">
              <Label htmlFor="">Items</Label>
              <div className="border h-[100px] p-2 rounded overflow-auto">
                <p>Pesanan : </p>
                {itemmu.detail_penjualan.map((items) => (
                  <div key={items.id} className="mb-2 p-2 border-b-4">
                    <p>
                      {items.name} x {items.jumlah} ={" "}
                      {formatCurrency(items.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
            <Label htmlFor="">Sub Total</Label>
              <p className="border p-2 rounded">Rp. {itemmu.total}</p>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
          <div>
              <Label htmlFor="">Discount</Label>
              <p className="border p-2 rounded">
                Rp. {itemmu.sub_total.toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="">Total</Label>
              <p className="border p-2 rounded">
                Rp. {itemmu.total.toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="">Address</Label>
              <p className="border p-2 rounded">{itemmu.user.address}</p>
            </div>
            <div>
              <Label htmlFor="">Phone Number</Label>
              <p className="border p-2 rounded">{itemmu.user.phone}</p>
            </div>
            <div>
              <Label htmlFor="">Date</Label>
              <p className="border p-2 rounded">
                {new Date(itemmu.tanggal).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  const Content = () => (
    <div className="grid gap-4 py-4">
      <DialogTitle className="text-2xl">Detail Transaction</DialogTitle>
      <AddDetailForm />
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#4ED4F1] w-[70px] text-white cursor-pointer rounded-full h-[20px] text-[12px]">
            Detail
          </Button>
        </DialogTrigger>
        <DialogContent className=" sm:max-w-[919px] sm:max-h-[704px] bg-[#F4F7FE]">
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-[#4ED4F1] w-[70px] text-white cursor-pointer rounded-full h-[20px] text-[12px]">
          Detail
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Detail Transaction</DrawerTitle>
        </DrawerHeader>
        <Content />
      </DrawerContent>
    </Drawer>
  );
}
