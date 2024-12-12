// components/UserLayout.js
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes"; // Import directly from next-themes
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatAssistantPreviewComponent from "@/components/chat-assistant-preview";

const inter = Inter({ subsets: ["latin"] });

export default function UserLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={`${inter.className} relative min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
          <ChatAssistantPreviewComponent />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
