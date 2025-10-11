import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { AppContextProvider } from "@/context/AppContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "deepSeek",
  description: "Full Stack Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ClerkProvider>
          <AppContextProvider>
            <Toaster
              toastOptions={{
                success: { style: { background: "black", color: "white" } },
                error: { style: { background: "black", color: "white" } },
              }}
            />
            {children}
          </AppContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
