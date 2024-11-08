import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Mail } from "lucide-react"

export default function Footer() {
  return (
    (<footer className="border-t bg-background">
      <div className="container px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Potato-Trade</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for buying and selling pre-loved items. Join our community and trade sustainably.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-600 transition-colors"
                aria-label="Follow us on Facebook">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-600 transition-colors"
                aria-label="Follow us on Twitter">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-orange-600 transition-colors"
                aria-label="Follow us on Instagram">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@potato-trade.com"
                className="text-muted-foreground hover:text-orange-600 transition-colors"
                aria-label="Contact us via email">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/category/electronics"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fashion"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/category/home-living"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link
                  href="/category/books"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href="/category/sports"
                  className="text-muted-foreground hover:text-orange-600 transition-colors">
                  Sports & Hobbies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="border-orange-200 focus:border-orange-500" />
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div
            className="flex flex-col items-center justify-between space-y-4 text-sm text-muted-foreground sm:flex-row sm:space-y-0">
            <p>© {new Date().getFullYear()} Potato-Trade. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/terms" className="hover:text-orange-600 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-orange-600 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-orange-600 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>)
  );
}