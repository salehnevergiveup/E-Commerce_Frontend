import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProductCategories } from '@/services/category/category-service';
import { createProduct } from '@/services/product/product-service';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X } from 'lucide-react';
import S3MediaFacade from '@/services/mediaService/handle-media';
import Image from 'next/image';

const CreateProductForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    mediaBoolean: false,
    title: '',
    description: '',
    price: '',
    refundGuaranteedDuration: '',
    media: []
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptRef = useRef(0);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(
      formData.categoryId !== '' ||
      formData.title !== '' ||
      formData.description !== '' ||
      formData.price !== '' ||
      formData.refundGuaranteedDuration !== '' ||
      images.length > 0
    );
  }, [formData, images]);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getProductCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      categoryId: parseInt(value, 10)
    }));
  };

  const handleImageSelection = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);

      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_IMAGE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`Each image must be smaller than 5MB. Removed ${oversizedFiles.length} oversized image(s).`);
        selectedFiles.splice(-oversizedFiles.length);
      }

      if (selectedFiles.length === 0) {
        return;
      }

      const mediaInputs = selectedFiles.map(file => ({
        file,
        type: 'Product'
      }));

      try {
        const uploadedMedias = await S3MediaFacade.uploadMedias(mediaInputs);
        setImages(prev => [...prev, ...uploadedMedias].slice(0, 10));
        setFormData(prevData => ({
          ...prevData,
          mediaBoolean: true
        }));
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
      await S3MediaFacade.deleteMedias([mediaToRemove.mediaUrl]);
      setImages(prev => prev.filter((_, i) => i !== index));
      if (images.length === 1) {
        setFormData(prevData => ({
          ...prevData,
          mediaBoolean: false
        }));
      }
      toast.success('Image removed successfully.');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to remove image. Please try again.');
    }
  }, [images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentAttempt = ++submitAttemptRef.current;
    console.log(`Submit attempt ${currentAttempt}`);

    if (isSubmitting) {
      console.log('Submission already in progress, ignoring this attempt');
      return;
    }

    setIsSubmitting(true);
    console.log('Setting isSubmitting to true');

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      refundGuaranteedDuration: parseInt(formData.refundGuaranteedDuration, 10),
      media: images.map(({ mediaUrl, updatedAt }) => ({
        id: null,
        mediaUrl,
        createdAt: null,
        updatedAt
      }))
    };

    try {
      console.log('Calling createProduct API');
        onSubmit(productData);
        resetForm();
        onClose();
     
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      if (currentAttempt === submitAttemptRef.current) {
        console.log('Setting isSubmitting to false');
        setIsSubmitting(false);
      } else {
        console.log('A newer submission attempt has started, keeping isSubmitting true');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      mediaBoolean: false,
      title: '',
      description: '',
      price: '',
      refundGuaranteedDuration: '',
      media: []
    });
    setImages([]);
    setHasUnsavedChanges(false);
    submitAttemptRef.current = 0;
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setIsConfirmDialogOpen(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    resetForm();
    setIsConfirmDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">Create New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select onValueChange={handleCategoryChange} value={formData.categoryId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.productCategoryId} value={category.productCategoryId.toString()}>
                        {category.productCategoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="mt-2">
                <Label>Images Status</Label>
                <div className={`px-3 py-2 rounded-md ${formData.mediaBoolean ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {formData.mediaBoolean ? 'Images Included' : 'No Images'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-orange-600 text-white hover:bg-orange-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? All entered data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 text-white hover:bg-red-700">
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateProductForm;

