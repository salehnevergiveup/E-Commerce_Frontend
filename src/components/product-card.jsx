import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ProductCard({
  product,
  onRate,
  onRefund
}) {
  return (
    (<Card className="p-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Image
            src={product.medias[0]?.mediaUrl || '/placeholder.svg'}
            alt={product.title}
            width={100}
            height={100}
            className="rounded-lg object-cover" />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold">{product.title}</h3>
          <p className="text-sm text-muted-foreground">{product.category.product_category_name}</p>
          <p className="text-lg font-bold text-[#ee4d2d] mt-2">RM{product.price.toFixed(2)}</p>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          {product.status === 'to_pay' && (
            <Button className="bg-[#ee4d2d] hover:bg-[#ee4d2d]/90">
              Pay Now
            </Button>
          )}
          {product.status === 'completed' && (
            <Button
              variant="outline"
              className="border-[#ee4d2d] text-[#ee4d2d] hover:bg-[#ee4d2d]/10"
              onClick={onRate}>
              Rate
            </Button>
          )}
          {product.status === 'refund' && (
            <Button
              variant="outline"
              className="border-[#ee4d2d] text-[#ee4d2d] hover:bg-[#ee4d2d]/10"
              onClick={onRefund}>
              Review/Comment
            </Button>
          )}
        </div>
      </div>
    </Card>)
  );
}

