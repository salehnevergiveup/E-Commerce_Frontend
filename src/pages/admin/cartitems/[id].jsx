// pages/admin/carts/dashboard.js

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import AdminLayout from '@/layouts/admin-layout'
import sendRequest from '@/services/requests/request-service'
import RequestMethods from '@/enums/request-methods'
import { toast } from 'react-toastify'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Ensure this path is correct

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/router'

import { AlertTriangle, Download, Eye, Pencil, Search, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'

export default function CartItemsDashboard() {
  const router = useRouter()
  const { id } = router.query
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedItem, setSelectedItem] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // 🔹 **Added Pagination State**
  const [currentPage, setCurrentPage] = useState(1) // Current active page
  const [itemsPerPage, setItemsPerPage] = useState(10) // Number of items per page

  useEffect(() => {
    // Only proceed if the router is ready and `id` is available
    if (router.isReady && id) {
      fetchCartItems(id)
    }
  }, [router.isReady, id])

  const fetchCartItems = async (cartId) => {
    try {
      setLoading(true)
      const response = await sendRequest(RequestMethods.GET, `shoppingcart?cartId=${cartId}`, null, true)
      console.log("response from the cartitems page:", response)
      if (response.success) {
        setItems(response.data.shoppingCartItems)
      } else {
        setError(response.message || "Failed to fetch cart items.")
        toast.error(response.message || "Failed to fetch cart items.")
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
      setError("Failed to fetch cart items.")
      toast.error('An error occurred while fetching cart items')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (item, newStatus) => {
    try {
      const response = await sendRequest(
        RequestMethods.PUT,
        `/cartitems/${item.id}`,
        { status: newStatus },
        true
      )
      if (response.success) {
        setItems(prevItems =>
          prevItems.map(i =>
            i.id === item.id ? { ...i, status: newStatus } : i
          )
        )
        setIsEditOpen(false)
        toast.success('Item status updated successfully')
      } else {
        toast.error(response.message || 'Failed to update item status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('An error occurred while updating item status')
    }
  }

  const handleDelete = async (item) => {
    try {
      const response = await sendRequest(
        RequestMethods.DELETE,
        `/cartitems/${item.id}`,
        null,
        true
      )
      if (response.success) {
        setItems(prevItems => prevItems.filter(i => i.id !== item.id))
        setIsDeleteOpen(false)
        toast.success(response.message || 'Item deleted successfully')
      } else {
        toast.error(response.message || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('An error occurred while deleting the item')
    }
  }

  const totalItems = items.length
  const selectedItems = items.filter(item => item.status === 'Selected').length
  const unselectedItems = items.filter(item => item.status === 'Unselected').length

  // 🔹 **Added: Calculate total pages and current roles for pagination**
  const filteredItems = items.filter(
    (item) =>
      item.status.toLowerCase() === (statusFilter.toLowerCase()) ||
      statusFilter.toLowerCase() === 'all'
  ).filter(
    (item) =>
      item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery)
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)

  // 🔹 **Added: Effect to Reset Current Page on Search or Items Per Page Change**
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, itemsPerPage])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/carts")}
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Carts
      </Button>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Items */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <h3 className="text-2xl font-bold mt-2">{totalItems}</h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">All cart items</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>

        {/* Selected Items */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Selected Items</p>
              <h3 className="text-2xl font-bold mt-2">{selectedItems}</h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">Total selected items</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>

        {/* Unselected Items */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Unselected Items</p>
              <h3 className="text-2xl font-bold mt-2">{unselectedItems}</h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">Total unselected items</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cart Items List */}
      <Card className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {/* Header and Filters */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-lg font-semibold">Cart Items</h2>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10" />
              </div>
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Selected">Selected</SelectItem>
                  <SelectItem value="Unselected">Unselected</SelectItem>
                </SelectContent>
              </Select>
              {/* Export Button */}
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Item Status</TableHead>
                <TableHead>Product Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : currentItems.length > 0 ? ( // 🔹 **Changed from items.map to currentItems.map**
                currentItems.map((item) => (
                  <TableRow key={item.id}>
                    {/* Product Cell */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={40}
                          height={40}
                          className="rounded-full w-10 h-10" />
                        <span className="font-medium">{item.product.name}</span>
                      </div>
                    </TableCell>
                    {/* Price Cell */}
                    <TableCell>${item.product.price.toFixed(2)}</TableCell>
                    {/* Item Status Cell with Badge */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Selected'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Unselected'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    {/* Product Status Cell with Badge */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${item.product.status.toLowerCase() === 'available'
                            ? 'bg-green-100 text-green-800'
                            : item.product.status.toLowerCase() === 'unavailable'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {item.product.status}
                      </span>
                    </TableCell>
                    {/* Actions Cell */}
                    <TableCell>
                      <div className="flex justify-end items-center space-x-2">
                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsViewOpen(true)
                          }}>
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsEditOpen(true)
                          }}
                          disabled={
                            item.product.status.toLowerCase() === 'unavailable' ||
                            item.status.toLowerCase() === 'disabled'
                          }
                          className={`${item.product.status.toLowerCase() === 'unavailable' ||
                              item.status.toLowerCase() === 'disabled'
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                            }`}>
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        {/* Delete Button with AlertDialog */}
                        <AlertDialog
                          open={isDeleteOpen && selectedItem?.id === item.id}
                          onOpenChange={(open) => {
                            if (!open) setIsDeleteOpen(false)
                          }}>
                          <AlertDialogContent className="bg-white text-center space-y-4">
                            <AlertDialogHeader className="flex flex-col items-center gap-2">
                              <AlertDialogTitle className="text-center">Delete Item</AlertDialogTitle>
                              <AlertTriangle className="h-10 w-10 text-red-500" />
                              <AlertDialogDescription className="text-center text-sm">
                                This action cannot be undone. This will permanently delete the item from your cart.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="sm:flex-col space-y-2">
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 w-full"
                                onClick={() => selectedItem && handleDelete(selectedItem)}
                              >
                                Delete
                              </AlertDialogAction>
                              <AlertDialogCancel
                                className="w-full mt-2"
                                onClick={() => setIsDeleteOpen(false)}
                              >
                                Cancel
                              </AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                          {/* Trigger is the delete button */}
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item)
                                setIsDeleteOpen(true)
                              }}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 🔹 **Added: Pagination Controls Below the Table** */}
          <div className="flex justify-between items-center mt-4">
            {/* Items Per Page Select Box */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">entries</span>
            </div>

            {/* Pagination Buttons */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog className="bg-white" open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Product</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center">
                <Image
                  src={selectedItem.product.image}
                  alt={selectedItem.product.name}
                  width={200}
                  height={200}
                  className="rounded-full w-40 h-40" />
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold text-lg">{selectedItem.product.title}</h3>
                <p className="text-sm text-gray-500">{selectedItem.product.description}</p>
                <hr />
                <div className="flex justify-between items-center">
                  <span>Price:</span>
                  <span className="font-semibold">${selectedItem.product.price.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className="font-semibold">{selectedItem.status}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span>Product Status:</span>
                  <span className="font-semibold">{selectedItem.product.status}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span>Refund Guarantee Duration:</span>
                  <span className="font-semibold">{selectedItem.product.refundGuaranteedDuration}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog className="bg-white" open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item Status</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-3">
                <Image
                  src={selectedItem.product.image}
                  alt={selectedItem.product.name}
                  width={60}
                  height={60}
                  className="rounded-full w-10 h-10" />
                <div>
                  <h3 className="font-semibold">{selectedItem.product.title}</h3>
                  <p className="text-sm text-gray-500">${selectedItem.product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selected"
                  checked={selectedItem.status === 'Selected'}
                  onCheckedChange={(checked) => {
                    handleStatusChange(selectedItem, checked ? 'Selected' : 'Unselected')
                  }}
                  disabled={
                    selectedItem.product.status.toLowerCase() === 'unavailable' ||
                    selectedItem.status.toLowerCase() === 'disabled'
                  } />
                <label
                  htmlFor="selected"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Selected
                </label>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 🔹 **Added: Pagination Component Below the Page Component**
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const pageNumbers = []

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  // Handle edge case when totalPages is 0
  if (totalPages === 0) return null

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        Previous
      </Button>
      {pageNumbers.map(number => (
        <Button
          key={number}
          variant={number === currentPage ? "solid" : "outline"}
          className={number === currentPage ? "bg-orange-600 text-white" : ""}
          onClick={() => setCurrentPage(number)}
          aria-label={`Go to page ${number}`}
        >
          {number}
        </Button>
      ))}
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        Next
      </Button>
    </div>
  )
}

CartItemsDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}

// 🔹 **Ensure to define these variables before using them in filteredItems calculation**


// 🔹 **Moved filteredItems calculation inside the component and adjusted accordingly**
// The filteredItems, totalPages, indexOfLastItem, indexOfFirstItem, currentItems are now defined above in the component
