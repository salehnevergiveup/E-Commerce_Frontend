
'use client'

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Mail, ShoppingBag } from "lucide-react"

export default function Footer() {
  return (
    (
      <footer className="bg-[#fafafa] text-gray-600 border-t border-gray-200 ">
        <div className="container mx-auto px-4 pt-4 pb-2">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-orange-500" />
              <span className="font-bold text-[#FF4405]">Potato-Trade</span>
            </div>

            <div className="flex space-x-6">
              <Link
                href="https://twitter.com"
                className="text-orange-400 hover:text-[#FF4405] transition-colors"
                target="_blank"
                rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://facebook.com"
                className="text-orange-400 hover:text-[#FF4405] transition-colors"
                target="_blank"
                rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-orange-400 hover:text-[#FF4405] transition-colors"
                target="_blank"
                rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="mailto:contact@example.com"
                className="text-orange-400 hover:text-[#FF4405] transition-colors"
                target="_blank"
                rel="noopener noreferrer">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          <div className="container mx-auto px-3 pt-3">
            <p className="text-center text-sm text-orange-500">
              © {new Date().getFullYear()} Potato-Trade. All rights reserved.
            </p>
          </div>
        </div>

      </footer>)
  );
}
