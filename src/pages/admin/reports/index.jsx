// Import necessary modules and hooks
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/layouts/admin-layout";
import sendRequest from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Time frame options (Five Years removed)
const TIME_FRAMES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

// Colors for charts
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#4ade80', '#f87171']; // Extended for more charts

export default function ReportsDashboard() {
  // State for Total Sales
  const [totalSalesTimeFrame, setTotalSalesTimeFrame] = useState('monthly');
  const [totalSalesData, setTotalSalesData] = useState([]);
  const [totalSalesTrend, setTotalSalesTrend] = useState(null);

  // State for Total Revenue
  const [totalRevenueTimeFrame, setTotalRevenueTimeFrame] = useState('monthly');
  const [totalRevenueData, setTotalRevenueData] = useState([]);
  const [totalRevenueTrend, setTotalRevenueTrend] = useState(null);

  // State for Sales Report
  const [salesTimeFrame, setSalesTimeFrame] = useState('monthly');
  const [salesData, setSalesData] = useState([]);

  // State for Transactions Report
  const [transactionsTimeFrame, setTransactionsTimeFrame] = useState('monthly');
  const [transactionsData, setTransactionsData] = useState([]);

  // *** Removed Registrations Report State ***
  // const [registrationsTimeFrame, setRegistrationsTimeFrame] = useState('monthly');
  // const [registrationsData, setRegistrationsData] = useState([]);

  // State for Reviews Report (Replaces Registrations)
  const [reviewsTimeFrame, setReviewsTimeFrame] = useState('monthly');
  const [reviewsData, setReviewsData] = useState([]);

  // State for Users by Status
  const [usersTimeFrame, setUsersTimeFrame] = useState('monthly');
  const [usersData, setUsersData] = useState([]);

  // State for Products by Category
  const [productsTimeFrame, setProductsTimeFrame] = useState('monthly');
  const [productsData, setProductsData] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    sales: false,
    transactions: false,
    // registrations: false, // *** Removed ***
    reviews: false, // *** Added for Reviews ***
    revenue: false,
    users: false,
    products: false
  });

  // Error states
  const [error, setError] = useState({
    sales: null,
    transactions: null,
    // registrations: null, // *** Removed ***
    reviews: null, // *** Added for Reviews ***
    revenue: null,
    users: null,
    products: null
  });

  // Helper function to format currency
  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper function to get current and previous values for trend calculation
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
    setLoading(prev => ({ ...prev, sales: true }));
    setError(prev => ({ ...prev, sales: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/sales`,
        payload,
        true
      );
      console.log("Sales data fetched: ", response.data);
      setSalesData(Array.isArray(response.data) ? response.data : []);
      setTotalSalesData(Array.isArray(response.data) ? response.data : []);

      // Calculate trend
      if (Array.isArray(response.data) && response.data.length >= 2) {
        const { current, previous } = getCurrentAndPrevious(response.data, "totalSalesAmount");
        setTotalSalesTrend(current >= previous ? 'up' : 'down');
      } else {
        setTotalSalesTrend(null);
      }
    } catch (err) {
      setError(prev => ({ ...prev, sales: err.message || 'Error fetching sales data' }));
      setSalesData([]); // Reset to empty array on error
      setTotalSalesData([]);
    } finally {
      setLoading(prev => ({ ...prev, sales: false }));
    }
  };

  const fetchTransactionsData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/transactions`,
        payload,
        true
      );
      console.log("Fetch transaction data: ", response.data);
      setTransactionsData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({ ...prev, transactions: err.message || 'Error fetching transactions data' }));
      setTransactionsData([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  
  // *** Added Reviews Fetch Function ***
  const fetchReviewsData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, reviews: true }));
    setError(prev => ({ ...prev, reviews: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/reviews`,
        payload,
        true
      );
      console.log("Fetch review data:", response.data);
      setReviewsData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({ ...prev, reviews: err.message || 'Error fetching review data' }));
      setReviewsData([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const fetchRevenueData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, revenue: true }));
    setError(prev => ({ ...prev, revenue: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/revenue`,
        payload,
        true
      );
      console.log("Fetch revenue data:", response.data);
      setTotalRevenueData(Array.isArray(response.data) ? response.data : []);

      // Calculate trend
      if (Array.isArray(response.data) && response.data.length >= 2) {
        const { current, previous } = getCurrentAndPrevious(response.data, "totalRevenue");
        setTotalRevenueTrend(current >= previous ? 'up' : 'down');
      } else {
        setTotalRevenueTrend(null);
      }
    } catch (err) {
      setError(prev => ({ ...prev, revenue: err.message || 'Error fetching revenue data' }));
      setTotalRevenueData([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, revenue: false }));
    }
  };

  const fetchUsersData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(prev => ({ ...prev, users: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/user-status`,
        payload,
        true
      );
      console.log("Fetch user data: ", response.data);
      setUsersData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({ ...prev, users: err.message || 'Error fetching users data' }));
      setUsersData([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchProductsData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, products: true }));
    setError(prev => ({ ...prev, products: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/product-categories`,
        payload,
        true
      );
      console.log("Product category data:", response.data);
      setProductsData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(prev => ({ ...prev, products: err.message || 'Error fetching products data' }));
      setProductsData([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Fetch all data on component mount with default time frame (monthly)
  useEffect(() => {
    fetchSalesData('monthly');
    fetchTransactionsData('monthly');
    // fetchRegistrationsData('monthly'); // *** Removed ***
    fetchReviewsData('monthly'); // *** Added for Reviews ***
    fetchRevenueData('monthly');
    fetchUsersData('monthly');
    fetchProductsData('monthly');
  }, []);

  // Handlers for time frame changes
  const handleTimeFrameChange = (widget, value) => {
    if (widget === 'sales') {
      setSalesTimeFrame(value);
      fetchSalesData(value);
    } else if (widget === 'transactions') {
      setTransactionsTimeFrame(value);
      fetchTransactionsData(value);
    } 
    // else if (widget === 'registrations') { // *** Removed ***
    //   setRegistrationsTimeFrame(value);
    //   fetchRegistrationsData(value);
    // }
    else if (widget === 'reviews') { // *** Added ***
      setReviewsTimeFrame(value);
      fetchReviewsData(value);
    } else if (widget === 'revenue') {
      setTotalRevenueTimeFrame(value);
      fetchRevenueData(value);
    } else if (widget === 'users') {
      setUsersTimeFrame(value);
      fetchUsersData(value);
    } else if (widget === 'products') {
      setProductsTimeFrame(value);
      fetchProductsData(value);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports Dashboard</h1>

      {/* Row 1: Total Sales and Total Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Sales Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Select
              value={totalSalesTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('sales', value)}>
              <SelectTrigger className="w-[120px]">
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
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {formatValue(
                totalSalesData?.reduce(
                  (sum, item) => sum + (item.totalSalesAmount || 0),
                  0
                ) || 0
              )}
            </div>
            <div className={`flex items-center ${totalSalesTrend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {totalSalesTrend === 'up' ? '▲' : '▼'}
              <span className="ml-1">
                {totalSalesTrend === 'up' ? 'Increasing' : 'Decreasing'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Select
              value={totalRevenueTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('revenue', value)}>
              <SelectTrigger className="w-[120px]">
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
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {formatValue(
                totalRevenueData.reduce(
                  (sum, item) => sum + (item.totalRevenue || 0),
                  0
                ) || 0
              )}
            </div>
            <div className={`flex items-center ${totalRevenueTrend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {totalRevenueTrend === 'up' ? '▲' : '▼'}
              <span className="ml-1">
                {totalRevenueTrend === 'up' ? 'Increasing' : 'Decreasing'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Sales Report and Transactions Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Report Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <Select
              value={salesTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('sales', value)}>
              <SelectTrigger className="w-[120px]">
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
            {loading.sales ? (
              <p>Loading...</p>
            ) : error.sales ? (
              <p className="text-red-500">{error.sales}</p>
            ) : (!salesData || salesData.length === 0) ? (
              <p>No sales data available for the selected time frame.</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="groupingKey" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="totalSalesAmount" stroke="#f97316" fill="#fed7aa" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions Report Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Select
              value={transactionsTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('transactions', value)}>
              <SelectTrigger className="w-[120px]">
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
            {loading.transactions ? (
              <p>Loading...</p>
            ) : error.transactions ? (
              <p className="text-red-500">{error.transactions}</p>
            ) : (!transactionsData || transactionsData.length === 0) ? (
              <p>No transaction data available for the selected time frame.</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="groupingKey" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="totalTransactions"
                      stroke="#f97316"
                      strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Revenue Chart =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> please don't delete this section it is the Revenue  section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Chart</CardTitle>
          <Select
            value={totalRevenueTimeFrame}
            onValueChange={(value) => {
              setTotalRevenueTimeFrame(value);
              fetchRevenueData(value);
            }}>
            <SelectTrigger className="w-[120px]">
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
          {loading.revenue ? (
            <p>Loading...</p>
          ) : error.revenue ? (
            <p className="text-red-500">{error.revenue}</p>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={totalRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupingKey" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#f97316" fill="#fed7aa" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Users by Status and Reviews Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users by Status Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users by Status</CardTitle>
            <Select
              value={usersTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('users', value)}>
              <SelectTrigger className="w-[120px]">
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
            ) : (!usersData || usersData.length === 0) ? (
              <p>No user data available for the selected time frame.</p>
            ) : (
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
                      label>
                      {usersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Report Widget*/}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Select
              value={reviewsTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('reviews', value)}>
              <SelectTrigger className="w-[120px]">
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
            {loading.reviews ? (
              <p>Loading...</p>
            ) : error.reviews ? (
              <p className="text-red-500">{error.reviews}</p>
            ) : (!reviewsData || reviewsData.length === 0) ? (
              <p>No review data available for the selected time frame.</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="groupingKey" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="goodReviews" fill="#4ade80" name="Good Reviews" />
                    <Bar dataKey="badReviews" fill="#f87171" name="Bad Reviews" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Products by Category */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products by Category</CardTitle>
          <Select
            value={productsTimeFrame}
            onValueChange={(value) => handleTimeFrameChange('products', value)}>
            <SelectTrigger className="w-[120px]">
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
          {loading.products ? (
            <p>Loading...</p>
          ) : error.products ? (
            <p className="text-red-500">{error.products}</p>
          ) : (!productsData || productsData.length === 0) ? (
            <p>No product category data available for the selected time frame.</p>
          ) : (
            <div className="h-[200px]">
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
                    name="Total Products" />
                  <Bar
                    yAxisId="right"
                    dataKey="averagePrice"
                    fill="#94a3b8"
                    name="Avg. Price" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

ReportsDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
