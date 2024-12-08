// Import necessary modules and hooks
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import sendRequest from "@/services/requests/request-service";
import RequestMethods from "@/enums/request-methods";
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

// Time frame options - Only Monthly
const TIME_FRAMES = [{ value: "monthly", label: "Monthly" }];

// Colors for charts
const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

// Dashboard Component
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
  const [registrationsData, setRegistrationsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [productsData, setProductsData] = useState([]);

  // Loading and Error States
  const [loading, setLoading] = useState({
    sales: false,
    transactions: false,
    registrations: false,
    revenue: false,
    users: false,
    products: false,
  });

  const [error, setError] = useState({
    sales: null,
    transactions: null,
    registrations: null,
    revenue: null,
    users: null,
    products: null,
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
        const currentTotal =
          response.data[response.data.length - 1].totalSalesAmount;
        const previousTotal =
          response.data[response.data.length - 2].totalSalesAmount;
        setTotalSalesTrend(currentTotal >= previousTotal ? "up" : "down");
      } else {
        setTotalSalesTrend(null);
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError((prev) => ({
        ...prev,
        sales: err.message || "Error fetching sales data",
      }));
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
      setTransactionsData(response.data);
    } catch (err) {
      console.error("Error fetching transactions data:", err);
      setError((prev) => ({
        ...prev,
        transactions: err.message || "Error fetching transactions data",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  const fetchRegistrationsData = async (timeFrame) => {
    setLoading((prev) => ({ ...prev, registrations: true }));
    setError((prev) => ({ ...prev, registrations: null }));
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
      console.error("Error fetching registrations data:", err);
      setError((prev) => ({
        ...prev,
        registrations: err.message || "Error fetching registrations data",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, registrations: false }));
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
      setTotalRevenueData(response.data);

      // Calculate trend
      if (response.data.length >= 2) {
        const currentTotal =
          response.data[response.data.length - 1].totalRevenue;
        const previousTotal =
          response.data[response.data.length - 2].totalRevenue;
        setTotalRevenueTrend(currentTotal >= previousTotal ? "up" : "down");
      } else {
        setTotalRevenueTrend(null);
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError((prev) => ({
        ...prev,
        revenue: err.message || "Error fetching revenue data",
      }));
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
      setUsersData(response.data);
    } catch (err) {
      console.error("Error fetching users data:", err);
      setError((prev) => ({
        ...prev,
        users: err.message || "Error fetching users data",
      }));
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
      setProductsData(response.data);
    } catch (err) {
      console.error("Error fetching products data:", err);
      setError((prev) => ({
        ...prev,
        products: err.message || "Error fetching products data",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  // Fetch all data on component mount with default time frame (monthly)
  useEffect(() => {
    fetchSalesData("monthly");
    fetchTransactionsData("monthly");
    fetchRegistrationsData("monthly");
    fetchRevenueData("monthly");
    fetchUsersData("monthly");
    fetchProductsData("monthly");
  }, []);

  // Calculate performanceData
  let performanceData = [];
  if (
    !loading.sales &&
    !loading.revenue &&
    !loading.transactions &&
    !loading.registrations &&
    salesData.length > 0 &&
    totalRevenueData.length > 0 &&
    transactionsData.length > 0 &&
    registrationsData.length > 0
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
    const registrationsValues = getCurrentAndPrevious(
      registrationsData,
      "totalRegistrations"
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
        subject: "Registrations",
        Current: registrationsValues.current,
        Previous: registrationsValues.previous,
      },
    ];
  }

  // Handlers for time frame changes
  const handleTimeFrameChange = (widget, value) => {
    if (widget === "sales") {
      fetchSalesData(value);
    } else if (widget === "transactions") {
      fetchTransactionsData(value);
    } else if (widget === "registrations") {
      fetchRegistrationsData(value);
    } else if (widget === "revenue") {
      fetchRevenueData(value);
    } else if (widget === "users") {
      fetchUsersData(value);
    } else if (widget === "products") {
      fetchProductsData(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Congratulations Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Congratulations {user.name}! 🎉
              </h2>
              <p className="text-muted-foreground">Best seller of the month</p>
              <div className="mt-4">
                <div className="text-2xl font-bold text-orange-600">$48.9k</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">78% of target</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                View Sales
              </Button>
            </div>
            <div className="hidden md:block">
              <Trophy className="h-24 w-24 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Registrations Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registrations</p>
                <h3 className="text-2xl font-bold">
                  {registrationsData.reduce(
                    (sum, item) => sum + (item.totalRegistrations || 0),
                    0
                  ) || 0}
                </h3>
                <span
                  className={`text-sm ${
                    totalSalesTrend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {totalSalesTrend === "up" ? "+13.24%" : "-13.24%"}
                </span>
              </div>
            </div>
            <div className="h-[100px] mt-4">
              {loading.registrations ? (
                <p>Loading...</p>
              ) : error.registrations ? (
                <p className="text-red-500">{error.registrations}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationsData}>
                    <Area
                      type="monotone"
                      dataKey="totalRegistrations"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
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
      <div className="grid gap-6 md:grid-cols-2">
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
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.sales ||
            loading.transactions ||
            loading.registrations ||
            loading.revenue ? (
              <p>Loading...</p>
            ) : error.sales ||
              error.transactions ||
              error.registrations ||
              error.revenue ? (
              <p className="text-red-500">Error loading performance data</p>
            ) : (
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
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
