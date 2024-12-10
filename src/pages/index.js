import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import UserLayout from "@/layouts/user-layout"
import { getProductCategories } from '@/services/category/category-service'
import { getAllProducts, getProductsByCategory } from '@/services/product/product-service'
import { Flame, ChevronRight, ChevronLeft, X, ChevronsLeft } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import LoginForm from "@/components/login-form"
import { useRouter } from 'next/router'
import ProductDetailsDialog from '@/components/ProductDetailsDialog'
import { useAuth } from "@/contexts/auth-context"
import { addToCart } from "@/services/shopping-cart/shopping-cart-service"
import { toast } from 'react-toastify'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollContainerRef = useRef(null)
  const productContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAllCategoriesDialog, setShowAllCategoriesDialog] = useState(false)
  const [showSlideLeftButton, setShowSlideLeftButton] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productDetailsOpen, setProductDetailsOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const banners = [
    { title: "Welcome to Potato-Trade", subtitle: "Your one-stop shop for all things potato!" },
    { title: "Instant Rebate!", subtitle: "Get Rebate off on all potato products" },
    { title: "New Listings!", subtitle: "Check out our latest potato varieties" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [fetchedCategories, fetchedProducts] = await Promise.all([
          getProductCategories(),
          getAllProducts(),
        ])
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories.sort((a, b) => (b.numberOfItems || 0) - (a.numberOfItems || 0)).slice(0, 10))
        } else {
          setCategories([])
        }
        setAllProducts(fetchedProducts.slice(0, 10))
        setDisplayedProducts(fetchedProducts.slice(0, 10))
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleMouseDown = (e, ref) => {
    setIsDragging(true)
    setStartX(e.pageX - ref.current.offsetLeft)
    setScrollLeft(ref.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e, ref) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX) * 2
    ref.current.scrollLeft = scrollLeft - walk
  }

  useEffect(() => {
    const container = productContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10
      setShowSlideLeftButton(isAtEnd)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const slideToStart = () => {
    if (productContainerRef.current) {
      productContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setProductDetailsOpen(true)
  }

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId)
    setShowAllCategoriesDialog(false)
    setIsLoading(true)
    try {
      const fetchedProducts = await getProductsByCategory(categoryId)
      setAllProducts(fetchedProducts.slice(0, 10))
      setDisplayedProducts(fetchedProducts.slice(0, 10))
    } catch (err) {
      console.error('Error fetching products by category:', err)
      setError('Failed to load products for this category. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowAllCategories = () => {
    setShowAllCategoriesDialog(true)
  }

  const handleRevertToAllProducts = () => {
    setSelectedCategory(null)
    setDisplayedProducts(allProducts.slice(0, 10))
  }

  const sortedCategories = [...categories].sort((a, b) => 
    a.productCategoryName.localeCompare(b.productCategoryName)
  )

  const handleAddToCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const result = await addToCart(productId)
        if (result.success) {
          toast.success(result.message)
          // Refresh the product section
          const updatedProducts = await getAllProducts()
          setAllProducts(updatedProducts)
          setDisplayedProducts(updatedProducts.slice(0, 10))
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('Failed to add product to cart. Please try again.')
      }
    } else {
      toast.warning('You must login first to add items to your cart.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section (Banner) */}
      <section className="mb-12">
        <div 
          className="bg-orange-600 text-white rounded-lg p-8 text-center relative cursor-pointer"
        >
          <ChevronLeft 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer" 
            size={24} 
            onClick={prevBanner}
          />
          <h1 className="text-4xl font-bold mb-4">{banners[currentBanner].title}</h1>
          <p className="text-xl mb-6">{banners[currentBanner].subtitle}</p>
          <ChevronRight 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer" 
            size={24} 
            onClick={nextBanner}
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Categories</h2>
          {categories.length > 0 && (
            <Button onClick={handleShowAllCategories}>View All Categories</Button>
          )}
        </div>
        {isLoading ? (
          <p>Loading categories...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : categories.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="overflow-x-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleMouseDown(e, scrollContainerRef)}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={(e) => handleMouseMove(e, scrollContainerRef)}
          >
            <div className="flex space-x-4 pb-4">
              {categories.map((category) => (
                <Button
                  key={category.productCategoryId}
                  variant="outline"
                  className={`text-sm whitespace-nowrap flex-shrink-0 flex flex-col items-center p-4 h-auto ${
                    selectedCategory === category.productCategoryId ? 'bg-orange-100' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.productCategoryId)}
                >
                  <span className="text-lg font-semibold mb-1">{category.productCategoryName}</span>
                  <span className="text-xs text-green-500 flex items-center">
                    <Flame className="w-3 h-3 mr-1" />
                    {category.rebateRate}% rebate
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory 
              ? `Products in ${categories.find(c => c.productCategoryId === selectedCategory)?.productCategoryName}`
              : 'All Products'}
          </h2>
          <div className="flex gap-2">
            {selectedCategory && (
              <Button onClick={handleRevertToAllProducts} variant="outline">
                Clear Category
              </Button>
            )}
            <Button onClick={() => router.push('/all-product')}>
              View All Products
            </Button>
          </div>
        </div>
        {isLoading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : displayedProducts.length === 0 ? (
          <p>No products available in this category.</p>
        ) : (
          <div className="relative">
            <div 
              ref={productContainerRef}
              className="overflow-x-auto cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => handleMouseDown(e, productContainerRef)}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={(e) => handleMouseMove(e, productContainerRef)}
            >
              <div className="flex gap-6 pb-4">
                {displayedProducts.map((product) => (
                  <Card 
                    key={product.productId} 
                    className="flex-shrink-0 w-[300px] hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer">
                        <Image
                          src={product.media?.[0]?.mediaUrl || "/placeholder.svg"}
                          alt={product.title || "Product Image"}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover mb-4 rounded-md"
                        />
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-orange-600">
                            {product.productCategoryName}
                          </div>
                          <h3 className="text-xl font-bold line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Seller: {product.userName}
                          </p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-orange-600">
                              ${(product.price != null ? parseFloat(product.price).toFixed(2) : "0.00")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.productId);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {!showSlideLeftButton && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-l-lg">
                <ChevronRight className="text-orange-600" size={24} />
              </div>
            )}
            {showSlideLeftButton && (
              <Button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700"
                onClick={slideToStart}
              >
                <ChevronsLeft className="mr-2" size={16} />
                Slide to start
              </Button>
            )}
          </div>
        )}
      </section>

      {/* All Categories Dialog */}
      <Dialog open={showAllCategoriesDialog} onOpenChange={setShowAllCategoriesDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">All Categories</h2>
            <Button variant="ghost" onClick={() => setShowAllCategoriesDialog(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4">
            {sortedCategories.map((category) => (
              <Button
                key={category.productCategoryId}
                variant="outline"
                className={`w-full justify-between ${
                  selectedCategory === category.productCategoryId ? 'bg-orange-100' : ''
                }`}
                onClick={() => handleCategoryClick(category.productCategoryId)}
              >
                <span>{category.productCategoryName}</span>
                <span className="text-sm text-gray-500">({category.numberOfItems})</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          isOpen={productDetailsOpen}
          onClose={() => setProductDetailsOpen(false)}
          isAuthenticated={isAuthenticated}
          onProductAdded={async () => {
            const updatedProducts = await getAllProducts()
            setAllProducts(updatedProducts.slice(0, 10))
            setDisplayedProducts(updatedProducts.slice(0, 10))
          }}
        />
      )}
    </div>
  )
}

HomePage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>
}

export default HomePage

