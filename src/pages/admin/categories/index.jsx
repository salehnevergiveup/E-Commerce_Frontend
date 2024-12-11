"use client"

import React, { useState, useEffect } from "react"
import { Box, ThumbsUp, ThumbsDown, Star, Search, Download, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import AdminLayout from "@/layouts/admin-layout"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryForm } from "@/components/category-form" // Ensure this component exists
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog" // Ensure these components are available
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // For Items Per Page
import { toast } from "react-toastify" // For notifications
import sendRequest from "@/services/requests/request-service" // Adjust the path as needed
import RequestMethods from "@/enums/request-methods" // Adjust the path as needed

export default function AdminCategories() {
  const [categories, setCategories] = useState([]) // To store fetched categories
  const [loading, setLoading] = useState(true) // To handle loading state
  const [error, setError] = useState(null) // To handle errors

  const [open, setOpen] = useState(false) // For CategoryForm modal
  const [editingCategory, setEditingCategory] = useState(null) // For editing

  const [searchQuery, setSearchQuery] = useState('') // Search input
  const [page, setPage] = useState(1) // Current page for pagination
  const [itemsPerPage, setItemsPerPage] = useState(10) // Number of categories per page

  const [isDeleteOpen, setIsDeleteOpen] = useState(false) // For delete confirmation dialog
  const [selectedItem, setSelectedItem] = useState(null) // Selected category for deletion

  // Calculate statistics
  const totalCategories = categories.length
  const averageChargeRate = totalCategories > 0
    ? categories.reduce((acc, cat) => acc + cat.chargeRate, 0) / totalCategories
    : 0
  const averageRebateRate = totalCategories > 0
    ? categories.reduce((acc, cat) => acc + cat.rebateRate, 0) / totalCategories
    : 0

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          'product/public/get-product-category-list',
          null,
          false // Assuming this endpoint doesn't require authentication
        )

        if (response.success && Array.isArray(response.data)) {
          setCategories(response.data)
        } else {
          setError(response.message || "Failed to fetch categories.")
          toast.error(response.message || "Failed to fetch categories.")
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to fetch categories.")
        toast.error("Failed to fetch categories.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Handle Edit
  const handleEdit = (category) => {
    setEditingCategory(category)
    setOpen(true)
  }

  // Handle Create
  const handleCreate = () => {
    setEditingCategory(null)
    setOpen(true)
  }

  // Determine icon based on averageChargeRate
  const getChargeRateIcon = () => {
    if (averageChargeRate >= 1500) { // Example condition: High charge rate
      return <ThumbsUp className="h-5 w-5 text-green-500" />
    } else if (averageChargeRate <= 1000) { // Example condition: Low charge rate
      return <Star className="h-5 w-5 text-red-500" />
    } else { // Default condition
      return <Star className="h-5 w-5 text-yellow-500" />
    }
  }

  // Fix: Ensure category fields are defined before calling toLowerCase
  const filteredCategories = categories.filter(category =>
    (category.productCategoryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedCategories = filteredCategories.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)

  // Function to open the delete confirmation dialog
  const openDeleteDialog = (category) => {
    setSelectedItem(category)
    setIsDeleteOpen(true)
  }

  // Handle form submission for Create and Edit
  const handleFormSubmit = async (data) => {
    if (editingCategory) {
      // Edit existing category
      try {
        const payload = {
          productCategoryId: editingCategory.productCategoryId,
          productCategoryName: data.productCategoryName,
          description: data.description,
          chargeRate: data.chargeRate,
          rebateRate: data.rebateRate
        }

        const response = await sendRequest(
          RequestMethods.PUT,
          'product/edit-category',
          payload,
          true
        )

        if (response.success) {
          toast.success("Category updated successfully.")
          // Update the category in the state
          setCategories(prevCategories => prevCategories.map(cat =>
            cat.productCategoryId === editingCategory.productCategoryId ? { ...cat, ...payload } : cat
          ))
          setOpen(false)
        } else {
          toast.error(response.message || "Failed to update category.")
        }
      } catch (err) {
        console.error("Error updating category:", err)
        toast.error("Failed to update category.")
      }
    } else {
      // Create new category
      try {
        const payload = {
          productCategoryName: data.productCategoryName,
          description: data.description,
          chargeRate: data.chargeRate,
          rebateRate: data.rebateRate
        }

        const response = await sendRequest(
          RequestMethods.POST,
          'product/create-category',
          payload,
          true // Adjust based on your API's authentication requirements
        )

        if (response.success) {
          toast.success("Category created successfully.")
          if (response.data) {
            setCategories(prevCategories => [...prevCategories, response.data])
          } else {
            const refreshedResponse = await sendRequest(
              RequestMethods.GET,
              'public/get-product-category-list',
              null,
              false
            )
            if (refreshedResponse.success && Array.isArray(refreshedResponse.data)) {
              setCategories(refreshedResponse.data)
            }
          }
          setOpen(false)
        } else {
          toast.error(response.message || "Failed to create category.")
        }
      } catch (err) {
        console.error("Error creating category:", err)
        toast.error("Failed to create category.")
      }
    }
  }

  // Fix: Correct average calculations
  const correctAverageChargeRate = totalCategories > 0
    ? (categories.reduce((acc, cat) => acc + cat.chargeRate/100, 0) / totalCategories).toFixed(2)
    : "0.00"

  const correctAverageRebateRate = totalCategories > 0
    ? (categories.reduce((acc, cat) => acc + cat.rebateRate/100, 0) / totalCategories).toFixed(2)
    : "0.00"

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading categories...</p>
      </div>
    )
  }

  // Error State
  if (error && categories.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-white shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Box className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Charge Rate</CardTitle>
            {getChargeRateIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${correctAverageChargeRate}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rebate Rate</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${correctAverageRebateRate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-6">
          {/* Header with Title and Controls */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
            <CardTitle className="text-lg font-semibold">Reviews List</CardTitle>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4  md:space-y-0">
              {/* Search Input */}
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                {/* Export Button */}

                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                {/* Create Button */}
                <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
                  Create Category
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Charge Rate</TableHead>
                  <TableHead>Rebate Rate</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.productCategoryId}>
                      <TableCell className="font-medium">{category.productCategoryId}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* If you have an image for the category, you can use Avatar here */}
                          {/* <Avatar>
                            <AvatarImage src={category.imageUrl} alt={category.productCategoryName} />
                            <AvatarFallback>{category.productCategoryName.charAt(0)}</AvatarFallback>
                          </Avatar> */}
                          <span>{category.productCategoryName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{category.description || 'N/A'}</TableCell>
                      <TableCell>${(category.chargeRate / 100).toFixed(2)}</TableCell>
                      <TableCell>${(category.rebateRate / 100).toFixed(2)}</TableCell>
                      <TableCell>{category.numberOfItems}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          aria-label="Edit Category"
                        >
                          <Edit className="h-4 w-4 text-orange-500" />
                        </Button>
                        {/* Conditionally render the Delete button */}
                        {category.numberOfItems === 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => openDeleteDialog(category)}
                            aria-label="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            {/* Items Per Page Select Box */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setPage(1) // Reset to first page when items per page changes
                }}
              >
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
              <span className="text-sm text-muted-foreground">entries</span>
            </div>

            {/* Pagination Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="bg-white hover:bg-gray-100"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="bg-white hover:bg-gray-100"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <CategoryForm
        open={open}
        onOpenChange={setOpen}
        initialData={editingCategory}
        mode={editingCategory ? "edit" : "create"}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

// Wrap AdminCategories with AdminLayout
AdminCategories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
