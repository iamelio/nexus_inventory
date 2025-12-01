import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './App';
import { ShoppingCartIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/products');
                setProducts(res.data.products);
            } catch (err) {
                console.error("Error fetching products", err);
            }
        };
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError('');

        if (!selectedProduct || !quantity) {
            setError("Please select a product and enter quantity");
            return;
        }

        try {
            const res = await axios.post('http://localhost:5001/api/sales', {
                product_id: selectedProduct,
                quantity: parseInt(quantity),
                sold_by: user.id
            });
            setMessage(`Sale successful! Total: $${res.data.total_amount.toFixed(2)}`);
            setQuantity('');
            setSelectedProduct('');
        } catch (err) {
            setError(err.response?.data?.error || "Transaction failed");
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="card p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Record New Sale</h1>
                    <p className="mt-2 text-sm text-gray-500">Select a product and enter the quantity to process a transaction.</p>
                </div>

                {message && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center animate-fade-in">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                        <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center animate-fade-in">
                        <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg border shadow-sm"
                        >
                            <option value="">-- Choose a product --</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.quantity} | ${product.price})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm border"
                            placeholder="Enter amount..."
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full btn-primary flex justify-center items-center py-3"
                        >
                            Process Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Sales;
