// pages/index.js
import React from "react";
import UserLayout from "@/layouts/user-layout";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Search, MapPin, ChevronDown, Moon, Sun } from "lucide-react";
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Heart, User, Star, Share2, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [selectedProduct, setSelectedProduct] = React.useState(null)
  const [likedProducts, setLikedProducts] = React.useState(new Set())

  // Sample product data
  const products = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Premium Headphones ${i + 1}`,
    description: "Experience crystal-clear sound with our premium headphones. These over-ear headphones feature advanced noise cancellation, comfortable ear cushions, and exceptional audio quality. Perfect for music enthusiasts and professionals alike.",
    price: 98.00,
    originalPrice: 200.00,
    brand: "JBL",
    productCode: `00${i + 1}`,
    availability: "In Stock",
    rating: 4,
    reviews: 122,
    category: "Electronics",
    image: "/placeholder.svg",
    createdAt: 9,
    seller: {
      name: `Seller ${i + 1}`,
      avatar: "/placeholder.svg",
    },
    likes: 10,
  }))

  const slides = [
    {
      image: "/assets/images/banner1.webp",
      title: "Discover Preloved Treasures",
      subtitle: "Shop sustainably. Find unique second-hand items and give them a new home.",
    },
    {
      image: "/assets/images/banner1.webp",
      title: "Trade with Confidence",
      subtitle: "Safe and secure trading platform for all your second-hand needs.",
    },
    {
      image: "/assets/images/banner1.webp",
      title: "Join Our Community",
      subtitle: "Connect with sellers and buyers who share your passion for sustainable shopping.",
    },
  ]

  const categories = [
    { name: "Electronics", icon: "💻" },
    { name: "Fashion", icon: "👕" },
    { name: "Home & Living", icon: "🏠" },
    { name: "Books", icon: "📚" },
    { name: "Sports", icon: "⚽" },
    { name: "Collectibles", icon: "🎨" },
    { name: "Others", icon: "📦" },
  ]

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer);
  }, [nextSlide])

  const toggleLike = (productId) => {
    setLikedProducts((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(productId)) {
        newLiked.delete(productId)
      } else {
        newLiked.add(productId)
      }
      return newLiked
    })
  }

  return (
    (<div>
      {/* Hero Slider */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={index} className="relative min-w-full h-[600px]">
              <Image src={slide.image} alt={slide.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50">
                <div
                  className="container mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
                  <h1 className="mb-6 text-5xl font-bold">{slide.title}</h1>
                  <p className="mb-8 text-xl">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 text-white hover:bg-black/75 rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 text-white hover:bg-black/75 rounded-full">
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${currentSlide === index ? "bg-orange-600" : "bg-white/50"
                }`}
              onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </section>
      {/* Categories */}
      <section className="border-b bg-background">
        <div className="container m-auto px-4 py-8">
          <h2 className="mb-6 text-2xl font-bold">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.name}
                href="#"
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:border-orange-600">
                <div className="text-3xl">{category.icon}</div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="flex-1 bg-background">
        <div className="container m-auto px-4 py-8">
          <h2 className="mb-6 text-2xl font-bold">Featured Items</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border">
                <div className="aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        {product.seller.avatar ? (
                          <Image
                            src={product.seller.avatar}
                            alt={product.seller.name}
                            fill
                            className="object-cover" />
                        ) : (
                          <User className="h-full w-full p-1" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{product.seller.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(product.createdAt, { addSuffix: true })}
                    </span>
                  </div>

                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">${product.price}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(product.id)}
                        className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            likedProducts.has(product.id) ? "fill-red-500 text-red-500" : "fill-none"
                          )} />
                        <span>{product.likes + (likedProducts.has(product.id) ? 1 : 0)}</span>
                      </button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedProduct && (
            <>
              <div className="bg-white">
                <div className="flex justify-end items-center p-2  bg-white rounded-t-lg">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
                <div className="grid md:grid-cols-2 gap-0 bg-white">
                  {/* Left side - Product Image */}
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Right side - Product Details */}
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-md font-bold">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < selectedProduct.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 fill-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {selectedProduct.reviews} reviews
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Brand</span>
                        <span>{selectedProduct.brand}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Product Code</span>
                        <span>{selectedProduct.productCode}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-orange-600">
                          ${selectedProduct.price.toFixed(2)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ${selectedProduct.originalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => { }}>
                        Buy Now
                      </Button>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>)
  );
}


console.log("UserLayout:", UserLayout); // Should log the function/component


// // Define the layout for this page
HomePage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};