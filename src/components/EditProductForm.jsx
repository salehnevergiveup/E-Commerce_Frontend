import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getSingleProductDetails, editProduct, deleteProduct } from '@/services/product/product-service';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X } from 'lucide-react';
import S3MediaFacade from '@/services/mediaService/handle-media';
import Image from 'next/image';

const EditProductForm = ({ isOpen, onClose, productId, initialStatus, onSubmit }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    mediaBoolean: false,
    title: '',
    description: '',
    price: '',
    refundGuaranteedDuration: '',
    productStatus: initialStatus,
    productCategoryName: '',
    media: []
  });
  const [images, setImages] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updateMediaBoolean, setUpdateMediaBoolean] = useState(false);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      productStatus: initialStatus
    }));
  }, [initialStatus]);

  const fetchProductDetails = async (id) => {
    try {
      const productDetails = await getSingleProductDetails(id);
      if (productDetails) {
        setFormData(prevData => ({
          ...productDetails,
          price: productDetails.price.toString(),
          refundGuaranteedDuration: productDetails.refundGuaranteedDuration.toString(),
          productStatus: initialStatus,
        }));
        setImages(productDetails.media);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleStatusChange = (checked) => {
    setFormData(prevData => ({
      ...prevData,
      productStatus: checked ? 'available' : 'not available'
    }));
  };

  const handleImageSelection = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);

      // Validate each file size
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_IMAGE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`Each image must be smaller than 5MB. Removed ${oversizedFiles.length} oversized image(s).`);
        selectedFiles.splice(-oversizedFiles.length);
      }

      if (selectedFiles.length === 0) {
        return;
      }

      // Prepare media objects for upload
      const mediaInputs = selectedFiles.map(file => ({
        file,
        type: 'Product'
      }));

      try {
        // Upload selected images to S3
        const uploadedMedias = await S3MediaFacade.uploadMedias(mediaInputs);
        setImages(prev => [...prev, ...uploadedMedias].slice(0, 10)); // Limit to 10 images total
        setFormData(prevData => ({
          ...prevData,
          mediaBoolean: true
        }));
        setUpdateMediaBoolean(true);
        toast.success('Images uploaded successfully.');
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images. Please try again.');
      }
    }
  };

  const handleRemoveImage = useCallback(async (index) => {
    const mediaToRemove = images[index];
    if (!mediaToRemove) return;

    try {
      // Delete the image from S3
      await S3MediaFacade.deleteMedias([mediaToRemove.mediaUrl]);
      // Remove the image from local state
      setImages(prev => prev.filter((_, i) => i !== index));
      if (images.length === 1) {
        setFormData(prevData => ({
          ...prevData,
          mediaBoolean: false
        }));
      }
      setUpdateMediaBoolean(true);
      toast.success('Image removed successfully.');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to remove image. Please try again.');
    }
  }, [images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      productId,
      ...formData,
      categoryId: formData.categoryId,
      price: parseFloat(formData.price),
      refundGuaranteedDuration: parseInt(formData.refundGuaranteedDuration, 10),
      updateMediaBoolean,
      media: images.map(({ mediaUrl, updatedAt }) => ({
        id: null,
        mediaUrl,
        createdAt: null,
        updatedAt
      }))
    };

    try {
      const result = await editProduct(productData);
      if (result.success) {
        toast.success(result.message);
        onSubmit(productData);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    try {
      // Delete all associated images from S3
      if (images.length > 0) {
        await S3MediaFacade.deleteMedias(images.map(img => img.mediaUrl));
      }
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success(result.message);
        onSubmit();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleCancel = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmCancel = () => {
    setIsConfirmDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Input
                  id="categoryId"
                  name="categoryId"
                  value={formData.productCategoryName}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundGuaranteedDuration">Refund Duration (days)</Label>
                <Input
                  id="refundGuaranteedDuration"
                  name="refundGuaranteedDuration"
                  type="number"
                  value={formData.refundGuaranteedDuration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productStatus">Product Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="productStatus"
                  checked={formData.productStatus === 'available'}
                  onCheckedChange={handleStatusChange}
                  className="bg-orange-600 data-[state=checked]:bg-orange-600"
                />
                <Label htmlFor="productStatus" className={formData.productStatus === 'available' ? 'text-orange-600' : 'text-gray-500'}>
                  {formData.productStatus === 'available' ? 'Available' : 'Not Available'}
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Product Images (Max 10)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
                className="border p-2 rounded-md"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image.mediaUrl}
                      alt={`Product image ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
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
            <div className="space-y-2">
              <Label>Update Image Status</Label>
              <div className={`px-3 py-2 rounded-md ${updateMediaBoolean ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {updateMediaBoolean ? 'Update Image Included' : 'No Image Updates'}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700">Save Changes</Button>
              <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Delete Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Yes, cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep product</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Yes, delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditProductForm;

