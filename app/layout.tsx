import type { Metadata } from "next";
import "./globals.css";
import { motleyForces } from './fonts'

export const metadata: Metadata = {
  title: "Wolf's Journey Home",
  description: "A wolf's journey through data labeling challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={motleyForces.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
