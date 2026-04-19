import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Cuemath Tutor Interview Portal",
  description: "Apply to become a Cuemath tutor. Complete your structured interview in 10 minutes.",
  keywords: ["Cuemath", "tutor screening", "interview", "math tutor"],
  icons: {
    icon: "https://www.cuemath.com/favicon.ico",
  },
  openGraph: {
    title: "Cuemath Tutor Assessment",
    description: "Tutor candidate screening portal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-brand-surface text-brand-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
