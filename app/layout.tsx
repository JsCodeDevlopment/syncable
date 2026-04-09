import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Syncable",
    template: "%s | Syncable",
  },
  description:
    "Elite time tracking for modern professionals. Experience precision clocking, automated reporting, and deep productivity analytics in one beautiful interface.",
  keywords: [
    "time tracking",
    "productivity app",
    "work logs",
    "report generator",
    "saas",
    "time management",
    "professional tools",
  ],
  authors: [
    { name: "Jonatas Silva", url: "https://github.com/JsCodeDevlopment" },
  ],
  creator: "Jonatas Silva",
  publisher: "JsCodeDevelopment",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://syncable.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Syncable | Command Your Time",
    description:
      "The next generation of time tracking for ambitious professionals.",
    url: "https://syncable.vercel.app/",
    siteName: "Syncable",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/gallery/image1.png",
        width: 1200,
        height: 630,
        alt: "Syncable Dashboard Preview",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
