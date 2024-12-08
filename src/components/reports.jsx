import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from 'recharts'

// Time frame options
const TIME_FRAMES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
  { value: '7years', label: '7 Years' }
]

// Colors for charts
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa']

// Dummy data
const dummyData = {
  sales: {
    weekly: [
      { groupingKey: '2024-11-01', totalSales: 15, totalSalesAmount: 5000 },
      { groupingKey: '2024-11-02', totalSales: 20, totalSalesAmount: 6500 },
      { groupingKey: '2024-11-03', totalSales: 18, totalSalesAmount: 5800 },
      { groupingKey: '2024-11-04', totalSales: 25, totalSalesAmount: 7500 },
      { groupingKey: '2024-11-05', totalSales: 22, totalSalesAmount: 7000 },
      { groupingKey: '2024-11-06', totalSales: 30, totalSalesAmount: 9000 },
      { groupingKey: '2024-11-07', totalSales: 28, totalSalesAmount: 8500 },
    ],
    monthly: [
      { groupingKey: '2024-06', totalSales: 100, totalSalesAmount: 45000 },
      { groupingKey: '2024-07', totalSales: 120, totalSalesAmount: 52000 },
      { groupingKey: '2024-08', totalSales: 110, totalSalesAmount: 48000 },
      { groupingKey: '2024-09', totalSales: 130, totalSalesAmount: 55000 },
      { groupingKey: '2024-10', totalSales: 140, totalSalesAmount: 60000 },
      { groupingKey: '2024-11', totalSales: 150, totalSalesAmount: 65000 },
    ],
    annually: [
      { groupingKey: '2020', totalSales: 1200, totalSalesAmount: 600000 },
      { groupingKey: '2021', totalSales: 1500, totalSalesAmount: 750000 },
      { groupingKey: '2022', totalSales: 1800, totalSalesAmount: 900000 },
      { groupingKey: '2023', totalSales: 2000, totalSalesAmount: 1000000 },
      { groupingKey: '2024', totalSales: 2200, totalSalesAmount: 1100000 },
    ],
  },
  transactions: {
    weekly: [
      { groupingKey: '2024-11-01', totalTransactions: 25, totalTransactionAmount: 5000 },
      { groupingKey: '2024-11-02', totalTransactions: 30, totalTransactionAmount: 6000 },
      { groupingKey: '2024-11-03', totalTransactions: 28, totalTransactionAmount: 5600 },
      { groupingKey: '2024-11-04', totalTransactions: 35, totalTransactionAmount: 7000 },
      { groupingKey: '2024-11-05', totalTransactions: 32, totalTransactionAmount: 6400 },
      { groupingKey: '2024-11-06', totalTransactions: 40, totalTransactionAmount: 8000 },
      { groupingKey: '2024-11-07', totalTransactions: 38, totalTransactionAmount: 7600 },
    ],
    monthly: [
      { groupingKey: '2024-06', totalTransactions: 300, totalTransactionAmount: 60000 },
      { groupingKey: '2024-07', totalTransactions: 320, totalTransactionAmount: 64000 },
      { groupingKey: '2024-08', totalTransactions: 310, totalTransactionAmount: 62000 },
      { groupingKey: '2024-09', totalTransactions: 330, totalTransactionAmount: 66000 },
      { groupingKey: '2024-10', totalTransactions: 340, totalTransactionAmount: 68000 },
      { groupingKey: '2024-11', totalTransactions: 350, totalTransactionAmount: 70000 },
    ],
    annually: [
      { groupingKey: '2020', totalTransactions: 3500, totalTransactionAmount: 700000 },
      { groupingKey: '2021', totalTransactions: 4000, totalTransactionAmount: 800000 },
      { groupingKey: '2022', totalTransactions: 4500, totalTransactionAmount: 900000 },
      { groupingKey: '2023', totalTransactions: 5000, totalTransactionAmount: 1000000 },
      { groupingKey: '2024', totalTransactions: 5500, totalTransactionAmount: 1100000 },
    ],
  },
  registrations: {
    weekly: [
      { groupingKey: '2024-11-01', totalRegistrations: 10 },
      { groupingKey: '2024-11-02', totalRegistrations: 15 },
      { groupingKey: '2024-11-03', totalRegistrations: 12 },
      { groupingKey: '2024-11-04', totalRegistrations: 18 },
      { groupingKey: '2024-11-05', totalRegistrations: 14 },
      { groupingKey: '2024-11-06', totalRegistrations: 20 },
      { groupingKey: '2024-11-07', totalRegistrations: 16 },
    ],
    monthly: [
      { groupingKey: '2024-06', totalRegistrations: 300 },
      { groupingKey: '2024-07', totalRegistrations: 320 },
      { groupingKey: '2024-08', totalRegistrations: 310 },
      { groupingKey: '2024-09', totalRegistrations: 330 },
      { groupingKey: '2024-10', totalRegistrations: 340 },
      { groupingKey: '2024-11', totalRegistrations: 350 },
    ],
    annually: [
      { groupingKey: '2020', totalRegistrations: 1200 },
      { groupingKey: '2021', totalRegistrations: 1500 },
      { groupingKey: '2022', totalRegistrations: 1800 },
      { groupingKey: '2023', totalRegistrations: 2000 },
      { groupingKey: '2024', totalRegistrations: 2200 },
    ],
  },
  revenue: {
    weekly: [
      { groupingKey: '2024-11-01', totalRevenue: 5000.75 },
      { groupingKey: '2024-11-02', totalRevenue: 6500.50 },
      { groupingKey: '2024-11-03', totalRevenue: 5800.25 },
      { groupingKey: '2024-11-04', totalRevenue: 7500.00 },
      { groupingKey: '2024-11-05', totalRevenue: 7000.50 },
      { groupingKey: '2024-11-06', totalRevenue: 9000.75 },
      { groupingKey: '2024-11-07', totalRevenue: 8500.25 },
    ],
    monthly: [
      { groupingKey: '2024-06', totalRevenue: 45000.50 },
      { groupingKey: '2024-07', totalRevenue: 52000.75 },
      { groupingKey: '2024-08', totalRevenue: 48000.25 },
      { groupingKey: '2024-09', totalRevenue: 55000.00 },
      { groupingKey: '2024-10', totalRevenue: 60000.50 },
      { groupingKey: '2024-11', totalRevenue: 65000.75 },
    ],
    annually: [
      { groupingKey: '2020', totalRevenue: 600000 },
      { groupingKey: '2021', totalRevenue: 750000 },
      { groupingKey: '2022', totalRevenue: 900000 },
      { groupingKey: '2023', totalRevenue: 1000000 },
      { groupingKey: '2024', totalRevenue: 1100000 },
    ],
  },
  users: [
    { status: 'Active', totalUsers: 1200 },
    { status: 'Pending', totalUsers: 150 },
    { status: 'Suspended', totalUsers: 50 },
  ],
  products: [
    { categoryName: 'Electronics', totalProducts: 120, averagePrice: 250.75 },
    { categoryName: 'Clothing', totalProducts: 80, averagePrice: 50.25 },
    { categoryName: 'Home & Garden', totalProducts: 100, averagePrice: 75.50 },
    { categoryName: 'Sports', totalProducts: 60, averagePrice: 100.00 },
  ],
}

export function BlockPage() {
  const [timeFrames, setTimeFrames] = useState({
    sales: 'weekly',
    transactions: 'weekly',
    registrations: 'weekly',
    revenue: 'weekly',
    users: 'weekly',
    products: 'weekly'
  })

  const [data, setData] = useState({
    sales: dummyData.sales.weekly,
    transactions: dummyData.transactions.weekly,
    registrations: dummyData.registrations.weekly,
    revenue: dummyData.revenue.weekly,
    users: dummyData.users,
    products: dummyData.products
  })

  const handleTimeFrameChange = (widget, value) => {
    setTimeFrames(prev => ({ ...prev, [widget]: value }))
    if (widget !== 'users' && widget !== 'products') {
      setData(prev => ({ ...prev, [widget]: dummyData[widget][value] }))
    }
  }

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  return (
    (<div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <Select
              value={timeFrames.sales}
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
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupingKey" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalSales" stroke="#f97316" fill="#fed7aa" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Select
              value={timeFrames.transactions}
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
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.transactions}>
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
          </CardContent>
        </Card>

        {/* Revenue Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Select
              value={timeFrames.revenue}
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
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupingKey" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#f97316" fill="#fed7aa" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Select
              value={timeFrames.registrations}
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
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.registrations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupingKey" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalRegistrations" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Users Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.users}
                    dataKey="totalUsers"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label>
                    {data.users.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Products by Category Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.products}>
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
                  <Bar yAxisId="right" dataKey="averagePrice" fill="#94a3b8" name="Avg. Price" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>)
  );
}