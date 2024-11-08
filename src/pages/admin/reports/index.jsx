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
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];

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

  // State for Registrations Report
  const [registrationsTimeFrame, setRegistrationsTimeFrame] = useState('monthly');
  const [registrationsData, setRegistrationsData] = useState([]);

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
    registrations: false,
    revenue: false,
    users: false,
    products: false
  });

  // Error states
  const [error, setError] = useState({
    sales: null,
    transactions: null,
    registrations: null,
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
      setSalesData(response.data);
      setTotalSalesData(response.data);

      // Calculate trend
      if (response.data.length >= 2) {
        const currentTotal = response.data[response.data.length - 1].totalSalesAmount;
        const previousTotal = response.data[response.data.length - 2].totalSalesAmount;
        setTotalSalesTrend(currentTotal >= previousTotal ? 'up' : 'down');
      } else {
        setTotalSalesTrend(null);
      }
    } catch (err) {
      setError(prev => ({ ...prev, sales: err.message || 'Error fetching sales data' }));
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
      setTransactionsData(response.data);
    } catch (err) {
      setError(prev => ({ ...prev, transactions: err.message || 'Error fetching transactions data' }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const fetchRegistrationsData = async (timeFrame) => {
    setLoading(prev => ({ ...prev, registrations: true }));
    setError(prev => ({ ...prev, registrations: null }));
    try {
      const payload = { timeFrame };
      const response = await sendRequest(
        RequestMethods.POST,
        `/report/registrations`,
        payload,
        true
      );
      console.log("Registration data:", response.data);
      setRegistrationsData(response.data);
    } catch (err) {
      setError(prev => ({ ...prev, registrations: err.message || 'Error fetching registrations data' }));
    } finally {
      setLoading(prev => ({ ...prev, registrations: false }));
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
      setTotalRevenueData(response.data);

      // Calculate trend
      if (response.data.length >= 2) {
        const currentTotal = response.data[response.data.length - 1].totalRevenue;
        const previousTotal = response.data[response.data.length - 2].totalRevenue;
        setTotalRevenueTrend(currentTotal >= previousTotal ? 'up' : 'down');
      } else {
        setTotalRevenueTrend(null);
      }
    } catch (err) {
      setError(prev => ({ ...prev, revenue: err.message || 'Error fetching revenue data' }));
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
      setUsersData(response.data);
    } catch (err) {
      setError(prev => ({ ...prev, users: err.message || 'Error fetching users data' }));
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
      setProductsData(response.data);
    } catch (err) {
      setError(prev => ({ ...prev, products: err.message || 'Error fetching products data' }));
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Fetch all data on component mount with default time frame (monthly)
  useEffect(() => {
    fetchSalesData('monthly');
    fetchTransactionsData('monthly');
    fetchRegistrationsData('monthly');
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
    } else if (widget === 'registrations') {
      setRegistrationsTimeFrame(value);
      fetchRegistrationsData(value);
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
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {formatValue(
                totalRevenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)
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

      {/* Row 3: Revenue Chart */}
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

      {/* Row 4: Users by Status and Registrations Report */}
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

        {/* Registrations Report Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Select
              value={registrationsTimeFrame}
              onValueChange={(value) => handleTimeFrameChange('registrations', value)}>
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
            {loading.registrations ? (
              <p>Loading...</p>
            ) : error.registrations ? (
              <p className="text-red-500">{error.registrations}</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="groupingKey" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalRegistrations" fill="#f97316" />
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
