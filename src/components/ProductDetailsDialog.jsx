import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from 'next/image'
import { Star, User } from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"
import { addToCart } from "@/services/shopping-cart/shopping-cart-service"
import { toast } from 'react-toastify'

const ProductDetailsDialog = ({ product, isOpen, onClose, isAuthenticated, onProductAdded }) => {
  const { isAuthenticated: authIsAuthenticated } = useAuth()
  const staticReviews = [
    { id: 1, rating: 5, comment: "Great seller! Very responsive and shipped quickly.", author: "John Doe", profilePic: "/placeholder.svg" },
    { id: 2, rating: 4, comment: "Good experience overall. Product as described.", author: "Jane Smith", profilePic: "/placeholder.svg" },
    { id: 3, rating: 5, comment: "Excellent service and product quality.", author: "Mike Johnson", profilePic: "/placeholder.svg" },
    { id: 4, rating: 3, comment: "Product was okay, but shipping took longer than expected.", author: "Sarah Brown", profilePic: "/placeholder.svg" },
    { id: 5, rating: 5, comment: "Absolutely love it! Will definitely buy from this seller again.", author: "Chris Lee", profilePic: "/placeholder.svg" },
  ]

  const averageRating = staticReviews.reduce((acc, review) => acc + review.rating, 0) / staticReviews.length

  const handleAddToCart = async () => {
    if (isAuthenticated) {
      try {
        const result = await addToCart(product.productId)
        if (result.success) {
          toast.success(result.message)
          onProductAdded() // Call this function to refresh the product section
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

  const styles = `
  .reviews-scroll-area {
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
  }
  .reviews-scroll-area::-webkit-scrollbar {
    display: none;  /* WebKit */
  }
`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] overflow-hidden bg-white p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Details */}
          <div className="overflow-y-auto pr-4">
            <div className="space-y-6">
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex w-max space-x-4 p-4">
                  {product.media && product.media.length > 0 ? (
                    product.media.map((image, index) => (
                      <div key={index} className="w-[250px] flex-shrink-0">
                        <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
                          <Image
                            src={image.mediaUrl || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-[250px] flex-shrink-0">
                      <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Product Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="text-3xl font-bold text-orange-600">${parseFloat(product.price).toFixed(2)}</p>
                  <p className="text-xl font-semibold">{product.productCategoryName}</p>
                  <p><span className="font-medium">Rebate:</span> {product.rebateRate}%</p>
                  <p><span className="font-medium">Refund Guarantee:</span> {product.refundGuaranteedDuration} days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seller Information and Reviews */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.svg"
                    alt={`${product.userName}'s profile`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{product.userName}</h3>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)} out of 5</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h4 className="text-lg font-semibold mb-2">Seller Reviews</h4>
              <ScrollArea className="h-[400px] reviews-scroll-area">
                <div className="space-y-4 pr-4">
                  {staticReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <Image
                              src={review.profilePic}
                              alt={`${review.author}'s profile`}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="mr-2">Close</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </DialogFooter>
        <style>{styles}</style>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailsDialog

