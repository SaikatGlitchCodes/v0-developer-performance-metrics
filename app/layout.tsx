import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GithubProvider } from "@/lib/context/githubData";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GithubProvider token="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">
        <body className={`font-sans antialiased`}>
          {children}
          <Analytics />
        </body>
      </GithubProvider>
    </html>
  );
}
