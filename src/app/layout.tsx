import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider >
    <html lang="en" className="dark" >
      <body
        className={inter.className}
      >
        <TRPCProvider>
          <Toaster />
           {children}
        </TRPCProvider>
        <div id="modal-root" className="absolute top-0 left-0"></div>
      </body>
    </html>
    </ClerkProvider>
  );
}
