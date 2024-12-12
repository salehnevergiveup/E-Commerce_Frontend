// components/rating-modal.jsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import sendRequest from "@/services/requests/request-service"; // Import sendRequest
import RequestMethods from "@/enums/request-methods"; // Import RequestMethods
import { mockProducts } from '../../data/mock'; // Ensure correct path
import { toast } from 'react-toastify'; // Import toast from react-toastify
import S3MediaFacade from '@/services/mediaService/handle-media'; // Import S3MediaFacade

export function RatingModal({
  isOpen,
  onClose,
  productId
}) {
  const { user } = useAuth(); // Get authenticated user
  const product = mockProducts.find(p => p.id === productId);
  const [images, setImages] = useState([]); // Array of HandleMedia objects
  const [rating, setRating] = useState({
    seller_service: 3,
    product_completion: 3,
    product_packaging: 3,
    product_price: 3,
    review_comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Handle image selection and upload to S3
  const handleImageSelection = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);

      // Validate each file size
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_IMAGE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`Each image must be smaller than 5MB. Removed ${oversizedFiles.length} oversized image(s).`);
        // Remove oversized files
        selectedFiles.splice(-oversizedFiles.length);
      }

      if (selectedFiles.length === 0) {
        return;
      }

      // Prepare media objects for upload
      const mediaInputs = selectedFiles.map(file => ({
        file,
        type: 'Review' // Assign type as needed
      }));

      try {
        // Upload selected images to S3
        const uploadedMedias = await S3MediaFacade.uploadMedias(mediaInputs);
        setImages(prev => [...prev, ...uploadedMedias].slice(0, 5)); // Limit to 5 images total
        toast.success('Images uploaded successfully.');
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images. Please try again.');
      }
    }
  };

  // Handle image removal
  const handleRemoveImage = async (index) => {
    const mediaToRemove = images[index];
    if (!mediaToRemove) return;

    try {
      // Delete the image from S3
      await S3MediaFacade.deleteMedias([mediaToRemove.mediaUrl]);
      // Remove the image from local state
      setImages(prev => prev.filter((_, i) => i !== index));
      toast.success('Image removed successfully.');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to remove image. Please try again.');
    }
  };

  // Calculate the average rating
  const calculateAverageRating = () => {
    const { seller_service, product_completion, product_packaging, product_price } = rating;
    const total = seller_service + product_completion + product_packaging + product_price;
    return Math.floor(Math.round((total / 4) * 10) / 10); // Rounded to one decimal place
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    // Basic validation
    if (rating.review_comment.trim() === '') {
      toast.error("Please enter a review comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate average rating
      const averageRating = calculateAverageRating();

      // Prepare the review payload
      const payload = {
        productId,
        rating: averageRating, // Single average rating
        reviewComment: rating.review_comment, // Correct casing
        medias: images // Array of HandleMedia objects
      };

      // Send review request to the backend
      const response = await sendRequest(
        RequestMethods.POST,
        `/review`, // Correct Endpoint (Ensure backend endpoint is /Review)
        payload,
        true // Authentication required
      );

      if (response.success) {
        toast.success("Review submitted successfully!");
        // Reset component state
        setRating({
          seller_service: 3,
          product_completion: 3,
          product_packaging: 3,
          product_price: 3,
          review_comment: ''
        });
        setImages([]);
        onClose();
      } else {
        toast.error(`Failed to submit review: ${response.message}`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An unexpected error occurred while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-lg p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Rate Your Purchase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rating Sliders */}
          {["seller_service", "product_completion", "product_packaging", "product_price"].map((category) => (
            <div key={category} className="grid gap-2">
              <Label className="capitalize">
                {category.replace('_', ' ')}:
              </Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[rating[category]]}
                onValueChange={([value]) => setRating(prev => ({ ...prev, [category]: value }))}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-right">{rating[category]}/5</div>
            </div>
          ))}

          {/* Review Comment */}
          <div className="grid gap-2">
            <Label>Review Comment</Label>
            <Textarea
              value={rating.review_comment}
              onChange={(e) => setRating(prev => ({ ...prev, review_comment: e.target.value }))}
              placeholder="Write your review here..."
              className="min-h-[100px]"
            />
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label>Upload Images (Max 5)</Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((media, index) => (
                <div key={index} className="relative">
                  <Image
                    src={media.mediaUrl}
                    alt={`Review image ${index + 1}`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelection}
                    multiple
                  />
                  <span className="text-2xl text-muted-foreground">+</span>
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#ee4d2d] hover:bg-[#ee4d2d]/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
