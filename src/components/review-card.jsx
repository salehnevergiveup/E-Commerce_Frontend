// components/ReviewCard.jsx

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PropTypes from "prop-types"; // Ensure PropTypes is installed

export function ReviewCard({ review }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? "text-orange-500" : "text-gray-300"}
      >
        ★
      </span>
    ));
  };

  // Safely access user profile media
  const userProfileMedia =
    review.user?.medias?.find((media) => media.type === "User_Profile");
  const userProfileImageUrl = userProfileMedia
    ? userProfileMedia.mediaUrl
    : "/placeholder.svg";

  // Safely access product image
  const productImageUrl =
    review.product?.medias?.[0]?.mediaUrl || "https://potato-trade.s3.ap-southeast-1.amazonaws.com/placeholder.png";

  // Safely access product price
  const productPrice =
    typeof review.product?.price === "number"
      ? review.product.price.toFixed(2)
      : "0.00";

  return (
    <Card className="border border-gray-200 rounded-lg shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <div className="flex items-center gap-4 mb-4 h-16 w-16">
              <Image
                src={userProfileImageUrl}
                alt={`${review.user.name}'s profile`}
                width={100}
                height={100}
                className="rounded-full object-cover w-full h-full"
              />
              <div>
                <h3 className="font-semibold">{review.user.name || "Anonymous"}</h3>
                <Badge variant="secondary" className="bg-gray-100 flex items-center gap-2 text-lg">
                  {renderStars(review.rating)} ({review.rating}/5)
                </Badge>
              </div>
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-lg font-semibold mb-2">{review.product.title || "Untitled Product"}</h2>
            <div className="flex gap-4 mb-4">
              <Image
                src={productImageUrl}
                alt={`${review.product.title} Image`}
                width={100}
                height={100}
                className="rounded object-cover"
              />
              <p className="text-gray-700 flex-1">
                {review.reviewComment || "No comment provided."}
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Reviewed on {new Date(review.createdAt).toLocaleDateString()}
              </span>
              <span className="text-lg font-bold text-green-600">
                Price: RM{review.product.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        {review.medias && review.medias.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Review Images</h4>
            <div className="flex gap-2 flex-wrap">
              {review.medias.map((media, index) => (
                <div key={media.id} className="relative cursor-pointer">
                  <Image
                    src={media.mediaUrl}
                    alt={`Review Media ${media.id}`}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                    onClick={() => openLightbox(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl p-0 bg-white">
            <div className="relative w-full h-[80vh]">
              <Image
                src={review.medias[photoIndex]?.mediaUrl}
                alt={`Review image ${photoIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
// Define PropTypes for type checking
ReviewCard.propTypes = {
  review: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string,
      medias: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          type: PropTypes.string.isRequired,
          mediaUrl: PropTypes.string.isRequired,
        })
      ),
    }).isRequired,
    product: PropTypes.shape({
      title: PropTypes.string,
      price: PropTypes.number,
      medias: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          type: PropTypes.string.isRequired,
          mediaUrl: PropTypes.string.isRequired,
        })
      ),
    }).isRequired,
    reviewComment: PropTypes.string,
    rating: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    medias: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        mediaUrl: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};
