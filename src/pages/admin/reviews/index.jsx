// src/pages/admin/reviews.js

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import S3MediaFacade from '@/services/mediaService/handle-media';
import { Input } from "@/components/ui/input";

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
    Star,
    ThumbsUp,
    ThumbsDown,
    Download,
    Search,
    AlertTriangle,
    UserPlus
} from 'lucide-react';
import { ReviewDetailsModal } from '@/components/review-details-modal'; // Ensure this component exists
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


// Function to calculate review statistics
function calculateReviewStats(reviews) {
    const total = reviews.length;
    const goodReviews = reviews.filter(r => r.rating >= 4).length;
    const badReviews = reviews.filter(r => r.rating <= 2).length;
    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
        : 0;

    return {
        total,
        goodReviews,
        badReviews,
        averageRating: parseFloat(averageRating.toFixed(1))
    };
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]); // To store fetched reviews
    const [loading, setLoading] = useState(true); // To handle loading state
    const [error, setError] = useState(null); // To handle errors

    const [page, setPage] = useState(1); // Current page for pagination
    const [itemsPerPage, setItemsPerPage] = useState(10); // Number of reviews per page

    const [selectedReview, setSelectedReview] = useState(null); // For viewing review details
    const [searchQuery, setSearchQuery] = useState(''); // Search input

    // State for Delete Confirmation Dialog
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch reviews from the `/reviews` endpoint
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await sendRequest(
                    RequestMethods.GET,
                    `/review`,
                    null,
                    true 
                );

                if (response.success && Array.isArray(response.data)) {
                    console.log(response.data)
                    setReviews(response.data);
                } else {
                    setError(response.message || "Failed to fetch reviews.");
                    toast.error(response.message || "Failed to fetch reviews.");
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to fetch reviews.");
                toast.error("Failed to fetch reviews.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Calculate statistics based on fetched reviews
    const stats = calculateReviewStats(reviews);

    // Filter reviews based on search query (Product title, Reviewer name, Saler name)
    const filteredReviews = reviews.filter(review =>
        review.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.saler.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedReviews = filteredReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    // Function to handle deletion of a review using S3MediaFacade
    const handleDelete = async (review) => {
        if (!review) return;

        try {
            const mediaUrls = review.medias.map(media => media.mediaUrl);

            if (mediaUrls.length > 0) {
                await S3MediaFacade.deleteMedias(mediaUrls);
            }
            const payload = {
                id: review.id,
            };
            console.log(review)

            const deleteResponse = await sendRequest(
                RequestMethods.DELETE,
                `/review/${review.id}`,
                payload,
                true 
            );

            if (deleteResponse.success) {
                toast.success("Review deleted successfully.");
                // Remove the review from the state
                setReviews(prevReviews => prevReviews.filter(r => r.id !== review.id));
            } else {
                toast.error(deleteResponse.message || "Failed to delete review.");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            toast.error("Failed to delete review.");
        } finally {
            // Reset deletion states
            setSelectedItem(null);
            setIsDeleteOpen(false);
        }
    };

    // Function to open the delete confirmation dialog
    const openDeleteDialog = (review) => {
        setSelectedItem(review);
        setIsDeleteOpen(true);
    };

    // Handle loading state
    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <p>Loading reviews...</p>
            </div>
        );
    }

    // Handle error state
    if (error && reviews.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Review Statistics */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Good Reviews</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.goodReviews}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Bad Reviews</CardTitle>
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.badReviews}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageRating}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews Table */}
            <Card className="bg-white rounded-lg shadow-sm">
                <CardContent className="p-6">
                    {/* Table Header with Search and Export */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                        <CardTitle className="text-lg font-semibold">Reviews List</CardTitle>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by product, reviewer, or saler..."
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
                        </div>
                    </div>

                    {/* Reviews Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead>Saler</TableHead> {/* New Column */}
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedReviews.length > 0 ? (
                                    paginatedReviews.map((review) => (
                                        <TableRow key={review.id}>
                                            {/* Product Column */}
                                            <TableCell className="flex items-center space-x-2">
                                                <Avatar className="h-9 w-9 mr-2">
                                                    <AvatarImage
                                                        src={review.product.image || "/placeholder-product.png"}
                                                        alt={review.product.title}
                                                    />
                                                    <AvatarFallback>
                                                        {review.product.title ? review.product.title.charAt(0).toUpperCase() : "P"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{review.product.title}</span>
                                            </TableCell>

                                            {/* Reviewer Column */}
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage
                                                            src={review.buyer.medias[0]?.mediaUrl || "/placeholder.svg"}
                                                            alt={review.buyer.name}
                                                        />
                                                        <AvatarFallback>
                                                            {review.buyer.name ? review.buyer.name.charAt(0).toUpperCase() : "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{review.buyer.name}</span>
                                                </div>
                                            </TableCell>

                                            {/* Saler Column */}
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage
                                                            src={review.saler.medias[0]?.mediaUrl || "/placeholder.svg"}
                                                            alt={review.saler.name}
                                                        />
                                                        <AvatarFallback>
                                                            {review.saler.name ? review.saler.name.charAt(0).toUpperCase() : "S"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{review.saler.name}</span>
                                                </div>
                                            </TableCell>

                                            {/* Rating Column */}
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                    <span className="ml-1">{review.rating}/5</span>
                                                </div>
                                            </TableCell>

                                            {/* Date Column */}
                                            <TableCell>
                                                {review.medias[0]?.createdAt
                                                    ? new Date(review.medias[0].createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>

                                            {/* Actions Column */}
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedReview(review)}
                                                    aria-label="View Review Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => openDeleteDialog(review)}
                                                    aria-label="Delete Review"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No reviews found.
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

            {/* Review Details Modal */}
            {selectedReview && (
                <ReviewDetailsModal
                    review={selectedReview}
                    onClose={() => setSelectedReview(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteOpen && selectedItem?.id === selectedItem?.id}
                onOpenChange={(open) => {
                    if (!open) setIsDeleteOpen(false);
                }}>
                <AlertDialogContent className="bg-white text-center space-y-4">
                    <AlertDialogHeader className="flex flex-col items-center gap-2">
                        <AlertDialogTitle className="text-center">Delete Review</AlertDialogTitle>
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                        <AlertDialogDescription className="text-center text-sm">
                            This action cannot be undone. This will permanently delete the review and all associated images.
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

// Wrap AdminReviews with AuthGuard and preserve the layout
AdminReviews.getLayout = function getLayout(page) {
    return <AdminLayout>{page}</AdminLayout>;
};

