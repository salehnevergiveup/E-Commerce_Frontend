import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserLayout from "@/layouts/user-layout";
import { Toaster, toast } from "react-hot-toast";
import Image from 'next/image';
import {getAvailableProducts,getNotAvailableProducts,getSoldOutProducts,getRequestRefundProducts, createProduct} from '@/services/product/product-service'
import {cancelRefundRequest, acceptRefundRequest, getRefundBuyerItemId} from '@/services/buyer-item/buyer-item-service'
import CreateProductForm from '@/components/CreateProductForm';
import EditProductForm from '@/components/EditProductForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function MyListingsPage() {
  const [listings, setListings] = useState({
    available: [],
    notAvailable: [],
    soldOut: [],
    refundRequest: []
  });
  const [activeTab, setActiveTab] = useState('available');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductStatus, setSelectedProductStatus] = useState(''); // Added state for selected product status
  const [confirmationDialog, setConfirmationDialog] = useState({ isOpen: false, type: null, itemId: null });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      let data;
      switch (activeTab) {
        case 'available':
          data = await getAvailableProducts();
          break;
        case 'notAvailable':
          data = await getNotAvailableProducts();
          break;
        case 'soldOut':
          data = await getSoldOutProducts();
          break;
        case 'refundRequest':
          data = await getRequestRefundProducts();
          break;
        default:
          data = await getAvailableProducts();
      }
      setListings(prev => ({ ...prev, [activeTab]: data }));
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("An error occurred while fetching listings.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = listings[activeTab].filter(item =>
    item.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderListings = () => {
    if (paginatedListings.length === 0) {
      return <p className="text-center py-4">No listings found</p>;
    }

    return (
      <div className="space-y-4">
        {paginatedListings.map((item) => (
          <ListingCard 
            key={item.productId} 
            item={item} 
           
            onEdit={() => handleEditProduct(item.productId, item.productStatus)} // Updated onEdit prop
            onRejectRefund={() => openConfirmationDialog('reject', item.productId)}
            onAcceptRefund={() => openConfirmationDialog('accept', item.productId)}
            activeTab={activeTab}
          />
        ))}
      </div>
      
    );
  };

  const handleCreateProduct = async (formData) => {
    try {
      const result = await createProduct(formData);
      if (result.success) {
        toast.success(result.message);
        await fetchListings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
    setIsCreateFormOpen(false);
  };

  const handleEditProduct = (productId, productStatus) => { // Updated handleEditProduct function
    setSelectedProductId(productId);
    setSelectedProductStatus(productStatus);
    setIsEditFormOpen(true);
  };

  const handleEditSubmit = async () => {
    await fetchListings();
    setIsEditFormOpen(false);
    setSelectedProductId(null);
    setSelectedProductStatus(''); // Reset selectedProductStatus after submit
  };

  const openConfirmationDialog = (type, itemId) => {
    setConfirmationDialog({ isOpen: true, type, itemId });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({ isOpen: false, type: null, itemId: null });
  };

  const handleConfirmAction = async () => {
    const { type, itemId } = confirmationDialog;
    let result;

    try {
      // First, get the BuyerItemId
      const buyerItemResponse = await getRefundBuyerItemId(itemId);
      if (!buyerItemResponse.success || !buyerItemResponse.data) {
        toast.error(buyerItemResponse.message || "Failed to retrieve buyer item ID");
        closeConfirmationDialog();
        return;
      }

      const buyerItemId = buyerItemResponse.data.buyerItemId;

      // Now proceed with the refund action using the BuyerItemId
      if (type === 'reject') {
        result = await cancelRefundRequest(buyerItemId);
      } else if (type === 'accept') {
        result = await acceptRefundRequest(buyerItemId);
      }

      if (result.success) {
        toast.success(result.message);
        await fetchListings();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error processing refund action:', error);
      toast.error("An unexpected error occurred while processing the refund action");
    }

    closeConfirmationDialog();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">My Listings</CardTitle>
            <Button onClick={() => setIsCreateFormOpen(true)}>Create New Listing</Button>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button 
              variant={activeTab === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveTab('available')}
              className={activeTab === 'available' ? 'bg-orange-600 text-white' : 'text-orange-600 border-orange-600'}
            >
              Active Listings
            </Button>
            <Button 
              variant={activeTab === 'notAvailable' ? 'default' : 'outline'}
              onClick={() => setActiveTab('notAvailable')}
              className={activeTab === 'notAvailable' ? 'bg-orange-600 text-white' : 'text-orange-600 border-orange-600'}
            >
              Inactive Listings
            </Button>
            <Button 
              variant={activeTab === 'soldOut' ? 'default' : 'outline'}
              onClick={() => setActiveTab('soldOut')}
              className={activeTab === 'soldOut' ? 'bg-orange-600 text-white' : 'text-orange-600 border-orange-600'}
            >
              Sold Items
            </Button>
            <Button 
              variant={activeTab === 'refundRequest' ? 'default' : 'outline'}
              onClick={() => setActiveTab('refundRequest')}
              className={activeTab === 'refundRequest' ? 'bg-orange-600 text-white' : 'text-orange-600 border-orange-600'}
            >
              Refund Requests
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Loading listings...</p>
          ) : (
            <>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {renderListings()}
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {pageCount}</span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <CreateProductForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateProduct}
      />
      <EditProductForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        productId={selectedProductId}
        initialStatus={selectedProductStatus} // Pass initialStatus to EditProductForm
        onSubmit={handleEditSubmit}
      />
      <AlertDialog open={confirmationDialog.isOpen} onOpenChange={closeConfirmationDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Refund Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmationDialog.type === 'reject' ? 'decline' : 'approve'} this refund request?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmationDialog.type === 'reject' ? 'Decline Refund' : 'Approve Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster position="top-right" />
    </div>
  );
}

const ListingCard = ({ item, onEdit, onRejectRefund, onAcceptRefund, activeTab }) => (
  <Card>
    <CardContent className="p-4 flex items-start space-x-4">
      <Image
        src={item.mediaUrl ?? '/placeholder.svg'}
        alt={item.productTitle ?? 'Product Image'}
        width={100}
        height={100}
        className="object-cover rounded-md"
      />
      <div className="flex-grow">
        <h4 className="font-bold">{item.productTitle}</h4>
        <p>Price: ${item.productPrice?.toFixed(2)}</p>
        <p>Status: {item.productStatus}</p>
        {(activeTab === 'soldOut' || activeTab === 'refundRequest') && (
          <p>Payment Status: {item.productPaymentStatus}</p>
        )}
        {(activeTab === 'available' || activeTab === 'notAvailable') && (
          <Button onClick={() => onEdit(item.productId, item.productStatus)} className="mt-2 bg-orange-600 text-white hover:bg-orange-700">
            Edit Listing
          </Button>
        )}
        {activeTab === 'refundRequest' && (
          <div className="mt-2 space-x-2">
            <Button onClick={() => onRejectRefund(item.productId)} className="bg-red-600 text-white hover:bg-red-700">
              Reject Refund
            </Button>
            <Button onClick={() => onAcceptRefund(item.productId)} className="bg-green-600 text-white hover:bg-green-700">
              Accept Refund
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

MyListingsPage.getLayout = function getLayout(page) {
  return <UserLayout>{page}</UserLayout>;
};

export default MyListingsPage;

