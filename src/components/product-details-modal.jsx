import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, DollarSign, RefreshCcw, User } from 'lucide-react'

export function ProductDetailsModal({
  product,
  onClose
}) {
  if (!product) return null

  return (
    (<Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="flex items-start gap-4">
            <Image
              src={product.media?.[0]?.mediaUrl || "/placeholder.svg"}
              alt={product.title}
              width={100}
              height={100}
              className="rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-xl">{product.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ID: {product.productId}
              </p>
            </div>
          </div>

          <Card className="bg-white">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700">{product.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Price</h4>
                  <p className="text-lg">RM{product.price.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">Refund Duration</h4>
                  <p className="text-lg">{product.refundGuaranteedDuration} days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white">
            <CardContent className="p-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-semibold">Seller</h4>
                <p className="text-lg">{product.userName}</p>
                <p className="text-sm text-muted-foreground">User ID: {product.userId}</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created on {new Date(product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>)
  );
}

