"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token.length > 20) {
      setAutorizado(true);
    } else {
      window.location.replace("/login");
    }
  }, []);

  if (!autorizado)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return <DashboardLayout>{children}</DashboardLayout>;
}
