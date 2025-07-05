"use client";
import React, { useEffect, useState } from 'react';
import { FaRegClock } from 'react-icons/fa';
import { TbRosetteDiscount } from "react-icons/tb";
import { MdOutlineShoppingCart } from 'react-icons/md';
import axios from 'axios';
import HomepageSkeleton from '../../skeleton/skeletonHome';
import { Card, CardHeader } from '@/components/ui/card';
import img1 from '../../../public/ic_category.png'
import img2 from '../../../public/ic_menu.png'
import img3 from '../../../public/ic_cart_2.png'
import img4 from '../../../public/ic_cart.png'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { motion, useViewportScroll } from 'framer-motion';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Link from 'next/link';
import { API_ENDPOINTS } from '@/app/api/nunisbackend/api';
import SlideInLeft from '@/components/animation/slideInLeft';
import SlideInRight from '@/components/animation/slideInRight';
import ZoomIn from '@/components/animation/zoomIn';

interface review {
    email: string,
    message: string,
    pictures: string
}
function Homepage() {
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const menu = [
        {
            img: img1,
            name: "Pilih Kategori",
            description: "Pilih kategori menu yang ingin anda pesan. Ada 3 kategori, yaitu, Makanan, Minuman dan Snack"
        }, {
            img: img2,
            name: "Pilih Menu",
            description: "Pilih menu yang ingin anda pesan. Ada juga banyak diskon pada beberapa menu"
        }, {
            img: img3,
            name: "Tambahkan ke Keranjang",
            description: "Menu yang anda tambahkan akan otomatis masuk ke keranjang belanjaan anda. Selanjutnya, menuju ke keranjang belanjaan."
        }, {
            img: img4,
            name: "Pesan",
            description: "Setelah masuk ke halaman keranjang belanjaan, cek kembali menu yang ingin anda pesan. Setelah yakin, anda dapat memesan."
        }
    ]
    const [review, setReview] = useState<review[]>([]);
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get(API_ENDPOINTS.CONTACT, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
                setReview(response.data);
            } catch (error) {
                console.error("There was an error!", error);
            } finally {
            }
        }
        fetchUsers();
    }, []);
    useEffect(() => {
        const fetchUserData = async () => {
            const userinfo = localStorage.getItem('user-info');
            // Cek apakah user sudah logout
            if (!userinfo) {
                setLoading(false);
                setUserData(null);
                return;
            }

            let email = userinfo.replace(/["]/g, '');
            if (!email) {
                setLoading(false);
                setUserData(null);
                return;
            }

            try {
                const response = await axios.get(API_ENDPOINTS.USER(email));
                setUserData(response.data);
            } catch (err) {
                setUserData(null);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <HomepageSkeleton />;
    }

    if (!userData) {
        window.location.href = '/login';
        return null;
    }

    return (
        <div className="surface-0 vh-100 pt-4">
            <div className="font-bold text-4xl mb-5 text-center pt-5">Selamat Datang, {userData.nama}</div>
            <div className="container">
                <div className="flex sm:flex-row flex-col">
                    <div className="col-5 m-lg-2">
                        <div className="flex">
                            <motion.img initial={{ opacity: 0, y: 20 }} animate={{ opacity: 3, y: 0 }} transition={{ duration: 1 }} src="/nunis.png" alt="gambar" width="400px" id='img-1' className="p-2 mb-5" style={{ borderRadius: '30px', marginTop: '-20px' }} />
                            {/* <SlideInRight>
                                <div className='flex-col'>
                                    <img src="/img-6.png" alt="gambar" width="210px" className="p-2" style={{ borderRadius: '30px' }} />
                                    <img src="/img-2.png" alt="gambar" width="210px" className="p-2" style={{ borderRadius: '30px' }} />
                                </div>
                            </SlideInRight> */}
                        </div>
                    </div>
                    <ZoomIn>
                        <div className="w-full m-lg-2 text-xl">
                            <h1 className="text-4xl font-bold mb-4">Nunis Warung & Koffie</h1>
                            <p className="text-gray-700 w-full mb-4">
                            Nikmati suasana hangat dan kenyamanan dalam setiap tegukan kopi dan 
                            hidangan lezat di Nunis Warung & Koffie. Kami menyajikan kopi pilihan dengan rasa yang
                            menggugah selera, dipadukan dengan hidangan lokal yang kaya rasa, untuk menemani setiap
                            momen istimewa Anda. Terletak di hati kota, Nunis Warung & Koffie adalah tempat sempurna untuk bersantai, 
                            bekerja, atau menikmati waktu bersama teman-teman. Bergabunglah bersama kami dan temukan kenikmatan sejati dalam setiap sajian!
                            </p>
                            {/* <b><p className='mb-2'><FaRegClock className='mr-2 inline-flex items-center' />Delivery within 30 minutes</p></b>
                            <b><p className='mb-2'><TbRosetteDiscount className='mr-2 inline-flex items-center' />Best Offer & Prices</p></b>
                            <b><p className='mb-2'><MdOutlineShoppingCart className='mr-2 inline-flex items-center' />Online Services Available</p></b> */}
                        </div>
                    </ZoomIn>
                </div>
            </div>
            <SlideInLeft><div className="text-3xl mb-2 text-center pt-18 pb-14 fw-bold"><label htmlFor="">Cara Order Nunis Warung & Koffie</label></div></SlideInLeft>
            <div className="container mx-auto">
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 sm:flex-row justify-content-center align-items-center gap-4'>
                    {menu.map((item, index) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay : index * 0.5 }}
                            key={index}
                        >
                            <Card className="rounded text-sm">
                                <CardHeader>
                                    <div className="flex justify-content-center align-items-center">
                                        <div style={{ width: '200px', height: '150px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #ccc', background: '#ccc' }}>
                                            {item.img ? (
                                                <Image src={item.img} alt={item.name} />
                                            ) : (
                                                <div className="avatar-fallback">img</div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="mx-3 mb-2">
                                    <div className="text-center h-[40px] mb-auto">
                                        <h5 className="text-truncate" style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </h5>
                                    </div>
                                    <div className="text-sm">
                                        <div className="w-auto h-[80px] overflow-auto  ">
                                            <label htmlFor="">{item.description}</label>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* <motion.div
                initial={{ opacity: 0, x: 200 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-3xl mb-5 text-center pt-20 fw-bold"><label>Special Discount</label></motion.div>
            <motion.div
                initial={{ opacity: 0, y: 200 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }} className='flex flex-col  sm:flex-row justify-center'>
                <div className='flex w-full sm:w-1/2  justify-center '>
                    <div style={{ padding: '40px', background: '#5F7554', boxShadow: '36px 35px 4px  rgba(0, 0, 0, 0.25)' }}>
                        <img src="/logo2.png" alt="" className='w-[200px] h-[200px]' />
                    </div>
                </div>
                <div className='flex flex-col w-full sm:w-1/2 gap-3'>
                    <label htmlFor="" className=' text-3xl pt-20 fw-bold w-full'>Get 30% Special Promo</label>
                    <p>Enjoy our discount up to 30% for orders via Godong Menu</p>
                    <div className='flex justify-start'>
                        <Link href={'/dashboard/menu/'} className='no-underline p-5 text-black'>
                            <Button className='w-auto bg-[#76C16F] '> Order now <ShoppingCart /></Button>
                        </Link>
                    </div>
                </div>
            </motion.div> */}

            <div className="text-3xl mb-5 text-center pt-20 fw-bold"><label>Penilaian Pelanggan</label></div>
            <div className="container mx-auto flex justify-center pb-5">
                <Carousel
                    opts={{
                        align: "center",
                    }}
                    className="w-full max-w-[300px] sm:max-w-[800px]"
                >
                    <CarouselContent>
                        {review.map((item: any, index: any) => (
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                key={index}
                            >
                                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                                    {/* <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 sm:flex-row justify-content-center align-items-center gap-4'> */}
                                    <Card className="rounded text-sm">
                                        <CardHeader>
                                            <div className="flex align-items-center ">
                                                <div className="flex flex-col">
                                                    <div className=" flex text-center h-[50px] mb-2 gap-2 ">
                                                        {item.pictures ? (
                                                            <Image src={item.pictures}
                                                                alt="nahh"
                                                                width={50}
                                                                height={50}
                                                                style={{ borderRadius: '50px', overflow: 'hidden' }} />
                                                        ) : (
                                                            <div className="avatar-fallback">img</div>
                                                        )}
                                                        {/* <div style={{ width: '30px', height: '30px', borderRadius: '50px', overflow: 'hidden', border: '3px solid #ccc', background: '#ccc' }}>

                                                    </div> */}
                                                        <div className='flex align-items-center'>
                                                            <h5 className="text-truncate" style={{ maxWidth: '170px', whiteSpace: 'nowrap' }}>
                                                                {item.email}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="w-[250px] h-[40px] overflow-auto">
                                                            <label htmlFor="" className="d-inline-block"
                                                                style={{ maxWidth: '100%', cursor: 'pointer', whiteSpace: 'normal', wordWrap: 'break-word' }}
                                                            >{item.message}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                    {/* </div> */}
                                </CarouselItem>
                            </motion.div>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
}

export default Homepage;
