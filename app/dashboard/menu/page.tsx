"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash, X } from "lucide-react";
import { Badge } from 'primereact/badge';
import ProductCard from "../menu/ProductCard";
import QRCode from 'qrcode.react';
import { formatCurrency } from "./formatCurrency";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import usePrintInvoice from "./ExportPdf";
import MenuSkeleton from "../../skeleton/MenuSkeleton";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { motion } from 'framer-motion';
import ZoomIn from "@/components/animation/zoomIn";
import SlideInRight from "@/components/animation/slideInRight";

interface Menu {
    kode_menu: string;
    category_id: string;
    name: string;
    image: string;
    description: string;
    price: number;
    diskon_persen: number;
    diskon_rupiah: number;
}
interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
}
interface Cart {
    kode_menu: string;
    name: string;
    image: string;
    count: number;
    price: number;
    discount: number;
    totalDiscount: number;
    totalPrice: number;
}

export default function Menu() {
    const [allMenu, setAllMenu] = useState<Menu[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menu, setMenu] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(false);
    const [Isloading, setIsLoading] = useState(false);
    const [cart, setCart] = useState<Cart[]>([]);
    const [userData, setUserData] = useState<any>(null);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Menu | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [notification, setNotification] = useState<string | null>(null);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const currentDate = getCurrentDate();

    const { documentRef, handlePrint } = usePrintInvoice();
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const handleSearch = async () => {
        if (searchTerm.trim() !== '') {
            const searchedMenu = allMenu.filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setMenu(searchedMenu);
            setHasMore(false);
        }
    };
    const handleInput = (e: any) => {
        setSearchTerm(e.target.value);
    };
    useEffect(() => {
        const fetchUserData = async () => {
            const userinfo = localStorage.getItem("user-info");
            let email = userinfo ? userinfo.replace(/["]/g, "") : "";
            if (!email) {
                // setError("Email tidak ditemukan di localStorage");
                return;
            }
            try {
                const response = await axios.get(
                    API_ENDPOINTS.USER(email)
                );
                setUserData(response.data);
            } catch (err) {
                // setError("Gagal mengambil data user");
                console.error(err);
            }
        };

        fetchUserData();
    }, []);

    const refreshCategories = useCallback(async () => {
        const categories = await fetchCategories();
        setCategories(categories);
    }, []);

    const refreshMenu = useCallback(async (categoryId: string) => {
        const allMenuItems = await fetchMenuByCategory(categoryId);
        setAllMenu(allMenuItems);
        setMenu(allMenuItems.slice(0, 50));
        setHasMore(allMenuItems.length > 50);
    }, []);

    const refreshAllMenu = useCallback(async () => {
        const allMenuItems = await fetchAllMenu();
        setAllMenu(allMenuItems);
        setMenu(allMenuItems.slice(0, 50));
        setHasMore(allMenuItems.length > 50);
    }, []);

    useEffect(() => {
        refreshCategories();
    }, [refreshCategories]);

    useEffect(() => {
        if (selectedCategory) {
            refreshMenu(selectedCategory);
        } else {
            refreshAllMenu();
        }
    }, [selectedCategory, refreshMenu, refreshAllMenu]);

    const observer = useRef<IntersectionObserver>();

    const lastMenuElementRef = useCallback(
        (node: any) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    useEffect(() => {
        const loadAllMenu = async () => {
            try {
                if (selectedCategory) {
                    const menuItems = await fetchMenuByCategory(selectedCategory);
                    setAllMenu(menuItems);
                    setMenu(menuItems.slice(0, 50));
                    setHasMore(menuItems.length > 50);
                } else {
                    const allMenuItems = await fetchAllMenu();
                    setAllMenu(allMenuItems);
                    setMenu(allMenuItems.slice(0, 50));
                    setHasMore(allMenuItems.length > 50);
                }
            } catch (error) {
                console.error('Error fetching menu items:', error);
            }
            setLoading(false);
        };
        loadAllMenu();
    }, [selectedCategory]);


    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
    };
    const handleAddClick = (product: Menu) => {
        setSelectedProduct(product);
    };

    const handleAddToCart = (product: any, quantity: number, discount: number, totalPrice: number, totalDiscount: number) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.kode_menu === product.kode_menu);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.kode_menu === product.kode_menu ? { ...item, count: item.count + quantity, discount: item.discount, totalPrice: item.totalPrice + totalPrice, totalDiscount: item.totalDiscount + discount } : item
                );

            } else {
                return [...prevCart, { ...product, count: quantity, discount: discount, totalPrice: totalPrice, totalDiscount: totalDiscount }];
            }
        });
    };

    const filteredMenu = menu.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            setNotification('Keranjang belanja kosong. Silakan tambahkan produk terlebih dahulu.');
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => setNotification(null), 1000);
        const subTotal = cart.reduce((total, item) => total + item.price * item.count, 0);
        const totalAfterDiscount = cart.reduce((total, item) => total + item.totalDiscount, 0);
        const diskonRupiah = subTotal - totalAfterDiscount
        const diskonPersen = (diskonRupiah / subTotal) * 100;
        try {
            const transactionData = {
                id_user: userData.id,
                no_telepon: userData.phone,
                alamat: userData.address,
                sub_total: subTotal,
                total: totalAfterDiscount,
                diskon_persen: diskonPersen,
                diskon_rupiah: diskonRupiah,
                items: cart.map(item => ({
                    kode_menu: item.kode_menu,
                    name: item.name,
                    diskon_rupiah_item: item.totalPrice - item.totalDiscount,
                    diskon_persen_item: ((item.totalPrice - item.totalDiscount) / item.totalPrice) * 100.00,
                    count: item.count,
                    sub_total_item: item.totalPrice,
                    total_item: item.totalDiscount
                }))
            };

            const response = await axios.post(API_ENDPOINTS.TRANSAKSI, transactionData);
            // console.log(response.data);
            console.log(transactionData);
            setCart([]);
            setInvoiceData(transactionData);
            setIsDialogOpen(true);
            setIsLoading(false);
        } catch (error: any) {
            console.error(error);
            let errorMessage = 'Terjadi kesalahan saat membuat pesanan.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join(', ');
            }
            setNotification(errorMessage);
            setTimeout(() => setNotification(null), 3000);
            setIsLoading(false);
        }
    };

    const handleIncrement = (index: any) => {
        const newCart = [...cart];
        newCart[index].count += 1;
        newCart[index].totalPrice = newCart[index].count * newCart[index].price;
        newCart[index].totalDiscount = newCart[index].count * newCart[index].discount;
        setCart(newCart);
    };

    const handleDecrement = (index: any) => {
        const newCart = [...cart];
        if (newCart[index].count >= 0) {
            newCart[index].count -= 1;
            newCart[index].totalPrice = newCart[index].count * newCart[index].price;
            newCart[index].totalDiscount = newCart[index].count * newCart[index].discount;
            setCart(newCart);
        }
    };


    const handleInputChange = (event: any, index: any) => {
        const inputValue = event.target.value;
        let newCount = inputValue === '' ? 0 : parseInt(inputValue, 10);
        const newCart = [...cart];
        if (newCount >= 0) {
            newCart[index].count = newCount;
            newCart[index].totalPrice = newCount * newCart[index].price;
            newCart[index].totalDiscount = newCart[index].count * newCart[index].discount;
            setCart(newCart);
        }
    };

    const handleDelete = (name: any) => {
        const newCart = cart.filter(item => item.name !== name);
        setCart(newCart);
    };
    const getDiscountBadge = (product: any) => {
        if (product.diskon_persen && product.diskon_persen > 0) {
            return (
                <Badge value={" " + product.diskon_persen + "% OFF"} className="bg-red-400 pi pi-tag mr-7 rounded-none p-1 w-[100px] shadow"></Badge>
            );
        }
        return null;
    };

    function getCurrentDate() {
        return new Date().toLocaleDateString();
    }

    const [isTruncated, setIsTruncated] = useState(true);
    const toggleTruncate = () => {
        setIsTruncated(!isTruncated);
    };

    const userName = userData?.nama || 'N/A';
    const userPhone = invoiceData?.no_telepon || 'N/A';
    const userAddress = invoiceData?.alamat || 'N/A';
    const invoiceId = invoiceData?.id_user || 'N/A';
    const totalAmount = formatCurrency(invoiceData?.total || 0);
    const invoiceItems = invoiceData?.items || [];
    const subTotal = formatCurrency(invoiceData?.sub_total || 0);
    const discount = formatCurrency(invoiceData?.diskon_rupiah || 0);

    const qrCodeData = JSON.stringify({
        user: userName,
        phone: userPhone,
        address: userAddress,
        invoiceId: invoiceId,
        invoiceItems: invoiceItems,
        subTotal: subTotal,
        discount: discount,
        total: totalAmount
    });
    useEffect(() => {
        if (page > 1) {
            const newMenuItems = selectedCategory
                ? allMenu.filter(item => item.category_id === selectedCategory).slice((page - 1) * 20, page * 20)
                : allMenu.slice((page - 1) * 20, page * 20);
            setMenu(prevMenu => [...prevMenu, ...newMenuItems]);
            setHasMore(newMenuItems.length > 0);
        }
    }, [page, selectedCategory, allMenu]);

    if (loading) {
        return <MenuSkeleton />;
    }

    return (
        <div className="container ">
            <div className='me-2 sticky top-0 py-2 px-3 bg-white z-10 shadow-sm rounded w-full'>
                <div className="flex w-full justify-content-end">
                    <ZoomIn>
                        <div className='text-start'>
                            <h1>Menu<div className="underline" style={{ width: '100px', height: '4px', background: '#61AB5B', margin: '2px' }}></div></h1>
                        </div>
                    </ZoomIn>
                    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex align-items-center justify-content-end w-full">
                        <div className="flex align-items-center justify-content-end w-1/2 ">
                            <Search
                                onClick={handleSearch}
                                className="align-items-center hidden sm:flex h-full "
                            />
                            <Input
                                type="search"
                                placeholder="Search"
                                value={searchTerm}
                                className="w-full ms-3 me-2 mt-2 sm:w-1/2"
                                onChange={handleInput}
                            />
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <div className="flex align-items-center pt-2">
                                    <i className="pi pi-shopping-cart p-text-secondary p-overlay-badge" style={{ fontSize: '2rem' }}>
                                        <Badge hidden={cart.length === 0} value={cart.length} className="bg-[#61AB5B]"></Badge>
                                    </i>
                                </div>
                            </SheetTrigger>
                            <SheetContent className="overflow-auto" style={{ scrollbarWidth: 'none' }}>
                                <SheetHeader >
                                    <SheetTitle className='text-black'>Cart</SheetTitle>
                                    <SheetDescription ></SheetDescription>
                                    {cart.map((item, index) => (
                                        <Card key={index} className='my-3 p-2'>
                                            <div className='flex justify-content-between'>
                                                <div className="hidden sm:flex align-items-center ">
                                                    {item.image ? (
                                                        <img
                                                            src={`data: image / jpeg;base64,${item.image}`}
                                                            alt={item.name}
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '10px' }}
                                                        />
                                                    ) : (
                                                        <div className="avatar-fallback">img</div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col w-full ms-2">
                                                    <div className="flex justify-content-start ">
                                                        <label htmlFor={`cart-item-${index}`} className=" text-start">{item.name}</label>
                                                    </div>
                                                    <div className="flex w-full align-items-center">
                                                        <div className="flex w-full ">
                                                            <div className="flex flex-col w-1/2 text-start gap-1 ">
                                                                {/* <label htmlFor={`cart-item-price-${index}`}>{formatCurrency(item.price)}</label> */}
                                                                <div className="flex items-center text-black">
                                                                    {item.count > 1 ? (
                                                                        <CiSquareMinus size={'40px'} onClick={() => handleDecrement(index)} />
                                                                    ) : (
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <CiSquareMinus size={'40px'} />
                                                                            </DialogTrigger>
                                                                            <DialogTitle></DialogTitle>
                                                                            <DialogContent className="sm:max-w-md" hideClose>
                                                                                <DialogHeader>
                                                                                    <label htmlFor="">Are you sure you want to delete {item.name}?</label>
                                                                                </DialogHeader>
                                                                                <DialogDescription></DialogDescription>
                                                                                <DialogFooter className="sm:justify-end">
                                                                                    <Button variant="secondary" onClick={() => handleDelete(item.name)}>Delete</Button>
                                                                                    <DialogClose asChild>
                                                                                        <Button type="button" variant="secondary">Cancel</Button>
                                                                                    </DialogClose>
                                                                                </DialogFooter>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}

                                                                    {item.count >= 1 ? (
                                                                        <input value={item.count} // onChange={(event) => handleInputChange(event, index)}
                                                                            onChange={(event) => handleInputChange(event, index)}
                                                                            className="mx-2 w-12 text-center"
                                                                        />
                                                                    ) : (
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <input value={item.count}
                                                                                    onChange={(event) => handleInputChange(event, index)}
                                                                                    className="mx-2 w-12 text-center"
                                                                                />
                                                                            </DialogTrigger>
                                                                            <DialogContent className="sm:max-w-md" hideClose>
                                                                                <DialogTitle></DialogTitle>
                                                                                <DialogHeader>
                                                                                    <label htmlFor="">Are you sure you want to delete {item.name}?</label>
                                                                                </DialogHeader>
                                                                                <DialogFooter className="sm:justify-end">
                                                                                    <DialogClose>
                                                                                        <Button variant="secondary" onClick={() => handleDelete(item.name)}>Delete</Button>
                                                                                    </DialogClose>
                                                                                    <DialogClose asChild>
                                                                                        <Button type="button" variant="secondary">Cancel</Button>
                                                                                    </DialogClose>
                                                                                </DialogFooter>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}
                                                                    <CiSquarePlus size={'40px'} onClick={() => handleIncrement(index)} className="cursor-pointer" />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col justify-content-center w-1/2 text-end ">
                                                                {item.totalPrice - item.totalDiscount > 0 ? (
                                                                    <>
                                                                        <label htmlFor={`cart-item-price-${index}`} style={{ textDecoration: 'line-through' }}>
                                                                            {formatCurrency(item.totalPrice)}
                                                                        </label>
                                                                        <label htmlFor={`cart-item-price-${index}`}>
                                                                            {formatCurrency(item.totalDiscount)}
                                                                        </label>
                                                                    </>
                                                                ) : (
                                                                    <label htmlFor={`cart-item-price-${index}`}>
                                                                        {formatCurrency(item.totalPrice)}
                                                                    </label>
                                                                )}
                                                            </div>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <div className="flex align-items-center w-1/1 ms-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"><Trash size={'20px'} /></div>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-md" hideClose>
                                                                    <DialogHeader><label htmlFor="">Are you sure you want to delete {item.name}?</label></DialogHeader>
                                                                    <DialogFooter className="sm:justify-end">
                                                                        <DialogClose>
                                                                            <Button variant="secondary" onClick={() => handleDelete(item.name)}>Delete</Button>
                                                                        </DialogClose>
                                                                        <DialogClose asChild>
                                                                            <Button type="button" variant="secondary">Cancel</Button>
                                                                        </DialogClose>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </SheetHeader>
                                <SheetFooter className='flex row gap-4 mt-4'>
                                    <Card className="pb-3" hidden={cart.length === 0}>
                                        <div className='flex justify-content-between pe-0 py-2'>
                                            <div className='flex justify-center align-items-center gap-2 me-3'>
                                                <label htmlFor="total">SubTotal </label>
                                            </div>
                                            <div className='flex justify-center align-items-center gap-2'>
                                                <label htmlFor="price">{formatCurrency(cart.reduce((total, item) => total + item.price * item.count, 0))}</label>
                                            </div>
                                        </div>
                                        <div className='flex justify-content-between pe-0 py-2'>
                                            <div className='flex justify-center align-items-center gap-2 me-3'>
                                                <label htmlFor="total">Total Order</label>
                                            </div>
                                            <div className='flex justify-center align-items-center gap-2'>
                                                <label htmlFor="price">{formatCurrency(cart.reduce((total, item) => total + item.discount * item.count, 0))}</label>
                                            </div>
                                        </div>

                                        <SheetClose asChild disabled={cart.length === 0 || cart.reduce((total, item) => total + item.discount * item.count, 0) === 0} className="mt-2">
                                            <Button type="submit" className='text-white bg-[#61AB5B] w-full' onClick={handleSubmit} disabled={Isloading}>
                                                {Isloading ? (
                                                    <div className="load-more flex w-full justify-content-center p-4">
                                                        <img src="/loader.png" className="me-1 animate-spin"></img>
                                                        <label>Loading...</label>
                                                    </div>
                                                ) : (
                                                    'Order'
                                                )}</Button>
                                        </SheetClose>
                                    </Card>
                                </SheetFooter>
                                {notification && (
                                    <h4 className="notification text-center">
                                        {notification}
                                    </h4>
                                )}
                            </SheetContent>
                        </Sheet>
                        {isDialogOpen && invoiceData && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent ref={documentRef} hideClose>
                                    <DialogClose asChild className="d-print-none">
                                        <div className="flex justify-content-end">
                                            <X className="h-4 w-4" />
                                        </div>
                                    </DialogClose>
                                    <DialogHeader>
                                        <DialogTitle>Invoice</DialogTitle>
                                        <DialogDescription />
                                        <div className="p-1 sm:w-full">
                                            <div className='flex'>
                                                <div className='flex flex-col w-1/2 gap-2 text-start'>
                                                    <label>www.nuniswarungkoffie.id</label>
                                                    <label>nuniswarungkoffie@gmail.com</label>
                                                    <label>081234567890</label>
                                                </div>
                                                <div className='flex w-1/2'>
                                                    <div className='flex flex-row align-items-end justify-end w-full'>
                                                        <div className='flex flex-col text-end'>
                                                            <h4 className='text-[#61AB5B]'>Nunis Warung Koffie</h4>
                                                            <label>Nunis Warung Koffie Address</label>
                                                            <label>TAX 1982323272832280</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 outline bg-light shadow-lg rounded-lg bg-gray-100">
                                                <div className="flex flex-row align-items-start justify-content-between">
                                                    <div className="flex flex-col align-items-start w-auto">
                                                        <h5>Bill To</h5>
                                                        <label>Id : {userData.nama}</label>
                                                        <label>No.Telpon : {invoiceData.no_telepon}</label>
                                                        <label>Alamat : {invoiceData.alamat}</label>
                                                    </div>
                                                    <div className="flex flex-col align-items-end">
                                                        <h6>Invoice of IDR</h6>
                                                        <h6>{formatCurrency(invoiceData.total)}</h6>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row align-items-center justify-content-between mt-3">
                                                    <div className="flex flex-col align-items-start w-auto">
                                                        <h5>Tanggal Invoice</h5>
                                                        <label>{currentDate}</label>
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
                                                    {invoiceData.items.map((item: any, index: any) => (
                                                        <div className="flex flex-row align-items-center mt-3" key={index}>
                                                            <div className="flex flex-col align-items-center w-1/4">
                                                                <label>{item.name}</label>
                                                            </div>
                                                            <div className="flex flex-col align-items-center w-1/4">
                                                                <label>{item.count}</label>
                                                            </div>
                                                            <div className="flex flex-col align-items-center w-1/4">
                                                                <label>{formatCurrency(item.sub_total_item / item.count)}</label>
                                                            </div>
                                                            <div className="flex flex-col align-items-center w-1/4">
                                                                <label>{formatCurrency(item.sub_total_item)}</label>
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
                                                                <label>{formatCurrency(invoiceData.sub_total)}</label>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row align-items-center justify-content-between">
                                                            <div className="flex flex-col align-items-end w-1/2">
                                                                <label>Diskon</label>
                                                            </div>
                                                            <div className="flex flex-col align-items-end w-1/2">
                                                                <label>{formatCurrency(invoiceData.diskon_rupiah)}</label>
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
                                                                <label><b>{formatCurrency(invoiceData.total)}</b></label>
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
                        )}
                    </motion.div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex justify-start pt-3 mb-2 gap-4 w-full " style={{ overflow: 'auto', scrollbarWidth: 'none' }}>
                    <a href="#all">
                        <Button
                            onClick={() => handleCategoryChange(null)}
                            className={`text-black hover:bg-[#61AB5B] hover:font-bold ${selectedCategory === null ? 'bg-[#61AB5B]' : 'bg-[#333'}`}>
                            All
                        </Button>
                    </a>
                    {categories.map((category) => (
                        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                            key={category.id} href={`#${category.name.replace(/\s+/g, '-').toLowerCase()}`}>
                            <Button
                                onClick={() => handleCategoryChange(category.id)}
                                className={`text-black hover:bg-[#61AB5B] hover:font-bold ${selectedCategory === category.id ? 'bg-[#61AB5B]' : 'bg-[#D5FFD4]'}`}>
                                {category.name}
                            </Button>
                        </motion.a>
                    ))}
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 1 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 sm:gap-x-4 gap-x-2 gap-y-5 pt-3">
                {filteredMenu.map((product, index) => (
                    <Card className="rounded text-sm" ref={index === filteredMenu.length - 1 ? lastMenuElementRef : null} key={product.kode_menu}>
                        <CardHeader>
                            <div className="flex justify-content-center align-items-center p-overlay-badge ">
                                <Badge value={getDiscountBadge(product)} className=" bg-transparent "></Badge>
                                <div style={{ width: '210px', height: '150px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #ccc', background: '#ccc', marginTop: '10px' }}>
                                    {product.image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${product.image}`}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <img
                                            src="/image.png"
                                            alt="Default Image"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <div className="mx-3 mb-2">
                            <div className="text-center ">
                                <h5 className="text-truncate" style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}>
                                    {product.name}
                                </h5>
                            </div>
                            <div className={`w-auto ${isTruncated ? '' : 'h-[70px]'} overflow-auto text-text-truncate text-sm`}>
                                <label htmlFor="" className={`d-inline-block ${isTruncated ? 'text-truncate' : ''}`}
                                    style={{ maxWidth: isTruncated ? '100%' : 'none', cursor: 'pointer', whiteSpace: isTruncated ? 'nowrap' : 'normal' }}
                                    onClick={toggleTruncate}
                                    title={isTruncated ? 'Click to expand' : 'Click to collapse'}
                                >
                                    {product.description}
                                </label>
                            </div>
                        </div>
                        <CardFooter className="flex sm:flex-row flex-col">
                            <div className="flex items-center sm:w-full mb-2">
                                <span className="mb-0 text-sm fw-bold">{formatCurrency(product.price)}</span>
                            </div>
                            <div className="flex items-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="flex align-items-center bg-[#76C16F] rounded-full font-bold px-3 py-2  sm:bg-[#76C16F]" onClick={() => handleAddClick(product)}>
                                            add
                                            <div className="bg-white rounded-xl ms-2 ">
                                                <Plus size={'20px'} />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add to Cart</DialogTitle>
                                            <div className="flex justify-content-center mb-0">
                                                <div style={{ width: '200px', height: '150px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #ccc', background: '#ccc' }}>
                                                    {product.image ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${product.image}`}
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div className="avatar-fallback">img</div>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedProduct && (
                                                <div className="mt-5">
                                                    <ProductCard product={selectedProduct} onAddToCart={handleAddToCart} />
                                                </div>
                                            )}
                                            <DialogDescription></DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </motion.div>
            {
                hasMore && !searchTerm ? (
                    loading ? (
                        <div className="loading-more">
                            <span>Loading more...</span>
                        </div>
                    ) : (
                        <div className="load-more flex w-full justify-content-center p-4">
                            <img src="/loader.png" className="me-1 animate-spin"></img>
                            <label onClick={() => setPage((prevPage) => prevPage + 1)}>Loading more...</label>
                        </div>
                    )
                ) : null
            }
        </div >
    );
}
const fetchAllMenu = async (): Promise<Menu[]> => {
    const response = await axios.get(API_ENDPOINTS.MENU_ITEMS);
    return response.data;
};
const fetchMenuByCategory = async (categoryId: string): Promise<Menu[]> => {
    const response = await axios.get(API_ENDPOINTS.CATEGORY_MENU_ITEMS(categoryId));
    return response.data.menuItems;
};
const fetchCategories = async (): Promise<Category[]> => {
    const response = await axios.get(API_ENDPOINTS.CATEGORIES);
    return response.data;
};

// function setError(arg0: string) {
//     throw new Error("Function not implemented.");
// }