"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link'
import axios from "axios";
import { Card, CardHeader } from "@/components/ui/card";
import { CategorySkeleton } from "@/app/skeleton/skeletonCategory";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";
import { motion } from "framer-motion";
import FadeUp from "@/components/animation/fadeUp";

interface Category {
    name: string;
    icon: string | null;
    description: string;
}
function Categorypage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    // const [isTruncated, setIsTruncated] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES);
                setCategories(response.data);
            } catch (error) {
                console.error('There was an error fetching the users!', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    if (loading) {
        return <CategorySkeleton />;
    }

    // const toggleTruncate = () => {
    //     setIsTruncated(!isTruncated);
    // };
    return (
        <div className="container">
            <FadeUp>
                <div className='text-center mt-3'>
                    <h1>Category</h1>
                    <div className="underline" style={{ width: '150px', height: '4px', background: '#61AB5B', margin: 'auto auto 50px' }}></div>
                </div>
            </FadeUp>
            <div className="container mx-auto">
                <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:flex-row justify-content-center align-items-center'>
                    {categories.map((category, index) => (
                        <Link href={'/dashboard/menu/'} className='no-underline p-5' key={index}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: index * 0.5 }}
                            >
                                <Card className="rounded text-sm">
                                    <CardHeader className="justify-content-center align-items-center w-auto ">
                                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #ccc', marginTop: '20px', background: '#ccc' }}>
                                            {category.icon ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${category.icon}`}
                                                    alt={category.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="avatar-fallback">img</div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <div className="mx-3 mb-2 h-[200px]">
                                        <div className="text-center ">
                                            <h5 className="text-truncate" style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}>
                                                {category.name}
                                            </h5>
                                        </div>
                                        <div className={`text-center w-auto h-[140px] text-sm overflow-auto`} style={{ scrollbarWidth: "none" }}>
                                            <label
                                                htmlFor=""
                                                className={'d-inline-block'}
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {category.description}
                                            </label>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default Categorypage