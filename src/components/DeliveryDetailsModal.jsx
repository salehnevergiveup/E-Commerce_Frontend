import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle } from 'lucide-react';
import { 
  updateDeliveryStageArrivedSortingFacility, 
  updateDeliveryStageArrivedDeliveryHub, 
  updateDeliveryStageOutForDelivery,
  updateDeliveryStageItemDelivered
} from '@/services/buyer-item/buyer-item-service';
import { toast } from 'react-hot-toast';

const deliveryStages = [
  { 
    id: 1, 
    name: 'On Packaging', 
    icon: Package 
  },
  { 
    id: 2, 
    name: 'Arrived in Sorting Facility', 
    icon: Truck,
    updateFunction: updateDeliveryStageArrivedSortingFacility
  },
  { 
    id: 3, 
    name: 'Arrived in Sorting Delivery Hub', 
    icon: Truck,
    updateFunction: updateDeliveryStageArrivedDeliveryHub
  },
  { 
    id: 4, 
    name: 'Out for Delivery', 
    icon: Truck,
    updateFunction: updateDeliveryStageOutForDelivery
  },
  { 
    id: 5, 
    name: 'Item Delivered', 
    icon: CheckCircle,
    updateFunction: updateDeliveryStageItemDelivered
  },
];

const DeliveryDetailsModal = ({ isOpen, onClose, item, onUpdate }) => {
  const [currentItem, setCurrentItem] = useState(item);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  const handleUpdateStage = async (stage) => {
    if (stage.updateFunction) {
      try {
        const result = await stage.updateFunction(currentItem.buyerItemId);
        if (result.success) {
          setResponseMessage(result.data?.message || result.message);
          toast.success(result.message);
          // Update the current item with the new stage
          setCurrentItem(prevItem => ({
            ...prevItem,
            buyerItemDelivery: [
              ...prevItem.buyerItemDelivery,
              {
                stage: stage.name,
                stageDescription: result.data?.message || '',
                stageDate: new Date().toISOString()
              }
            ]
          }));
          onUpdate(); // Trigger a refresh of the parent component
        } else {
          setResponseMessage(result.message);
          toast.error(result.message);
        }
      } catch (error) {
        console.error('Error updating delivery stage:', error);
        setResponseMessage('An unexpected error occurred while updating the delivery stage.');
        toast.error('An unexpected error occurred while updating the delivery stage.');
      }
    }
  };

  const currentStageIndex = currentItem.buyerItemDelivery.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setResponseMessage('');
      onClose();
      onUpdate(); // Trigger a refresh when the modal is closed
    }}>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-600">Delivery Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Product: {currentItem.productName}</h3>
          <p className="text-gray-600 mb-4">Order ID: {currentItem.purchaseOrderId}</p>
          {responseMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
              {responseMessage}
            </div>
          )}
          <div className="space-y-6">
            {deliveryStages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = index <= currentStageIndex;
              const isNext = index === currentStageIndex + 1;
              const currentStage = currentItem.buyerItemDelivery[index];
              return (
                <div key={stage.id} className="flex items-center">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <StageIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {stage.name}
                    </p>
                    {isCompleted && currentStage && currentStage.stageDescription && (
                      <p className="text-sm text-gray-500 mt-1">
                        {currentStage.stageDescription}
                      </p>
                    )}
                    {isCompleted && currentStage && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(currentStage.stageDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {isNext && stage.updateFunction && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto text-orange-600 border-orange-600 hover:bg-orange-50"
                      onClick={() => handleUpdateStage(stage)}
                    >
                      Update to {stage.name}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryDetailsModal;

