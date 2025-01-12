
import Navbar from "../Components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthContextProvider } from "../app/context/AuthContext";
import { DarkModeProvider } from "./DarkModeContext";
import Ai from "@/Components/Ai/Ai";
import Cursor from "@/Components/Cursor/Cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BiteBox",
  description: "Get the Recipes for any Cuisines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <AuthContextProvider>
        <DarkModeProvider>
        <div className="relative min-h-screen">
          <div className="top-0 left-0 right-0 ">
          <Navbar />
          </div>
          <div className="-z-50">
          <div className="fixed inset-0 pointer-events-none z-50">
          <Cursor />
          </div>
          {children}
          </div>
        </div>
        <Ai />
        </DarkModeProvider>
      </AuthContextProvider>
      </body>
    </html>
  );
}