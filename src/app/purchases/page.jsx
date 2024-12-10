import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { mockProducts } from '@/data/mock'
import { ProductCard } from './product-card'
import { RatingModal } from './rating-modal'
import { RefundModal } from './refund-modal'

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const filteredProducts = mockProducts.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    (<div className="container mx-auto p-4 max-w-5xl">
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="You can search by Seller Name, Order ID or Product name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="to_pay">To Pay</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="refund">Return/Refund</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onRate={() => {
                  setSelectedProduct(product.id)
                  setIsRatingModalOpen(true)
                }}
                onRefund={() => {
                  setSelectedProduct(product.id)
                  setIsRefundModalOpen(true)
                }} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="to_pay">
          <div className="space-y-4">
            {filteredProducts
              .filter(product => product.status === 'to_pay')
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRate={() => {
                    setSelectedProduct(product.id)
                    setIsRatingModalOpen(true)
                  }}
                  onRefund={() => {
                    setSelectedProduct(product.id)
                    setIsRefundModalOpen(true)
                  }} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {filteredProducts
              .filter(product => product.status === 'completed')
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRate={() => {
                    setSelectedProduct(product.id)
                    setIsRatingModalOpen(true)
                  }}
                  onRefund={() => {
                    setSelectedProduct(product.id)
                    setIsRefundModalOpen(true)
                  }} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="refund">
          <div className="space-y-4">
            {filteredProducts
              .filter(product => product.status === 'refund')
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRate={() => {
                    setSelectedProduct(product.id)
                    setIsRatingModalOpen(true)
                  }}
                  onRefund={() => {
                    setSelectedProduct(product.id)
                    setIsRefundModalOpen(true)
                  }} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setSelectedProduct(null)
        }}
        productId={selectedProduct} />
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false)
          setSelectedProduct(null)
        }}
        productId={selectedProduct} />
    </div>)
  );
}

