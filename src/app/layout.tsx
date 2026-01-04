import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Proyectos - Sistema Freelance/Agencia",
  description: "Sistema de gestión de proyectos y tareas para desarrollo web freelance y agencias",
  keywords: ["Gestión de Proyectos", "Freelance", "Agencia", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Your Company" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Gestión de Proyectos",
    description: "Sistema de gestión de proyectos y tareas para desarrollo web",
    url: "https://chat.z.ai",
    siteName: "Gestión de Proyectos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestión de Proyectos",
    description: "Sistema de gestión de proyectos y tareas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
