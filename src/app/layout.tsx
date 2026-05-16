import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtomQuest | Strategic Performance Nexus",
  description: "Next-generation strategic execution suite. Synchronize goals, orchestrate real-time collaboration, and visualize organizational velocity with AI-driven analytics.",
  keywords: ["Strategic Execution", "Performance Management", "KPI Tracking", "Real-time Collaboration", "AI Analytics"],
  authors: [{ name: "AtomQuest Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  openGraph: {
    title: "AtomQuest",
    description: "Strategic Performance Nexus",
    type: "website",
    siteName: "AtomQuest",
  },
  twitter: {
    card: "summary_large_image",
    title: "AtomQuest",
    description: "Strategic Performance Nexus",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster theme="dark" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
