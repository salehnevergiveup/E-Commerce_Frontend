import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UserLayout from "@/layouts/user-layout"
import { getAllProducts, getProductsByCategory } from '@/services/product/product-service'
import { getProductCategories } from '@/services/category/category-service'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Search, X, Flame } from 'lucide-react'
import ProductDetailsDialog from '@/components/ProductDetailsDialog'
import { useAuth } from "@/contexts/auth-context"
import { addToCart } from "@/services/shopping-cart/shopping-cart-service"
import { toast } from 'react-toastify'

const SelectedCategoryInfo = ({ category }) => (
  <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4 rounded-r-lg shadow-md">
    <h3 className="text-lg font-semibold text-orange-800">{category.productCategoryName}</h3>
    <p className="text-orange-600">
      Rebate: <span className="font-bold">{category.rebateRate}%</span>
    </p>
  </div>
);

function AllProductsPage() {
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productDetailsOpen, setProductDetailsOpen] = useState(false)
  const productsPerPage = 20

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getAllProducts(),
          getProductCategories()
        ])
        setProducts(fetchedProducts)
        setFilteredProducts(fetchedProducts)
        setCategories(fetchedCategories)
      } catch (err) {
        setError('Failed to load data. Please try again later.')
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const fetchCategoryProducts = async () => {
        setIsLoading(true)
        try {
          const categoryProducts = await getProductsByCategory(selectedCategory)
          setFilteredProducts(categoryProducts)
        } catch (err) {
          console.error('Error fetching products by category:', err)
          setError('Failed to load products for this category. Please try again later.')
        }
        setIsLoading(false)
      }
      fetchCategoryProducts()
    } else {
      setFilteredProducts(products)
    }
  }, [selectedCategory, products])

  useEffect(() => {
    filterProducts()
  }, [searchTerm])

  const filterProducts = () => {
    let result = selectedCategory ? filteredProducts : products
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      result = result.filter(product => 
        product.title.toLowerCase().includes(lowercasedTerm) ||
        product.description.toLowerCase().includes(lowercasedTerm)
      )
    }
    setFilteredProducts(result)
    setCurrentPage(1)
  }

  const handleCategoryClick = async (categoryId) => {
    setSelectedCategory(categoryId);
    setCategoryDialogOpen(false);
    const selectedCategory = categories.find(cat => cat.productCategoryId === categoryId);
    setSelectedCategoryDetails(selectedCategory);
    const categoryProducts = await getProductsByCategory(categoryId);
    setFilteredProducts(categoryProducts);
    setCurrentPage(1);
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterProducts()
  }

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCategoryDetails(null);
    setSearchTerm('');
    setFilteredProducts(products);
    setCurrentPage(1);
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setProductDetailsOpen(true)
  }

  const handleAddToCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const result = await addToCart(productId)
        if (result.success) {
          toast.success(result.message)
          // Refresh the product section
          const updatedProducts = await getAllProducts()
          setProducts(updatedProducts)
          setFilteredProducts(updatedProducts)
          applyFilters(updatedProducts)
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

  const applyFilters = (products) => {
    let filtered = products
    if (selectedCategory) {
      filtered = filtered.filter(product => product.productCategoryId === selectedCategory)
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(lowercasedTerm) ||
        product.description.toLowerCase().includes(lowercasedTerm)
      )
    }
    setFilteredProducts(filtered)
  }

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading products...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        <div className="flex gap-2 mb-4">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">View Categories</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <h2 className="text-lg font-semibold mb-4">Select a Category</h2>
              <div className="grid gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.productCategoryId}
                    variant={selectedCategory === category.productCategoryId ? "secondary" : "outline"}
                    onClick={() => handleCategoryClick(category.productCategoryId)}
                    className="w-full justify-between"
                  >
                    <span>{category.productCategoryName}</span>
                    <span className="text-sm text-gray-500">({category.numberOfItems})</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          {(selectedCategory || searchTerm) && (
            <Button onClick={clearFilters} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
        {selectedCategoryDetails && (
          <SelectedCategoryInfo category={selectedCategoryDetails} />
        )}
        <div className="text-sm text-gray-600 mb-4">
          {filteredProducts.length} items found
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentProducts.map((product) => (
          <Card key={product.productId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div onClick={() => handleProductClick(product)} className="cursor-pointer">
                <Image
                  src={product.media?.[0]?.mediaUrl || "/placeholder.svg"}
                  alt={product.title || "Product Image"}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover mb-4 rounded-md"
                />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-orange-600">
                    {product.productCategoryName}
                  </div>
                  <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    Seller: {product.userName}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-orange-600">
                      ${(product.price != null ? parseFloat(product.price).toFixed(2) : "0.00")}
                    </span>
                    <span className="text-xs text-green-500 flex items-center">
                      <Flame className="w-3 h-3 mr-1" />
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

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center space-x-4">
        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-lg font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetailsDialog
          product={selectedProduct}
          isOpen={productDetailsOpen}
          onClose={() => setProductDetailsOpen(false)}
          isAuthenticated={isAuthenticated}
          onProductAdded={async () => {
            const updatedProducts = await getAllProducts()
            setProducts(updatedProducts)
            setFilteredProducts(updatedProducts)
          }}
        />
      )}
    </div>
  )
}

AllProductsPage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>
}

export default AllProductsPage

