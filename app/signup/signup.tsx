"use client";
import '../../styles/globals.css'
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import bg from "../../public/bg-login.png";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../api/nunisbackend/api';

export default function SignUp() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const status = 2;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email : any) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e : any) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e : any) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
  };

  async function usersignup() {
    let item = { nama, password, email, address, phone, status};
    setIsLoading(true);
    try {
      let response = await axios.post(
        API_ENDPOINTS.REGISTER,
        item,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );
      localStorage.setItem("user-info", JSON.stringify(response.data));
      navigate.push("/login");
    } catch (error) {
      console.error("There was an error!", error);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = () => {
    return nama && validateEmail(email) && password.length >= 8 && address && phone;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full">
      <div className='flex justify-center items-center lg:hidden bg-white'>
        <div className="h-[300px] w-[300px] flex items-end">
          <Image
            src={bg}
            alt="Image"
            priority
          />
        </div>
      </div>
      <div className="flex items-center justify-center h-full w-full lg:w-1/2">
        <Card className="w-full max-w-sm">
          <CardHeader>
          <CardTitle className="text-lg mb-0">Welcome To</CardTitle>
          <CardTitle className="text-2xl mt-0">Nunis Warung Koffie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  placeholder="Max"
                  autoComplete='off'
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete='off'
                  required
                  value={email}
                  onChange={handleEmailChange}
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="pr-10 w-full border rounded px-3 py-2 focus:outline-none"/>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 bg-transparent border-none cursor-pointer text-gray-600 focus:outline-none">
                    {showPassword ? <EyeOff size={'17px'}/> :  <Eye size={'17px'}/>}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="address"
                  required
                  placeholder="perumahan indah besari"
                  autoComplete='off'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="phone"
                  placeholder="08XXXXXXXXXX"
                  autoComplete='off'
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className={`w-full ${isFormValid() ? 'bg-[#61AB5B] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                onClick={isFormValid() ? usersignup : () => {}}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? 'Loading...' : 'Create an account'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex h-full w-full lg:w-1/2 items-center justify-center bg-muted">
        <Image
          src={bg}
          alt="Image"
          className="h-auto w-auto"
          priority
        />
      </div>
    </div>
  );
}