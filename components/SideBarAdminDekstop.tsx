import React, { useCallback, useEffect, useState } from "react";
import SideBarButton from "./SideBarButton";
import { SidebarItems } from "@/types/sidebartypes";
import Link from "next/link";
import { LogOut, MoreHorizontal, UserRound } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import lg from '../public/profil.png';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PopoverContent } from "@radix-ui/react-popover";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "./Auth/useAuth";
import { API_ENDPOINTS } from "@/app/api/nunisbackend/api";

interface SidebarDekstopProps {
  sidebarItems: SidebarItems;
}

export default function SidebarDekstop(props: SidebarDekstopProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const userinfo = localStorage.getItem('user-info');
      const admininfo = localStorage.getItem('admin-info');

      let email = null;

      if (userinfo && admininfo) {
        email = `${userinfo.replace(/["]/g, '')} ${admininfo.replace(/["]/g, '')}`;
      } else if (userinfo) {
        email = userinfo.replace(/["]/g, '');
      } else if (admininfo) {
        email = admininfo.replace(/["]/g, '');
      }
      if (!email) {
        setError(admininfo);
        return;
      }
      try {
        const response = await axios.get(API_ENDPOINTS.USER(email));
        setUserData(response.data);
      } catch (err) {
        setError('Gagal mengambil data user');
        console.error(err);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Jalankan navigasi dan logout secara bersamaan
      await Promise.all([
        router.push('/login'),
        logout()
      ]);
    } catch (error) {
      console.error('Terjadi kesalahan saat logout:', error);
      // Opsional: Tambahkan notifikasi error untuk pengguna
    }
  }, [router, logout]);
  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    // return <div>{localStorage.getItem("user-info")}</div>;
    return <div></div>;
  }

  return (
    <aside className="w-[260px] h-screen  border-r ">
      <div className="h-full px-3 py-4 flex flex-col justify-between">
        <div>
          <div className="flex h-14 justify-center items-center border-b px-4 lg:h-[60px] lg:px-6 ">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/nunis.png" alt="logo" width={100} height={100}/>
            </Link>
          </div>
          <div className="flex flex-col gap-2 mt-5">
            {props.sidebarItems.links.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link key={index} href={link.href}>
                  <SideBarButton
                    variant="ghost"
                    className={`border-1 ${isActive ? 'bg-black text-white' : 'border-transparent text-gray-700 hover:bg-black hover:text-white'}`}
                    icon={link.icon}
                  >
                    {link.label}
                  </SideBarButton>
                </Link>
              );
            })}
          </div>
        </div>
        <div className=" left-0 bottom-1 w-full border-top p-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="nunis.png" />
                      <AvatarFallback><UserRound /></AvatarFallback>
                    </Avatar>
                    <span>{userData.nama}</span>
                  </div>
                  <MoreHorizontal size={20} />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mb-2 w-56 p-3 rounded-[1rem]">
              <SideBarButton
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="w-[200px] h-[35px] animate-none border-[1px] bg-[#61AB5B] text-white"
              >
                Log Out
              </SideBarButton>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </aside>
  );
}
