// src/pages/admin/products.js

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input";
import S3MediaFacade from '@/services/mediaService/handle-media';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Trash2,
    Download,
    Search,
    AlertTriangle,
    UserPlus
} from 'lucide-react';
import { ProductDetailsModal } from '@/components/product-details-modal'; // Ensure this component exists
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AdminLayout from "@/layouts/admin-layout";

import sendRequest from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"; // Ensure these components are available

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For Items Per Page

// Function to calculate product statistics (if needed)
function calculateProductStats(products) {
    const total = products.length;
    const averagePrice = products.length > 0
        ? products.reduce((acc, p) => acc + p.price, 0) / total
        : 0;

    return {
        total,
        averagePrice: parseFloat(averagePrice.toFixed(2))
    };
}

export default function AdminProducts() {
    const [products, setProducts] = useState([]); // To store fetched products
    const [loading, setLoading] = useState(true); // To handle loading state
    const [error, setError] = useState(null); // To handle errors

    const [page, setPage] = useState(1); // Current page for pagination
    const [itemsPerPage, setItemsPerPage] = useState(10); // Number of products per page

    const [selectedProduct, setSelectedProduct] = useState(null); // For viewing product details
    const [searchQuery, setSearchQuery] = useState(''); // Search input

    // State for Delete Confirmation Dialog
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch products from the `/product/view-all-products` endpoint
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await sendRequest(
                    RequestMethods.GET,
                    `/product/public/view-all-products`,
                    null,
                    false // Assuming authentication is required
                );

                console.log(response);

                if (response.success && Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    setError(response.message || "Failed to fetch products.");
                    toast.error(response.message || "Failed to fetch products.");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to fetch products.");
                toast.error("Failed to fetch products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Calculate statistics based on fetched products
    const stats = calculateProductStats(products);

    // Filter products based on search query (Title, User Name)
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Paginate the filtered products
    const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handleDelete = async (product) => {
        if (!product) return;

        try {
            const mediaUrls = product.media ? product.media.map(media => media.mediaUrl) : [];

            if (mediaUrls.length > 0) {
                await S3MediaFacade.deleteMedias(mediaUrls);
            }


            const deleteResponse = await sendRequest(
                RequestMethods.DELETE,
                `/product/delete-product?productId=`+product.productId,
                null,
                true // Assuming authentication is required
            );

            if (deleteResponse.success) {
                toast.success("Product deleted successfully.");
                // Remove the product from the state
                setProducts(prevProducts => prevProducts.filter(p => p.productId !== product.productId));
            } else {
                toast.error(deleteResponse.message || "Failed to delete product.");
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            toast.error("Failed to delete product.");
        } finally {
            setSelectedItem(null);
            setIsDeleteOpen(false);
        }
    };

    const openDeleteDialog = (product) => {
        setSelectedItem(product);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <p>Loading products...</p>
            </div>
        );
    }

    if (error && products.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Product Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <UserPlus className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                        <Download className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {stats.averagePrice}</div>
                    </CardContent>
                </Card>
                {/* Add more statistics cards as needed */}
            </div>

            {/* Products Table */}
            <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-6">
                    {/* Table Header with Search and Export */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                        <CardTitle className="text-lg font-semibold">Products List</CardTitle>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by title or user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-[250px]"
                                />
                            </div>
                            {/* Export Button */}
                            <Button variant="outline" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            {/* Add New Product Button (if applicable) */}
                            {/* <Link href={`/admin/products/create`}>
                                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                    <UserPlus className="h-4 w-4" />
                                    Add New Product
                                </Button>
                            </Link> */}
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Refund Duration</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.productId}>
                                            {/* Image Column */}
                                            <TableCell>
                                                {product.media && product.media.length > 0 ? (
                                                    <Image
                                                        src={product.media[0].mediaUrl || "/placeholder-product.png"}
                                                        alt={product.title}
                                                        width={50}
                                                        height={50}
                                                        className="rounded"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="/placeholder-product.png"
                                                        alt="No Image"
                                                        width={50}
                                                        height={50}
                                                        className="rounded"
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Title Column */}
                                            <TableCell>{product.title}</TableCell>

                                            {/* Description Column */}
                                            <TableCell>{product.description}</TableCell>

                                            {/* Price Column */}
                                            <TableCell>RM {product.price.toFixed(2)}</TableCell>

                                            {/* Refund Duration Column */}
                                            <TableCell>{product.refundGuaranteedDuration} days</TableCell>

                                            {/* Created At Column */}
                                            <TableCell>
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </TableCell>

                                            {/* Seller Column */}
                                            <TableCell>{product.userName}</TableCell>

                                            {/* Actions Column */}
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedProduct(product)}
                                                    aria-label="View Product Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => openDeleteDialog(product)}
                                                    aria-label="Delete Product"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            No products found.
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
                                    setItemsPerPage(Number(value));
                                    setPage(1); // Reset to first page when items per page changes
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
                                className="bg-white hover:bg-gray-100">
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="bg-white hover:bg-gray-100">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteOpen && selectedItem?.productId === selectedItem?.productId}
                onOpenChange={(open) => {
                    if (!open) setIsDeleteOpen(false);
                }}>
                <AlertDialogContent className="bg-white text-center space-y-4">
                    <AlertDialogHeader className="flex flex-col items-center gap-2">
                        <AlertDialogTitle className="text-center">Delete Product</AlertDialogTitle>
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                        <AlertDialogDescription className="text-center text-sm">
                            This action cannot be undone. This will permanently delete the product and all associated images.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-col space-y-2">
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 w-full"
                            onClick={() => {
                                handleDelete(selectedItem);
                            }}
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
            </AlertDialog>
        </div>
    )
}

// Wrap AdminProducts with AuthGuard and preserve the layout
AdminProducts.getLayout = function getLayout(page) {
    return <AdminLayout>{page}</AdminLayout>;
};


