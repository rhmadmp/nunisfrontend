"use client";

import "../../styles/globals.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bg from "../../public/bg-login.png";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../components/Auth/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { API_ENDPOINTS } from "../api/nunisbackend/api";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail) ? "" : "Masukkan alamat email yang valid");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(newPassword.length >= 8 ? "" : "Kata sandi harus minimal 8 karakter");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.LOGIN,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        login(response.data.user);
        document.cookie = `auth_token=${response.data.token}; path=/;`;
        setIsNavigating(true);
        router.push(response.data.status === 2 ? "/dashboard/home" : "/admin/dashboard");
      } else {
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Terjadi kesalahan!", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => validateEmail(email) && password.length >= 8;

  useEffect(() => {
    const timeout = setTimeout(() => setIsNavigating(false), 3000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

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
            <CardTitle className="text-2xl mt-0">Nunis Warung & Koffie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  autoComplete="off"
                  onChange={handleEmailChange}
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="pr-10 w-full border rounded px-3 py-2 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 bg-transparent border-none cursor-pointer text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
              </div>
              <Button
                type="submit"
                className={`w-full ${
                  isFormValid()
                    ? "bg-[#61AB5B] text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                disabled={!isFormValid() || isLoading || isNavigating}
              >
                {isLoading || isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don't have account?{" "}
              <Link href="/signup" className="underline">
                SignUp
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
