import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExclamationTriangleIcon, CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [stats, setStats] = useState({ totalInventoryValue: 0, recentSales: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lowStockRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/dashboard/low-stock'),
                    axios.get('http://localhost:5001/api/dashboard/stats')
                ]);
                setLowStockItems(lowStockRes.data.lowStockItems);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-red-800">Low Stock Alert</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {lowStockItems.map(item => (
                                        <li key={item.id}>
                                            <span className="font-semibold">{item.name}</span> (Qty: {item.quantity}, Reorder Level: {item.reorder_level})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Inventory Value Card */}
                <div className="card p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white transform transition hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-100 uppercase tracking-wider">Total Inventory Value</p>
                            <p className="mt-2 text-3xl font-bold">
                                ${stats.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                            <CurrencyDollarIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Placeholder for other stats */}
                <div className="card p-6 bg-gradient-to-br from-pink-500 to-rose-500 text-white transform transition hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-100 uppercase tracking-wider">Total Products</p>
                            <p className="mt-2 text-3xl font-bold">
                                {stats.recentSales.length > 0 ? 'Active' : 'N/A'}
                                {/* Note: Backend doesn't send total products count yet, just a placeholder visual */}
                            </p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                            <ShoppingBagIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.recentSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(sale.date).toLocaleDateString()} <span className="text-gray-400 text-xs">{new Date(sale.date).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.product_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {sale.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sale.total_amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                                            {sale.sold_by.charAt(0).toUpperCase()}
                                        </div>
                                        {sale.sold_by}
                                    </td>
                                </tr>
                            ))}
                            {stats.recentSales.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                        No recent sales found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
