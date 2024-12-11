import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      {/* Bottom Bar */}
      <div className="mt-12 border-t pt-8">
        <div className="flex flex-col items-center justify-between space-y-4 text-sm text-muted-foreground sm:flex-row sm:space-y-0">
          <p>© {new Date().getFullYear()} Potato-Trade. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link
              href="/terms"
              className="hover:text-orange-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-orange-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/cookies"
              className="hover:text-orange-600 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
