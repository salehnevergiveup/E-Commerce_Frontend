import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from "@/layouts/admin-layout";
import { getAllBuyerItems, BuyerItem } from '@/services/buyer-item/buyer-item-service';
import Image from 'next/image';
import DeliveryDetailsModal from '@/components/DeliveryDetailsModal';
import { toast } from 'react-hot-toast';

function DeliveryPage() {
  const [buyerItems, setBuyerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({ productName: '', owner: '', orderId: '' }); // Updated initial state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('donePayment');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const fetchBuyerItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAllBuyerItems();
      setBuyerItems(items);
    } catch (err) {
      setError('Failed to fetch buyer items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuyerItems();
  }, [fetchBuyerItems]);

  const getFilteredItems = useCallback(() => {
    return buyerItems.filter(item => 
      (viewMode === 'donePayment' && item.buyerItemStatus === "done payment") ||
      (viewMode === 'received' && item.buyerItemStatus === "received")
    );
  }, [buyerItems, viewMode]);

  const filteredItems = getFilteredItems().filter(item => 
    item.productName.toLowerCase().includes(searchQuery.productName.toLowerCase()) &&
    item.productOwner.toLowerCase().includes(searchQuery.owner.toLowerCase()) && // Updated filtering logic
    item.purchaseOrderId.toString().includes(searchQuery.orderId)
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleViewDetails = async (item) => {
    try {
      const updatedItems = await getAllBuyerItems();
      const updatedItem = updatedItems.find(i => i.buyerItemId === item.buyerItemId);
      if (updatedItem) {
        setSelectedItem(updatedItem);
        setIsModalOpen(true);
      } else {
        toast.error("Failed to fetch updated item details.");
      }
    } catch (error) {
      console.error("Error fetching updated item details:", error);
      toast.error("An error occurred while fetching item details.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdate = async () => {
    await fetchBuyerItems();
    if (selectedItem) {
      const updatedItems = await getAllBuyerItems();
      const updatedItem = updatedItems.find(i => i.buyerItemId === selectedItem.buyerItemId);
      if (updatedItem) {
        setSelectedItem(updatedItem);
      }
    }
  };

  const handleSearchChange = (e, field) => {
    setSearchQuery(prev => ({ ...prev, [field]: e.target.value }));
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Delivery Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="space-x-2">
              <Button 
                variant={viewMode === 'donePayment' ? 'default' : 'outline'}
                onClick={() => handleViewModeChange('donePayment')}
              >
                Delivering
              </Button>
              <Button 
                variant={viewMode === 'received' ? 'default' : 'outline'}
                onClick={() => handleViewModeChange('received')}
              >
               Delivered
              </Button>
            </div>
          </div>
          <div className="flex items-center mb-4 space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by product name"
                value={searchQuery.productName}
                onChange={(e) => handleSearchChange(e, 'productName')}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search by Sender"
                value={searchQuery.owner}
                onChange={(e) => handleSearchChange(e, 'owner')}
                className="w-full"
              />
            </div> {/* Replaced product ID input with owner input */}
            <div className="flex-1">
              <Input
                placeholder="Search by order ID"
                value={searchQuery.orderId}
                onChange={(e) => handleSearchChange(e, 'orderId')}
                className="w-full"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Product Sender</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Delivery Stages</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item.buyerItemId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={item.productUrl}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span>{item.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.productOwner}</TableCell>
                  <TableCell>{item.purchaseOrderId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {item.buyerItemDelivery.map((stage, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span className="text-sm">{stage.stage}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>Update Delivery Status</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {selectedItem && (
        <DeliveryDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

DeliveryPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default DeliveryPage;

