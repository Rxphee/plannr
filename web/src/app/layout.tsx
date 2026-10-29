import "./globals.css";

import { cn } from "@src/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Plannr",
    description: "A lean, self-hosted issue tracker",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" className={cn("font-sans", inter.variable)}>
            <body>{children}</body>
        </html>
    );
}
