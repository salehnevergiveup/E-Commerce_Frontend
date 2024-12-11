'use client';
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'

export function ReviewDetailsModal({
  review,
  onClose
}) {
  if (!review) return null

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? "text-yellow-500 fill-yellow-500" 
            : "text-gray-300"
        }`} />
    ));
  }

  return (
    (<Dialog open={!!review} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <div className="flex items-start gap-4">
            <Image
              src={review.buyer.medias[0]?.mediaUrl || "/placeholder.svg"}
              alt={review.buyer.name}
              width={60}
              height={60}
              className="rounded-full" />
            <div>
              <h3 className="font-semibold">{review.buyer.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.rating)}
              </div>
            </div>
          </div>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Image
                  src={review.product.image || "/placeholder.svg"}
                  alt={review.product.title}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover" />
                <div>
                  <h4 className="font-semibold">{review.product.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Price: RM{review.product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h4 className="font-semibold mb-2">Review Comment</h4>
            <p className="text-gray-700">{review.reviewComment}</p>
          </div>

          {review.medias && review.medias.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Review Images</h4>
              <div className="grid grid-cols-3 gap-4">
                {review.medias.map((media) => (
                  <Image
                    key={media.id}
                    src={media.mediaUrl}
                    alt="Review image"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Reviewed on {new Date(review.product.createdAt).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>)
  );
}

