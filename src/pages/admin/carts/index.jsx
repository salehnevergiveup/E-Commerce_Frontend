// pages/admin/shoppingcarts/dashboard.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  Trash2,
  ShoppingCart,
  Download,
  User,
  Search,
  AlertTriangle,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function ShoppingCartsDashboard() {
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1) // Current active page
  const [itemsPerPage, setItemsPerPage] = useState(10) // Number of carts per page

  // Modal state
  const [cartToDelete, setCartToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Function to fetch carts
  const fetchCarts = async () => {
    try {
      setLoading(true)
      const response = await sendRequest(
        RequestMethods.GET,
        'shoppingcart/list',
        null,
        true
      )
      console.log("Received response from the carts page", response.data)
      if (response.success) {
        setCarts(response.data)
      } else {
        toast.error(response.message || "Failed to fetch shopping carts.")
        setError(response.message || "Failed to fetch shopping carts.")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while fetching shopping carts.")
      setError(error.message || "An error occurred while fetching shopping carts.")
    } finally {
      setLoading(false)
    }
  }

  // Function to initiate delete (opens modal)
  const initiateDeleteCart = (cartId) => {
    setCartToDelete(cartId)
  }

  // Function to confirm deletion
  const confirmDeleteCart = async () => {
    setDeleting(true)
    try {
      const response = await sendRequest(
        RequestMethods.DELETE,
        `shoppingcart/${cartToDelete}`,
        null,
        true
      )
      if (response.success) {
        toast.success('Cart deleted successfully')
        fetchCarts()
      } else {
        toast.error(response.message || "Failed to delete shopping cart.")
        setError(response.message || "Failed to delete shopping cart.")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting the shopping cart.")
      setError(error.message || "An error occurred while deleting the shopping cart.")
    } finally {
      setDeleting(false)
      setCartToDelete(null)
    }
  }

  // Function to cancel deletion
  const cancelDeleteCart = () => {
    setCartToDelete(null)
  }

  useEffect(() => {
    fetchCarts()
  }, [])

  // Filtered carts based on status and search query
  const filteredCarts = carts
    .filter(
      (cart) =>
        cart.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cart.id.toString().includes(searchQuery)
    )

  // Calculate total pages
  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage)

  // Get current carts for the page
  const indexOfLastCart = currentPage * itemsPerPage
  const indexOfFirstCart = indexOfLastCart - itemsPerPage
  const currentCarts = filteredCarts.slice(indexOfFirstCart, indexOfLastCart)

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, itemsPerPage])

  // Statistics Cards Data
  const totalCarts = carts.length
  const totalSelectedItems = carts.reduce(
    (sum, cart) =>
      sum +
      cart.shoppingCartItems.filter((item) => item.status === 'Selected')
        .length,
    0
  )
  const totalUnselectedItems = carts.reduce(
    (sum, cart) =>
      sum +
      cart.shoppingCartItems.filter((item) => item.status === 'Unselected')
        .length,
    0
  )

  // Pagination Component
  const Pagination = () => {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Carts */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Carts</p>
              <h3 className="text-2xl font-bold mt-2">{totalCarts}</h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">All shopping carts</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
        {/* Selected Items */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Selected Items
              </p>
              <h3 className="text-2xl font-bold mt-2">{totalSelectedItems}</h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">
                Total selected items
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
        {/* Unselected Items */}
        <Card className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Unselected Items
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {totalUnselectedItems}
              </h3>
              <p className="text-xs text-green-500 mt-1">+0%</p>
              <p className="text-sm text-gray-500 mt-1">
                Total unselected items
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Carts List */}
      <Card className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-lg font-semibold">Carts List</h2>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search carts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p> // Replace with a spinner if available
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Selected Items</TableHead>
                    <TableHead>Unselected Items</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCarts.length > 0 ? (
                    currentCarts.map((cart) => (
                      <TableRow key={cart.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium">
                                {cart.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">
                              {cart.user.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cart.shoppingCartItems.length}
                        </TableCell>
                        <TableCell>
                          {
                            cart.shoppingCartItems.filter(
                              (item) => item.status === 'Selected'
                            ).length
                          }
                        </TableCell>
                        <TableCell>
                          {
                            cart.shoppingCartItems.filter(
                              (item) => item.status === 'Unselected'
                            ).length
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(cart.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/admin/users/view/${cart.id}`
                                )
                              }
                            >
                              <User className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/admin/cartitems/${cart.id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            {/* Delete Button with AlertDialog */}
                            <AlertDialog
                              open={cartToDelete === cart.id}
                              onOpenChange={(open) => {
                                if (!open) cancelDeleteCart()
                              }}
                            >
                              {/* Trigger is the delete button */}
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    initiateDeleteCart(cart.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white text-center space-y-4">
                                <AlertDialogHeader className="flex flex-col items-center gap-2">
                                  <AlertDialogTitle className="text-center">
                                    Delete Cart
                                  </AlertDialogTitle>
                                  <AlertTriangle className="h-10 w-10 text-red-500" />
                                  <AlertDialogDescription className="text-center text-sm">
                                    This action cannot be undone. This will
                                    permanently delete the shopping cart and
                                    remove its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="sm:flex-col space-y-2">
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 w-full"
                                    onClick={confirmDeleteCart}
                                    disabled={deleting}
                                  >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                  <AlertDialogCancel
                                    className="w-full mt-2"
                                    onClick={cancelDeleteCart}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No shopping carts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                {/* Items Per Page Select Box */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show</span>
                  <Select value={itemsPerPage} onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1) // Reset to first page when items per page changes
                  }}>
                    <SelectTrigger>
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
                <Pagination />
              </div>
            </>
          )}
          {/* Optional: Handle case when there are no carts */}
          {!loading && carts.length === 0 && (
            <Card className="bg-white rounded-lg shadow-sm p-6">
              <p>No shopping carts available.</p>
            </Card>
          )}
        </div>
      </Card>
    </div>
  )
}

ShoppingCartsDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}
