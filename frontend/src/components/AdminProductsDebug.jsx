import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProductsDebug = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/products');
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.data);
        console.log('Products loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Products Debug</h1>
      <p>Total products: {products.length}</p>
      
      <div style={{ marginTop: '20px' }}>
        {products.slice(0, 5).map(product => (
          <div key={product._id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            marginBottom: '10px' 
          }}>
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price?.toLocaleString('en-IN')}</p>
            <p>Category: {product.category?.name || 'N/A'}</p>
            <p>Company: {typeof product.company === 'object' ? product.company?.name : product.company || 'N/A'}</p>
            <p>Item Type: {product.itemType?.name || 'N/A'}</p>
            <p>Images: {product.images?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductsDebug;
