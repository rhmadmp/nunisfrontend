"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Check, Key } from 'lucide-react';
import {formatCurrency} from "../menu/formatCurrency";
import axios from 'axios';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import usePrintInvoice from '../menu/ExportPdf';
import QRCode from 'qrcode.react';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import { motion } from 'framer-motion';
import ZoomIn from '@/components/animation/zoomIn';

interface DetailItem {
  kode_menu: string;
  jumlah: number;
  total: number;
  menu_name: string;
  image: string;
  subtotal: number;
}

interface Transaction {
  faktur: string;
  id_user: number;
  no_telepon: string;
  alamat: string;
  tanggal: string;
  total: number;
  sub_total: number;
  diskon_rupiah: number;
  details: DetailItem[];
  main_item: DetailItem;
  other_items_count: number;
}

interface User {
  id: number;
  email: string;
  nama: string;
  address: string;
  phone: number;
  pictures: string;
}

const SkeletonLoader = () => (
  <Card className='w-full'>
    <CardContent className="w-full flex p-4 bg-gray-50 rounded-lg items-center border-[1px]">
      <Skeleton className="w-[75px] h-[75px] rounded-md mr-4" />
      <div className="flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="text-right">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedHistory, setSelectedProduct] = useState<Transaction | null>(null);
  const { documentRef, handlePrint } = usePrintInvoice();


  const fetchData = async (start?: string, end?: string) => {
    setIsLoading(true);
    setError(null);
    const userinfo = localStorage.getItem("user-info");
    let email = userinfo ? userinfo.replace(/["]/g, "") : "";
    if (!email) {
      setError("Email tidak ditemukan di localStorage");
      setIsLoading(false);
      return;
    }

    try {
      const userResponse = await axios.get(
        API_ENDPOINTS.USER(email)
      );
      setUserData(userResponse.data);

      if (userResponse.data && userResponse.data.id) {
        let url = API_ENDPOINTS.TRANSAKSI_WITH_DETAILS(userResponse.data.id);
        if (start) url += `?start_date=${start}`;
        if (end) url += `${start ? '&' : '?'}end_date=${end}`;

        const transactionResponse = await axios.get(url);
        setHistoryData(transactionResponse.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data", err);
      setError("Gagal mengambil data. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    if (startDate && !endDate) {
      fetchData(startDate, startDate);
    } else if (!startDate && endDate) {
      fetchData(endDate, endDate);
    } else {
      fetchData(startDate, endDate);
    }
  };

  const isFilterDisabled = !startDate && !endDate;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className='flex flex-col items-center w-full mb-10'>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-1 w-24" />
        </div>
        <div className="space-y-4 w-full">
          {[...Array(5)].map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  const handleDetailClick = (product: Transaction) => {
    setSelectedProduct(product);
  };

  const qrCodeData = selectedHistory
    ? JSON.stringify({
      user: userData?.nama,
      phone: selectedHistory.no_telepon,
      address: selectedHistory.alamat,
      invoiceId: selectedHistory.faktur,
      invoiceItems: selectedHistory.details.map(item => ({
        kode_menu: item.kode_menu,
        jumlah: item.jumlah,
        total: item.total,
        menu_name: item.menu_name,
        subtotal: item.subtotal,
      })) || [],
      subTotal: selectedHistory.sub_total,
      discount: selectedHistory.diskon_rupiah,
      total: selectedHistory.total,
    })
    : '';



  return (
    <div className="container mx-auto p-4">
      <ZoomIn>
        <div className='flex flex-col items-center w-full mb-10'>
          <h1>Riwayat</h1>
          <div className="underline" style={{ width: '100px', height: '4px', background: '#61AB5B', margin: '2px' }}></div>
        </div>
      </ZoomIn>
      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='mb-2 flex gap-2 sm:w-full w-1/2'>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Tanggal Awal"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Tanggal Akhir"
          />
        </div>
        <Button
          variant={'outline'}
          onClick={handleFilter}
          disabled={isFilterDisabled}
          className='bg-[#61AB5B] rounded-3xl w-1/4 flex-row mb-2'
        >
          Filter
        </Button>
      </div>
      <div className="space-y-4 w-full ">
        {historyData.length > 0 ? (
          historyData.map((item, index) => (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: index * 0.2 }} key={index}>
              <Card key={item.faktur} className='w-full flex bg-slate-400' >
                <CardContent className="w-full flex p-4 bg-gray-50 hover:bg-gray-100 rounded-lg items-center border-[1px] border-[#54844F]">
                  <div className='w-[75px] h-[75px] mr-2 mb-2'>
                    <AspectRatio ratio={1 / 1} className='bg-muted'>
                      {item.main_item && item.main_item.image ? (
                        <Image
                          src={`data:image/jpeg;base64,${item.main_item.image}`}
                          alt={item.main_item?.menu_name ? item.main_item.menu_name : "Menu"}
                          fill
                          className="rounded-md mr-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md mr-4">
                          <span className="text-gray-400 text-xs">Tidak ada gambar</span>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-semibold">
                      {item.main_item?.menu_name}
                      {item.other_items_count > 0 && ` and ${item.other_items_count} other${item.other_items_count > 1 ? 's' : ''}`}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{item.tanggal}</p>
                    <div className='flex flex-row '>
                      <Check className='p-1 h-5 w-5 mr-1 flex-wrap bg-[#369A2E] text-white rounded-full ' />
                      <p>Order Completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp {item.total.toLocaleString()}</p>
                    <Dialog>
                      <DialogTrigger>
                        <Button variant="outline" className="mt-2 rounded-3xl bg-[#369A2E] border-[2px] border-[#369A2E] hover:bg-white text-gray-50 hover:text-[#369A2E]" onClick={() => handleDetailClick(item)}>
                          Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent ref={documentRef}>
                        <DialogHeader>
                          <DialogTitle>Invoice</DialogTitle>
                          <DialogDescription />
                          <div className="p-1 sm:w-full">
                            <div className='flex'>
                              <div className='flex flex-col w-1/2 gap-2 text-start'>
                                <label>www.nunis.id</label>
                                <label>nunis@gmail.com</label>
                                <label>085217645464</label>
                              </div>
                              <div className='flex w-1/2'>
                                <div className='flex flex-row align-items-end justify-end w-full'>
                                  <div className='flex flex-col text-end'>
                                    <h4 className='text-[#61AB5B]'>Nunis Warung & Koffie</h4>
                                    <label>Jl. Raya Trenggalek - Ponorogo No.Km.7, RT.17/RW.4, Setono, Kec. Tugu, Kabupaten Trenggalek, Jawa Timur 66352</label>
                                    <label>TAX 1982323272832280</label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 p-3 outline bg-light shadow-lg rounded-lg bg-gray-100">
                              <div className="flex flex-row align-items-start justify-content-between">

                                <div className="flex flex-col align-items-start w-auto">
                                  <h5>Bill To</h5>
                                  <label>Id : {userData?.nama} </label>
                                  <label>No.Telp : {selectedHistory?.no_telepon}</label>
                                  <label>Alamat : {selectedHistory?.alamat}</label>
                                </div>
                                <div className="flex flex-col align-items-end">
                                  <h6>Invoice of IDR</h6>
                                  <h6>{formatCurrency(selectedHistory?.total || 0)}</h6>
                                </div>
                              </div>
                              <div className="flex flex-row align-items-center justify-content-between mt-3">
                                <div className="flex flex-col align-items-start w-auto">
                                  <h5>Tanggal Invoice</h5>
                                  <label>{selectedHistory?.tanggal}</label>
                                </div>
                                <div className="flex flex-col align-items-end">
                                  <h5>Nomor Invoice</h5>
                                  <label>{selectedHistory?.faktur}</label>
                                </div>
                              </div>
                              <hr />
                              <div className="flex flex-row align-items-center justify-content-between mt-3">
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Detail Item</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Jumlah</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Harga Satuan</b>
                                </div>
                                <div className="flex flex-col align-items-center w-1/4">
                                  <b>Total</b>
                                </div>
                              </div>
                              <hr />
                              <div className="h-[100px] overflow-auto invoice-data">
                                {selectedHistory?.details.map((item, index) => (
                                  <div className="flex flex-row align-items-center mt-3" key={index}>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{item.menu_name}</label>
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{item.jumlah}</label>
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{formatCurrency(item.subtotal / item.jumlah)}</label>
                                      {/* <label>{item.subtotal / item.jumlah}</label> */}
                                    </div>
                                    <div className="flex flex-col align-items-center w-1/4">
                                      <label>{formatCurrency(item.subtotal)}</label>
                                      {/* <label>{item.total}</label> */}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <hr />
                              <div className="flex">
                                <div className="flex w-1/2">
                                  <QRCode value={qrCodeData} />
                                </div>
                                <div className="flex flex-col w-1/2">
                                  <div className="flex align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>Subtotal</label>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>{formatCurrency(selectedHistory?.sub_total || 0)}</label>
                                    </div>
                                  </div>
                                  <div className="flex flex-row align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>Diskon</label>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label>{formatCurrency(selectedHistory?.diskon_rupiah || 0)}</label>
                                    </div>
                                  </div>
                                  <div className="flex flex-row justify-end">
                                    <hr className="w-3/4" />
                                  </div>
                                  <div className="flex flex-row align-items-center justify-content-between">
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <b>Total</b>
                                    </div>
                                    <div className="flex flex-col align-items-end w-1/2">
                                      <label><b>{formatCurrency(selectedHistory?.total || 0)}</b></label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogHeader>
                        <DialogFooter className="d-print-none">
                          <Button onClick={handlePrint} className="bg-[#61AB5B] text-white"><b>Export PDF</b></Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p>Tidak ada riwayat transaksi.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;