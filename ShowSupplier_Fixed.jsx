import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/Spinner';

export default function ShowSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        // Use 'jwtToken' key to match your backend
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`http://localhost:5000/api/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success) {
          setSupplier(response.data.data);
        } else {
          console.error('Failed to fetch supplier:', response.data?.message);
          // Fallback to dummy data with correct field structure
          const dummySupplier = {
            id: id,
            supplier_id: 'SUP-20250907-0001',
            name: 'Green Tea Supplies',
            contact_number: '0771234567',
            nic_number: '199512345678',
            address: '123 Tea Road, Nuwara Eliya, Sri Lanka',
            bank_account_number: '12345678',
            bank_name: 'Bank of Ceylon',
            rate: 150.00,
            is_active: true,
            created_at: '2025-08-01T10:00:00Z',
            updated_at: '2025-08-01T10:00:00Z',
          };
          setSupplier(dummySupplier);
        }
      } catch (error) {
        console.error('Error fetching supplier:', error);
        // Fallback to dummy data with correct field structure
        const dummySupplier = {
          id: id,
          supplier_id: 'SUP-20250907-0001',
          name: 'Green Tea Supplies',
          contact_number: '0771234567',
          nic_number: '199512345678',
          address: '123 Tea Road, Nuwara Eliya, Sri Lanka',
          bank_account_number: '12345678',
          bank_name: 'Bank of Ceylon',
          rate: 150.00,
          is_active: true,
          created_at: '2025-08-01T10:00:00Z',
          updated_at: '2025-08-01T10:00:00Z',
        };
        setSupplier(dummySupplier);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => navigate('/SupplierHome')}>
      <div className='max-w-4xl w-full max-h-[90vh] bg-white rounded-lg shadow-md flex flex-col' onClick={e => e.stopPropagation()}>
        <div className='overflow-y-auto flex-1 p-8'>
          <h1 className='text-3xl my-4 text-center font-bold text-gray-800'>Supplier Details</h1>
          
          {loading ? (
            <Spinner />
          ) : supplier ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Supplier ID</label>
                    <p className="text-lg text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {supplier.supplier_id || `ID-${supplier.id}` || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg text-gray-900">{supplier.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                    <p className="text-lg text-gray-900">{supplier.contact_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">NIC Number</label>
                    <p className="text-lg text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {supplier.nic_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Rate (LKR/kg)</label>
                    <p className="text-lg text-green-600 font-bold">
                      LKR {supplier.rate ? parseFloat(supplier.rate).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      supplier.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <p className="text-lg text-gray-900 bg-gray-100 p-3 rounded">
                      {supplier.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Banking Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                    <p className="text-lg text-gray-900">{supplier.bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Number</label>
                    <p className="text-lg text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                      {supplier.bank_account_number || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Database ID</label>
                    <p className="text-lg text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                      {supplier.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-lg text-gray-900">
                      {supplier.created_at 
                        ? new Date(supplier.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-lg text-gray-900">
                      {supplier.updated_at 
                        ? new Date(supplier.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/SupplierHome')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate(`/suppliers/edit/${id}`)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Edit Supplier
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
                      navigate(`/suppliers/delete/${id}`);
                    }
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete Supplier
                </button>
                <button
                  onClick={() => navigate(`/suppliers/payments/${id}`)}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  View Payments
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Supplier not found.</p>
              <p className="text-gray-600 mb-4">The supplier with ID {id} could not be retrieved.</p>
              <button
                onClick={() => navigate('/SupplierHome')}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Go Back to Suppliers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
