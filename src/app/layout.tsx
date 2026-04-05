import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Newsreader, Archivo, Geist_Mono } from "next/font/google";
import { LazyMotion, domAnimation } from "motion/react";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MedAssist AI - Healthcare Document Chat",
  description:
    "AI-powered healthcare document search assistant. Upload medical documents and get accurate, cited answers using RAG technology.",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement => {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${archivo.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </body>
    </html>
  );
};

export default RootLayout;
