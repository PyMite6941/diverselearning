import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AccessibilityController from "@/components/AccessibilityController";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DiverseLearning — 3D courses, made for you",
  description:
    "AI-generated, interactive 3D courses tailored to your interests. Explore concepts as models you can rotate and take apart.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#7c5cff",
              colorBackground: "#0e1022",
            },
          }}
        >
          <AccessibilityController />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}