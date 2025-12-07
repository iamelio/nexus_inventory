import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        reorder_level: '',
        supplier: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/products`);
            setProducts(res.data.products);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await axios.put(`${API_URL}/api/products/${editingId}`, formData);
            } else {
                await axios.post(`${API_URL}/api/products`, formData);
            }
            fetchProducts();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`${API_URL}/api/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error("Error deleting product", err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            quantity: '',
            reorder_level: '',
            supplier: ''
        });
        setEditingId(null);
        setError('');
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            </div>

            {/* Add/Edit Form */}
            <div className="card p-8">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <PlusIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                            placeholder="e.g. Widget X"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                            placeholder="Product details..."
                        ></textarea>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required min="0"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                        <input type="number" name="reorder_level" value={formData.reorder_level} onChange={handleInputChange} required
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm py-2.5 px-3 border"
                        />
                    </div>
                    <div className="sm:col-span-6 flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-2">
                        {editingId && (
                            <button type="button" onClick={resetForm} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">Product List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity <= product.reorder_level ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.reorder_level}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                        No products found. Add one above.
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

export default Inventory;
