'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { IconBrandGoogle, IconBrandFacebook } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/workspace"
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

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
            >
              Login
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button type="button" className="w-12 p-2 border border-gray-300 rounded-md flex justify-center hover:bg-gray-50">
                <IconBrandGoogle size={20} />
              </button>
              <button type="button" className="w-12 p-2 border border-gray-300 rounded-md flex justify-center hover:bg-gray-50">
                <IconBrandFacebook size={20} />
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
} 