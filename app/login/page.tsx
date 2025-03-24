'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { IconBrandGoogle, IconBrandFacebook } from "@tabler/icons-react";
import Image from 'next/image';
import Card from "@/components/ui/Card";
import Logo from "@/public/logo.svg";

const ChronoSpaceLogo = () => (
  <Image src={Logo} alt="ChronoSpace Logo" width={80} height={80} />
);

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/workspace"
      });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col items-center justify-center p-4">

        <div className="flex items-center justify-center mb-8 text-blue-600">
          <ChronoSpaceLogo />
          <div className="flex flex-col">
            <h1 className="text-5xl font-bold">ChronoSpace</h1>
            <p className="text-xs">Streamline Your Projects, Budgets & Approvals in One Place</p>
          </div>
        </div>

        <Card className="w-full max-w-md">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Keep me signed in
                </label>
              </div>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-500">
                Forgot Password
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

          </form>
          {/* <p className="text-center text-sm text-gray-600 my-4">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </p> */}

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="flex justify-center gap-3 my-4">
            <button type="button" disabled className="w-12 p-2 border border-gray-300 rounded-md flex justify-center hover:bg-gray-50">
              <IconBrandGoogle size={20} />
            </button>
            <button type="button" disabled className="w-12 p-2 border border-gray-300 rounded-md flex justify-center hover:bg-gray-50">
              <IconBrandFacebook size={20} />
            </button>
          </div>
          <small className="text-red-500 block text-center">currently unavailable</small>

        </Card>
      </div>
    </div>
  );
} 