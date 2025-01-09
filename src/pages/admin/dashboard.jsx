// src/pages/admin/dashboard.jsx

// Import necessary modules and hooks
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import sendRequest from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  MoreVertical,
} from "lucide-react";

// Updated Time frame options
const TIME_FRAMES = [
  { value: "weekly", label: "Last Week" },
  { value: "monthly", label: "Last Month" },
  { value: "annually", label: "Last Year" },
];

// Colors for charts and emojis
const COLORS = ["#4ade80", "#f87171"]; // Green for good, Red for bad

export default function Dashboard() {
  const { user } = useAuth();
  console.log(user.role);

  // State Variables for Reports
  const [totalSalesData, setTotalSalesData] = useState([]);
  const [totalSalesTrend, setTotalSalesTrend] = useState(null);

  const [totalRevenueData, setTotalRevenueData] = useState([]);
  const [totalRevenueTrend, setTotalRevenueTrend] = useState(null);

  const [salesData, setSalesData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  // Removed Registrations State
  // const [registrationsData, setRegistrationsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  // Added Review Report State
  const [reviewData, setReviewData] = useState([]);

  // State for Time Frames
  const [salesTimeFrame, setSalesTimeFrame] = useState("monthly");
  const [transactionsTimeFrame, setTransactionsTimeFrame] = useState("monthly");
  // Removed Registrations TimeFrame
  // const [registrationsTimeFrame, setRegistrationsTimeFrame] = useState("monthly");
  const [revenueTimeFrame, setRevenueTimeFrame] = useState("monthly");
  const [usersTimeFrame, setUsersTimeFrame] = useState("monthly");
  const [productsTimeFrame, setProductsTimeFrame] = useState("monthly");
  // Added Review TimeFrame
  const [reviewTimeFrame, setReviewTimeFrame] = useState("monthly");

  // Loading and Error States
  const [loading, setLoading] = useState({
    sales: false,
    transactions: false,
    revenue: false,
    users: false,
    products: false,
    review: false, // Added for Review Report
  });

  const [error, setError] = useState({
    sales: null,
    transactions: null,
    revenue: null,
    users: null,
    products: null,
    review: null, // Added for Review Report
  });

  // Helper function to format currency
  const formatValue = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to get current and previous values
  const getCurrentAndPrevious = (data, valueKey) => {
    if (!data || data.length === 0) {
      return { current: 0, previous: 0 };
    }
    const sortedData = [...data].sort(
      (a, b) => new Date(a.groupingKey) - new Date(b.groupingKey)
    );
    const lastIndex = sortedData.length - 1;
    const current = sortedData[lastIndex][valueKey] || 0;
    const previous = sortedData[lastIndex - 1]
      ? sortedData[lastIndex - 1][valueKey]
      : 0;
    return { current, previous };
  };

  // Fetch functions for each report
  const fetchSalesData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, sales: true }));
    setError((prev) => ({ ...prev, sales: null }));
    try {
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/sales`,
        null,
        true
      );
      console.log("Sales data fetched: ", response.data);
      if (Array.isArray(response.data)) {
        setSalesData(response.data);
        setTotalSalesData(response.data);
      } else {
        console.warn(
          "Expected sales data to be an array, but got:",
          response.data
        );
        setSalesData([]);
        setTotalSalesData([]);
      }

      // Calculate trend
      if (Array.isArray(response.data) && response.data.length >= 2) {
        const { current, previous } = getCurrentAndPrevious(
          response.data,
          "totalSalesAmount"
        );
        setTotalSalesTrend(current >= previous ? "up" : "down");
      } else {
        setTotalSalesTrend(null);
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError((prev) => ({
        ...prev,
        sales: err.message || "Error fetching sales data",
      }));
      setSalesData([]);
      setTotalSalesData([]);
    } finally {
      setLoading((prev) => ({ ...prev, sales: false }));
    }
  };

  const fetchTransactionsData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, transactions: true }));
    setError((prev) => ({ ...prev, transactions: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/transactions`,
        payload,
        true
      );
      console.log("Fetch transaction data: ", response.data);
      if (Array.isArray(response.data)) {
        setTransactionsData(response.data);
      } else {
        console.warn(
          "Expected transactions data to be an array, but got:",
          response.data
        );
        setTransactionsData([]);
      }
    } catch (err) {
      console.error("Error fetching transactions data:", err);
      setError((prev) => ({
        ...prev,
        transactions: err.message || "Error fetching transactions data",
      }));
      setTransactionsData([]); // Optionally set to empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  const fetchRevenueData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, revenue: true }));
    setError((prev) => ({ ...prev, revenue: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/revenue`,
        payload,
        true
      );
      console.log("Fetch revenue data:", response.data);
      if (Array.isArray(response.data)) {
        setTotalRevenueData(response.data);
      } else {
        console.warn(
          "Expected revenue data to be an array, but got:",
          response.data
        );
        setTotalRevenueData([]);
      }

      // Calculate trend
      if (Array.isArray(response.data) && response.data.length >= 2) {
        const { current, previous } = getCurrentAndPrevious(
          response.data,
          "totalRevenue"
        );
        setTotalRevenueTrend(current >= previous ? "up" : "down");
      } else {
        setTotalRevenueTrend(null);
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError((prev) => ({
        ...prev,
        revenue: err.message || "Error fetching revenue data",
      }));
      setTotalRevenueData([]);
    } finally {
      setLoading((prev) => ({ ...prev, revenue: false }));
    }
  };

  const fetchUsersData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/user-status`,
        payload,
        true
      );
      console.log("Fetch user data: ", response.data);
      if (Array.isArray(response.data)) {
        setUsersData(response.data);
      } else {
        console.warn(
          "Expected users data to be an array, but got:",
          response.data
        );
        setUsersData([]);
      }
    } catch (err) {
      console.error("Error fetching users data:", err);
      setError((prev) => ({
        ...prev,
        users: err.message || "Error fetching users data",
      }));
      setUsersData([]);
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchProductsData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, products: true }));
    setError((prev) => ({ ...prev, products: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/product-categories`,
        payload,
        true
      );
      console.log("Product category data:", response.data);
      if (Array.isArray(response.data)) {
        setProductsData(response.data);
      } else {
        console.warn(
          "Expected products data to be an array, but got:",
          response.data
        );
        setProductsData([]);
      }
    } catch (err) {
      console.error("Error fetching products data:", err);
      setError((prev) => ({
        ...prev,
        products: err.message || "Error fetching products data",
      }));
      setProductsData([]);
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };
  const handleJobRequest = async () => {
    try {
      await sendRequest(
        RequestMethods.POST,
        `/buyer-item/make-pay-to-user`,
        null,
        true
      );
    } catch (err) {
      console.error("Error fetching review data:", err);
      setError((prev) => ({
        ...prev,
        review: err.message || "Error fetching review data",
      }));
      setReviewData([]); // Optionally set to empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, review: false }));
    }
  };
  // Added Fetch Function for Review Report
  const fetchReviewData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, review: true }));
    setError((prev) => ({ ...prev, review: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/reviews`,
        payload,
        true
      );
      console.log("Fetch review data:", response.data);
      if (Array?.isArray(response.data)) {
        setReviewData(response.data);
      } else {
        console.warn(
          "Expected review data to be an array, but got:",
          response.data
        );
        setReviewData([]);
      }
    } catch (err) {
      console.error("Error fetching review data:", err);
      setError((prev) => ({
        ...prev,
        review: err.message || "Error fetching review data",
      }));
      setReviewData([]); // Optionally set to empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, review: false }));
    }
  };

  // Fetch all data on component mount with default time frame (monthly)
  useEffect(() => {
    fetchSalesData("monthly");
    fetchTransactionsData("monthly");
    // fetchRegistrationsData("monthly"); // Removed
    fetchRevenueData("monthly");
    fetchUsersData("monthly");
    fetchProductsData("monthly");
    fetchReviewData("monthly"); // Added
  }, []);

  // Calculate performanceData
  let performanceData = [];
  if (
    !loading.sales &&
    !loading.revenue &&
    !loading.transactions &&
    !loading.review &&
    !loading.users &&
    !loading.products &&
    Array.isArray(salesData) &&
    Array.isArray(totalRevenueData) &&
    Array.isArray(transactionsData) &&
    Array.isArray(reviewData) &&
    Array.isArray(usersData) &&
    Array.isArray(productsData) &&
    salesData.length > 0 &&
    totalRevenueData.length > 0 &&
    transactionsData.length > 0 &&
    reviewData.length > 0 &&
    usersData.length > 0 &&
    productsData.length > 0
  ) {
    const salesValues = getCurrentAndPrevious(salesData, "totalSalesAmount");
    const revenueValues = getCurrentAndPrevious(
      totalRevenueData,
      "totalRevenue"
    );
    const transactionsValues = getCurrentAndPrevious(
      transactionsData,
      "totalTransactions"
    );
    const reviewValues = getCurrentAndPrevious(
      reviewData,
      "GoodReviews" // Assuming you want to track good reviews
    );

    performanceData = [
      {
        subject: "Sales",
        Current: salesValues.current,
        Previous: salesValues.previous,
      },
      {
        subject: "Revenue",
        Current: revenueValues.current,
        Previous: revenueValues.previous,
      },
      {
        subject: "Transactions",
        Current: transactionsValues.current,
        Previous: transactionsValues.previous,
      },
      {
        subject: "Reviews",
        Current: reviewValues.current,
        Previous: reviewValues.previous,
      },
    ];
  }

  // Handlers for time frame changes
  const handleTimeFrameChange = (widget, value) => {
    if (widget === "sales") {
      setSalesTimeFrame(value);
      fetchSalesData(value);
    } else if (widget === "transactions") {
      setTransactionsTimeFrame(value);
      fetchTransactionsData(value);
    } else if (widget === "review") {
      setReviewTimeFrame(value);
      fetchReviewData(value);
    } else if (widget === "revenue") {
      setRevenueTimeFrame(value);
      fetchRevenueData(value);
    } else if (widget === "users") {
      setUsersTimeFrame(value);
      fetchUsersData(value);
    } else if (widget === "products") {
      setProductsTimeFrame(value);
      fetchProductsData(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Card */}
      <div className="grid gap-6 md:grid-cols-2">
        {totalSalesTrend && (
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  Welcome Back, {user.name}!{" "}
                  {totalSalesTrend === "up" ? "😊" : "😞"}
                </h2>
                <p className="text-muted-foreground">
                  {totalSalesTrend === "up"
                    ? "Sales have increased compared to last month!"
                    : "Sales have decreased compared to last month."}
                </p>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatValue(
                      salesData.reduce(
                        (sum, item) => sum + (item.totalSalesAmount || 0),
                        0
                      ) || 0
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {totalSalesTrend === "up" ? "+" : ""}
                      {(
                        ((getCurrentAndPrevious(salesData, "totalSalesAmount")
                          .current -
                          getCurrentAndPrevious(salesData, "totalSalesAmount")
                            .previous) /
                          getCurrentAndPrevious(salesData, "totalSalesAmount")
                            .previous) *
                        100
                      ).toFixed(2)}
                      % from last month
                    </span>

                    {totalSalesTrend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
                    )}
                  </div>
                  {/* Create Button */}
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white mt-5"
                    onClick={handleJobRequest}
                  >
                    Schedule Payments <DollarSign />
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <Trophy
                  className={`h-24 w-24 ${
                    totalSalesTrend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.review ? (
              <p>Loading...</p>
            ) : error.review ? (
              <p className="text-red-500">{error.review}</p>
            ) : Array.isArray(reviewData) && reviewData.length > 0 ? (
              // Aggregate GoodReviews and BadReviews
              (() => {
                const totalGoodReviews = reviewData.reduce(
                  (sum, item) => sum + (item.goodReviews || 0),
                  0
                );
                const totalBadReviews = reviewData.reduce(
                  (sum, item) => sum + (item.badReviews || 0),
                  0
                );
                const totalReviews = totalGoodReviews + totalBadReviews;
                const goodPercentage = totalReviews
                  ? ((totalGoodReviews / totalReviews) * 100).toFixed(2)
                  : 0;
                const badPercentage = totalReviews
                  ? ((totalBadReviews / totalReviews) * 100).toFixed(2)
                  : 0;

                return (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-5xl">😊</span>
                      <div className="flex flex-col items-start">
                        <span className="text-xl font-bold">
                          {totalGoodReviews}
                        </span>
                        <span className="text-sm">Good Reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-5xl">😞</span>
                      <div className="flex flex-col items-start">
                        <span className="text-xl font-bold">
                          {totalBadReviews}
                        </span>
                        <span className="text-sm">Bad Reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Good Reviews: {goodPercentage}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Bad Reviews: {badPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p>No review data available for the selected time frame.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(
                salesData.reduce(
                  (sum, item) => sum + (item.totalSalesAmount || 0),
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSalesTrend === "up" ? "+20.32%" : "-20.32%"} from last month
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(
                totalRevenueData.reduce(
                  (sum, item) => sum + (item.totalRevenue || 0),
                  0
                ) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRevenueTrend === "up" ? "+8.24%" : "-8.24%"} from last month
            </p>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsData.reduce(
                (sum, item) => sum + (item.totalTransactions || 0),
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSalesTrend === "up" ? "+28.14%" : "-28.14%"} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-1">
        {/* Total Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.revenue ? (
              <p>Loading...</p>
            ) : error.revenue ? (
              <p className="text-red-500">{error.revenue}</p>
            ) : Array.isArray(totalRevenueData) &&
              totalRevenueData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={totalRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="groupingKey" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#f97316"
                      fill="#fed7aa"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No revenue data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.sales ||
            loading.revenue ||
            loading.transactions ||
            loading.review ? (
              <p>Loading...</p>
            ) : error.sales ||
              error.revenue ||
              error.transactions ||
              error.review ? (
              <p className="text-red-500">Error loading performance data</p>
            ) : performanceData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Current"
                      dataKey="Current"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Previous"
                      dataKey="Previous"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No performance data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Users by Status Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Users by Status
            </CardTitle>
            <Select
              value={usersTimeFrame}
              onValueChange={(value) => handleTimeFrameChange("users", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_FRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loading.users ? (
              <p>Loading...</p>
            ) : error.users ? (
              <p className="text-red-500">{error.users}</p>
            ) : Array.isArray(usersData) && usersData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usersData}
                      dataKey="totalUsers"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {usersData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No user data available for the selected time frame.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products by Category */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Products by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.products ? (
            <p>Loading...</p>
          ) : error.products ? (
            <p className="text-red-500">{error.products}</p>
          ) : Array.isArray(productsData) && productsData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoryName" />
                  <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="totalProducts"
                    fill="#f97316"
                    name="Total Products"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="averagePrice"
                    fill="#94a3b8"
                    name="Avg. Price"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No product category data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
