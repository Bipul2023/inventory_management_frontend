import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/orders'),
        ]);

        const products = productsRes.data;
        const lowStock = products.filter(p => p.quantity_in_stock < 10).length;

        setStats({
          totalProducts: products.length,
          totalCustomers: customersRes.data.length,
          totalOrders: ordersRes.data.length,
          lowStockItems: lowStock,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error">{error}</Typography>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="mb-6 font-bold text-gray-800">
        Dashboard
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <Typography color="textSecondary" className="text-sm font-medium uppercase tracking-wider mb-2">Total Products</Typography>
          <Typography variant="h4" className="font-semibold text-blue-600">{stats.totalProducts}</Typography>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <Typography color="textSecondary" className="text-sm font-medium uppercase tracking-wider mb-2">Total Customers</Typography>
          <Typography variant="h4" className="font-semibold text-green-600">{stats.totalCustomers}</Typography>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <Typography color="textSecondary" className="text-sm font-medium uppercase tracking-wider mb-2">Total Orders</Typography>
          <Typography variant="h4" className="font-semibold text-purple-600">{stats.totalOrders}</Typography>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <Typography color="textSecondary" className="text-sm font-medium uppercase tracking-wider mb-2">Low Stock Items</Typography>
          <Typography variant="h4" className={`font-semibold ${stats.lowStockItems > 0 ? 'text-red-500' : 'text-gray-700'}`}>
            {stats.lowStockItems}
          </Typography>
        </div>
      </div>
    </div>
  );
}
