import type { Metadata } from "next";
import "./globals.css";
import { motleyForces } from './fonts'

export const metadata: Metadata = {
  title: "Crypto Wolf Game",
  description: "A crypto sentiment trading game",
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
