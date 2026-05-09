import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNotification } from '../context/NotificationContext';
import './AdminProducts.css';

const AdminProducts = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [companyCounts, setCompanyCounts] = useState({});
  const [itemTypeCounts, setItemTypeCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterItemType, setFilterItemType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    company: '',
    companyName: '',
    brand: '',
    itemType: '',
    itemTypeName: '',
    variant: '',
    price: '',
    originalPrice: '',
    sku: '',
    stock: 0,
    isActive: true,
    tags: '',
    rating: 0,
    specifications: {
      material: '',
      size: '',
      color: '',
      warranty: '',
      features: ''
    }
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkProducts, setBulkProducts] = useState([
    {
      id: Date.now(),
      name: '',
      description: '',
      category: '',
      company: '',
      brand: '',
      price: '',
      sku: '',
      stock: 0,
      images: [],
      isActive: true
    }
  ]);
  const [showBulkImageModal, setShowBulkImageModal] = useState(false);
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkImageCategory, setBulkImageCategory] = useState('');
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [showProductEditPanel, setShowProductEditPanel] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCompanies();
    fetchItemTypes();
  }, [filterCategory, filterCompany, filterItemType, filterStatus, searchTerm]);

  const handleSearch = () => {
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterCompany('');
    setFilterItemType('');
    setFilterStatus('');
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      setLoading(true);
      
      // Build query params
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterCompany) params.company = filterCompany;
      if (filterItemType) params.itemType = filterItemType;
      if (filterStatus) params.isActive = filterStatus === 'active';
      
      const response = await axios.get('http://localhost:5000/api/products', { params });
      console.log('Products response:', response.data);
      
      if (response.data.success) {
        let filteredProducts = response.data.data.filter(p => 
          p && p._id && p.name && p.price
          // Removed the image requirement - show products even without images
        );
        
        // Apply search filter on frontend
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search) ||
            p.sku?.toLowerCase().includes(search) ||
            p.variant?.toLowerCase().includes(search) ||
            (typeof p.company === 'object' ? p.company?.name?.toLowerCase().includes(search) : p.company?.toLowerCase().includes(search))
          );
        }
        
        // Sort by newest first (createdAt descending)
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('Valid products:', filteredProducts.length);
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
        
        // Fetch product count for each category
        const counts = {};
        for (const cat of response.data.data) {
          try {
            const countResponse = await axios.get('http://localhost:5000/api/products', {
              params: { category: cat._id }
            });
            counts[cat._id] = countResponse.data.count || 0;
          } catch (err) {
            counts[cat._id] = 0;
          }
        }
        setCategoryCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies');
      if (response.data.success) {
        // Filter to show only partner companies
        const partnerCompanies = response.data.data.filter(c => c.isPartner);
        setCompanies(partnerCompanies);
        
        // Fetch product count for each company
        const counts = {};
        for (const comp of partnerCompanies) {
          try {
            const countResponse = await axios.get('http://localhost:5000/api/products', {
              params: { company: comp._id }
            });
            counts[comp._id] = countResponse.data.count || 0;
          } catch (err) {
            counts[comp._id] = 0;
          }
        }
        setCompanyCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/item-types');
      setItemTypes(response.data);
      
      // Fetch product count for each item type
      const counts = {};
      for (const itemType of response.data) {
        try {
          const countResponse = await axios.get('http://localhost:5000/api/products', {
            params: { itemType: itemType._id }
          });
          counts[itemType._id] = countResponse.data.count || 0;
        } catch (err) {
          counts[itemType._id] = 0;
        }
      }
      setItemTypeCounts(counts);
    } catch (error) {
      console.error('Error fetching item types:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle company selection
    if (name === 'company') {
      const selectedCompany = companies.find(c => c._id === value);
      setFormData({
        ...formData,
        company: value,
        companyName: selectedCompany ? selectedCompany.name : ''
      });
      return;
    }
    
    // Handle item type selection
    if (name === 'itemType') {
      const selectedItemType = itemTypes.find(it => it._id === value);
      setFormData({
        ...formData,
        itemType: value,
        itemTypeName: selectedItemType ? selectedItemType.name : ''
      });
      return;
    }
    
    // Handle specifications
    if (name.startsWith('spec_')) {
      const specField = name.replace('spec_', '');
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specField]: value
        }
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => {
      const combined = [...prev, ...files];
      return combined.slice(0, 10); // max 10
    });
  };

  // Drag & drop handlers for product image upload
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setSelectedFiles(prev => [...prev, ...files].slice(0, 10));
  };

  // Paste handler — captures Ctrl+V image paste
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles = items
      .filter(item => item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean);
    if (imageFiles.length === 0) return;
    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, 10));
    showNotification(`${imageFiles.length} image(s) pasted!`, 'success');
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Selected files:', selectedFiles);
    console.log('Existing images:', existingImages);
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      showNotification('Please fill in all required fields: Name, Category, and Price', 'error');
      return;
    }

    // Image validation:
    // - New product: must upload at least one image
    // - Editing: OK if existing images remain OR new ones added. Only block if both are empty.
    if (!editingProduct && selectedFiles.length === 0) {
      showNotification('Please select at least one image for the product', 'error');
      return;
    }
    // When editing, allow saving without new images as long as existing images exist
    // If product had no images (e.g. Excel upload), allow saving without images too
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('company', formData.company || '');
    data.append('companyName', formData.companyName || '');
    data.append('brand', formData.brand || '');
    data.append('itemType', formData.itemType || '');
    data.append('itemTypeName', formData.itemTypeName || '');
    data.append('variant', formData.variant || 'Standard');
    data.append('price', formData.price);
    data.append('originalPrice', formData.originalPrice || formData.price);
    data.append('sku', formData.sku || `SKU-${Date.now()}`);
    data.append('stock', formData.stock || 0);
    data.append('isActive', formData.isActive);
    data.append('tags', formData.tags || '');
    data.append('rating', formData.rating || 0);
    data.append('specifications', JSON.stringify(formData.specifications));

    // Add existing images if editing
    if (editingProduct) {
      existingImages.forEach(img => {
        data.append('existingImages', img);
      });
    }

    // Add new images
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      console.log('Sending request...');
      if (editingProduct) {
        const response = await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Update response:', response.data);
        if (response.data.success) {
          showNotification('Product updated successfully!', 'success');
          fetchProducts();
          closeModal();
        }
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Create response:', response.data);
        if (response.data.success) {
          showNotification('Product created successfully!', 'success');
          fetchProducts();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      showNotification(error.response?.data?.message || 'Failed to save product. Check console for details.', 'error');
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      company: (typeof product.company === 'object' ? product.company?._id : '') || '',
      companyName: (typeof product.company === 'object' ? product.company?.name : product.companyName) || product.company || '',
      brand: product.brand || '',
      itemType: (typeof product.itemType === 'object' ? product.itemType?._id : product.itemType) || '',
      itemTypeName: (typeof product.itemType === 'object' ? product.itemType?.name : product.itemTypeName) || '',
      variant: product.variant || '',
      price: product.price || '',
      originalPrice: product.originalPrice || product.mrp || product.price || '',
      sku: product.sku || '',
      stock: product.stock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
      rating: product.rating || 0,
      specifications: {
        material: product.specifications?.material || '',
        size: product.specifications?.size || '',
        color: product.specifications?.color || '',
        warranty: product.specifications?.warranty || '',
        features: Array.isArray(product.specifications?.features)
          ? product.specifications.features.join(', ')
          : (product.specifications?.features || '')
      }
    });
    setExistingImages(product.images || []);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`);
      if (response.data.success) {
        showNotification('Product deleted successfully!', 'success');
        fetchProducts();
      } else {
        showNotification(response.data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(error.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const openModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      company: '',
      companyName: '',
      brand: '',
      itemType: '',
      itemTypeName: '',
      variant: '',
      price: '',
      originalPrice: '',
      sku: '',
      stock: 0,
      isActive: true,
      tags: '',
      rating: 0,
      specifications: {
        material: '',
        size: '',
        color: '',
        warranty: '',
        features: ''
      }
    });
    setSelectedFiles([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedFiles([]);
    setExistingImages([]);
  };

  // Bulk upload functions
  const openBulkModal = () => {
    setBulkProducts([
      {
        id: Date.now(),
        name: '',
        description: '',
        category: '',
        company: '',
        price: '',
        sku: '',
        stock: 0,
        images: [],
        isActive: true
      }
    ]);
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkProducts([]);
  };

  const addBulkProduct = () => {
    setBulkProducts([
      ...bulkProducts,
      {
        id: Date.now(),
        name: '',
        description: '',
        category: '',
        company: '',
        price: '',
        sku: '',
        stock: 0,
        images: [],
        isActive: true
      }
    ]);
  };

  const removeBulkProduct = (id) => {
    if (bulkProducts.length === 1) {
      showNotification('You must have at least one product', 'warning');
      return;
    }
    setBulkProducts(bulkProducts.filter(p => p.id !== id));
  };

  const handleBulkChange = (id, field, value) => {
    setBulkProducts(bulkProducts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleBulkFileChange = (id, files) => {
    const fileArray = Array.from(files);
    setBulkProducts(bulkProducts.map(p => 
      p.id === id ? { ...p, images: fileArray } : p
    ));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all products have required fields
    const validProducts = bulkProducts.filter(product => 
      product.name && product.category && product.price && product.images.length > 0
    );

    if (validProducts.length === 0) {
      showNotification('Please fill in all required fields for at least one product', 'error');
      return;
    }

    // Upload products directly
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const product of validProducts) {
      try {
        const data = new FormData();
        data.append('name', product.name);
        data.append('description', product.description);
        data.append('category', product.category);
        data.append('company', product.company || '');
        data.append('brand', product.brand || '');
        data.append('price', product.price);
        data.append('sku', product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        data.append('stock', product.stock);
        data.append('isActive', product.isActive);
        data.append('variant', 'Standard');

        product.images.forEach(file => {
          data.append('images', file);
        });

        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`${product.name}: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating product:', error);
        failCount++;
        errors.push(`${product.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    let message = `Bulk upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (errors.length > 0 && errors.length <= 3) {
      message += `\n\nErrors:\n${errors.join('\n')}`;
    }

    showNotification(message, successCount > 0 ? 'success' : 'error');
    fetchProducts();
    closeBulkModal();
  };

  // Image-based bulk upload functions
  const openBulkImageModal = () => {
    setBulkImages([]);
    setBulkImageCategory('');
    setShowBulkImageModal(true);
  };

  const closeBulkImageModal = () => {
    setShowBulkImageModal(false);
    setBulkImages([]);
    setBulkImageCategory('');
  };

  const handleBulkImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setBulkImages(files);
  };

  const handleBulkImageUpload = async () => {
    if (bulkImages.length === 0) {
      showNotification('Please select at least one image', 'error');
      return;
    }

    if (!bulkImageCategory) {
      showNotification('Please select a category for the products', 'error');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const imageFile of bulkImages) {
      try {
        // Extract product name from filename (remove extension)
        const productName = imageFile.name.replace(/\.[^/.]+$/, '');

        const data = new FormData();
        data.append('name', productName);
        data.append('description', '');
        data.append('category', bulkImageCategory);
        data.append('company', '');
        data.append('price', 0);
        data.append('variant', 'Standard');
        data.append('sku', `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        data.append('stock', 0);
        data.append('isActive', true);
        data.append('images', imageFile);

        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`${productName}: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating product from image:', error);
        failCount++;
        errors.push(`${imageFile.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    let message = `Image upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (errors.length > 0 && errors.length <= 3) {
      message += `\n\nErrors:\n${errors.join('\n')}`;
    }

    showNotification(message, successCount > 0 ? 'success' : 'error');
    fetchProducts();
    closeBulkImageModal();
  };

  // Excel upload functions
  const handleExcelFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is Excel format
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showNotification('Please select a valid Excel file (.xlsx, .xls, or .csv)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showNotification('Excel file is empty', 'error');
          return;
        }

        console.log('Raw Excel data:', jsonData);
        console.log('First row keys:', Object.keys(jsonData[0]));

        // Smart column detection - find columns by partial matching
        const detectColumn = (row, keywords) => {
          const rowKeys = Object.keys(row);
          
          // Try exact match first (case-insensitive)
          for (const keyword of keywords) {
            const exactMatch = rowKeys.find(k => k.toLowerCase().trim() === keyword.toLowerCase().trim());
            if (exactMatch && row[exactMatch] !== undefined && row[exactMatch] !== null && row[exactMatch] !== '') {
              return row[exactMatch];
            }
          }
          
          // Try partial match only for keywords longer than 4 chars to avoid false matches
          for (const keyword of keywords) {
            if (keyword.length <= 4) continue; // skip short keywords like 'CAT', 'SKU', 'MRP' in partial match
            const partialMatch = rowKeys.find(k => 
              k.toLowerCase().includes(keyword.toLowerCase()) || 
              keyword.toLowerCase().includes(k.toLowerCase())
            );
            if (partialMatch && row[partialMatch] !== undefined && row[partialMatch] !== null && row[partialMatch] !== '') {
              return row[partialMatch];
            }
          }
          
          return '';
        };

        // Dedicated category column detector — exact match only to avoid 'Broad Category' false match
        const detectCategoryColumn = (row) => {
          const rowKeys = Object.keys(row);
          // Exact matches in priority order
          const exactKeys = ['Category', 'category', 'Product Category', 'CATEGORY', 'Category Name'];
          for (const key of exactKeys) {
            const found = rowKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
              return String(row[found]);
            }
          }
          return '';
        };

        // Parse Excel data into products - matches all fields in manual entry form
        const parsedProducts = jsonData.map((row, index) => {
          const statusVal = detectColumn(row, ['Status']);
          // Read category name from Excel using dedicated detector
          const categoryNameFromExcel = detectCategoryColumn(row);
          return {
            id: Date.now() + index,
            name: detectColumn(row, ['Product Name', 'product_name', 'name', 'Item Description', 'Product']),
            description: detectColumn(row, ['Description', 'desc']),
            category: '',           // will be resolved to ObjectId below
            categoryName: categoryNameFromExcel, // raw name from Excel for auto-matching
            company: detectColumn(row, ['Company Name', 'Company', 'Manufacturer', 'Supplier']),
            brand: detectColumn(row, ['Brand', 'Brand Name']),
            variant: detectColumn(row, ['Variant / Model', 'Variant', 'Model', 'Type']),
            price: parseFloat(detectColumn(row, ['Price', 'CLP (Cost List Price)', 'CLP', 'Selling Price'])) || 0,
            originalPrice: parseFloat(detectColumn(row, ['Original Price (MRP)', 'MRP', 'Original Price'])) || 0,
            stock: parseInt(detectColumn(row, ['Stock', 'Quantity', 'qty'])) || 0,
            sku: detectColumn(row, ['SKU', 'sku_code', 'Code']) || `SKU-${Date.now()}-${index}`,
            rating: parseFloat(detectColumn(row, ['Rating (0-5)', 'Rating'])) || 0,
            tags: detectColumn(row, ['Tags', 'Tag']),
            // Specifications
            material: detectColumn(row, ['Material']),
            size: detectColumn(row, ['Size']),
            color: detectColumn(row, ['Color', 'Colour']),
            warranty: detectColumn(row, ['Warranty']),
            features: detectColumn(row, ['Features']),
            // Pricing fields
            itemCode: detectColumn(row, ['Item Code', 'ItemCode']),
            mrp: parseFloat(detectColumn(row, ['MRP', 'Original Price (MRP)', 'Original Price'])) || 0,
            nrp: parseFloat(detectColumn(row, ['NRP (Net Retail Price)', 'NRP', 'Net Retail Price'])) || 0,
            sdp: parseFloat(detectColumn(row, ['SDP (Suggested Dealer Price)', 'SDP', 'Suggested Dealer Price'])) || 0,
            npp: parseFloat(detectColumn(row, ['NPP (Net Purchase Price)', 'NPP', 'Net Purchase Price'])) || 0,
            clp: parseFloat(detectColumn(row, ['CLP (Cost List Price)', 'CLP', 'Cost List Price'])) || 0,
            effectivePriceListDate: detectColumn(row, ['Effective Price List Date', 'Price List Date']),
            hsnCode: detectColumn(row, ['HSN Code', 'HSN']),
            gst: parseFloat(detectColumn(row, ['GST %', 'GST', 'Tax'])) || 0,
            // Category classification fields (separate from the main Category column)
            broadCategory: detectColumn(row, ['Broad Category']),
            cat: detectColumn(row, ['CAT (Category)']),
            subCat: detectColumn(row, ['SUB CAT (Sub Category)', 'SUB CAT']),
            range: detectColumn(row, ['RANGE', 'Range']),
            segment: detectColumn(row, ['Segment']),
            // Other fields
            status: statusVal || 'Active',
            flag: detectColumn(row, ['Flag']),
            channelType: detectColumn(row, ['Channel Type', 'Channel']),
            schemeType: detectColumn(row, ['Scheme Type', 'Scheme']),
            images: [],
            isActive: !statusVal || statusVal.toLowerCase() !== 'inactive'
          };
        });

        // Auto-match category names from Excel to category IDs
        // categories state is available in closure
        const resolvedProducts = parsedProducts.map(p => {
          // Resolve category
          let resolvedCategory = p.category;
          if (!resolvedCategory && p.categoryName) {
            const matchedCat = categories.find(cat =>
              cat.name.toLowerCase().trim() === p.categoryName.toLowerCase().trim()
            );
            if (matchedCat) resolvedCategory = matchedCat._id;
          }

          // Resolve company name to existing company ID (if already loaded)
          let resolvedCompanyId = '';
          let resolvedCompanyName = p.company;
          if (p.company) {
            const matchedComp = companies.find(comp =>
              comp.name.toLowerCase().trim() === p.company.toLowerCase().trim()
            );
            if (matchedComp) {
              resolvedCompanyId = matchedComp._id;
              resolvedCompanyName = matchedComp.name;
            }
          }

          return {
            ...p,
            category: resolvedCategory,
            companyId: resolvedCompanyId,       // ObjectId if matched, empty if new
            company: resolvedCompanyName,        // always keep the name string
            companyAutoMatched: !!resolvedCompanyId
          };
        });

        console.log('Parsed products:', resolvedProducts);
        console.log('First parsed product:', resolvedProducts[0]);

        const autoMatched = resolvedProducts.filter(p => p.category).length;
        const companyMatched = resolvedProducts.filter(p => p.companyAutoMatched).length;
        const newCompanies = resolvedProducts.filter(p => p.company && !p.companyAutoMatched).length;

        setExcelData({
          file: file.name,
          products: resolvedProducts,
          totalRows: jsonData.length
        });
        setShowExcelPreview(true);
        showNotification(
          `Excel loaded! ${jsonData.length} products. ` +
          `${autoMatched}/${jsonData.length} categories matched. ` +
          `${companyMatched} companies matched, ${newCompanies} will be auto-created.`,
          autoMatched === jsonData.length ? 'success' : 'warning'
        );
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        showNotification('Error parsing Excel file. Make sure it has columns: Product Name, Price, etc.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelUpload = async () => {
    if (!excelData || excelData.products.length === 0) {
      showNotification('No products to upload', 'error');
      return;
    }

    // All category/company resolution happens per-product during upload loop below

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Build a category name → ID cache to avoid duplicate API calls
    const categoryCache = {};
    // Pre-populate with already-matched categories
    for (const product of excelData.products) {
      if (product.categoryName && product.category) {
        categoryCache[product.categoryName.toLowerCase().trim()] = product.category;
      }
    }

    // Build a company name → ID cache to avoid duplicate API calls
    const companyCache = {};
    // Pre-populate cache with already-matched companies
    for (const product of excelData.products) {
      if (product.company && product.companyId) {
        companyCache[product.company.toLowerCase().trim()] = product.companyId;
      }
    }

    for (const product of excelData.products) {
      try {
        // Resolve category: use existing ID, or find-or-create via API
        let resolvedCategoryId = product.category || '';
        if (!resolvedCategoryId && product.categoryName) {
          const catKey = product.categoryName.toLowerCase().trim();
          if (categoryCache[catKey]) {
            resolvedCategoryId = categoryCache[catKey];
          } else {
            try {
              const catRes = await axios.post('http://localhost:5000/api/categories/find-or-create', {
                name: product.categoryName
              });
              if (catRes.data.success) {
                resolvedCategoryId = catRes.data.data._id;
                categoryCache[catKey] = resolvedCategoryId;
                if (catRes.data.created) {
                  console.log(`✅ Auto-created category: ${product.categoryName}`);
                }
              }
            } catch (catErr) {
              console.warn(`Could not resolve category "${product.categoryName}":`, catErr.message);
            }
          }
        }

        if (!resolvedCategoryId) {
          failCount++;
          errors.push(`${product.name}: No category provided and could not auto-create`);
          continue;
        }

        // Resolve company: use cached ID, or find-or-create via API
        let resolvedCompanyId = product.companyId || '';
        if (product.company && !resolvedCompanyId) {
          const key = product.company.toLowerCase().trim();
          if (companyCache[key]) {
            resolvedCompanyId = companyCache[key];
          } else {
            try {
              const compRes = await axios.post('http://localhost:5000/api/companies/find-or-create', {
                name: product.company
              });
              if (compRes.data.success) {
                resolvedCompanyId = compRes.data.data._id;
                companyCache[key] = resolvedCompanyId;
                if (compRes.data.created) {
                  console.log(`✅ Auto-created company: ${product.company}`);
                }
              }
            } catch (compErr) {
              console.warn(`Could not resolve company "${product.company}":`, compErr.message);
            }
          }
        }

        const data = new FormData();
        data.append('name', product.name || 'Unnamed Product');
        data.append('description', product.description || '');
        data.append('category', resolvedCategoryId);
        data.append('company', resolvedCompanyId || '');
        data.append('companyName', product.company || '');
        data.append('brand', product.brand || '');
        data.append('variant', product.variant || 'Standard');
        data.append('price', product.price || 0);
        data.append('originalPrice', product.originalPrice || product.mrp || product.price || 0);
        data.append('sku', product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        data.append('stock', product.stock || 0);
        data.append('isActive', product.isActive !== false);
        data.append('rating', product.rating || 0);
        if (product.tags) data.append('tags', product.tags);

        // Specifications
        const specs = {
          material: product.material || '',
          size: product.size || '',
          color: product.color || '',
          warranty: product.warranty || '',
          features: product.features || ''
        };
        data.append('specifications', JSON.stringify(specs));

        // Pricing fields
        if (product.itemCode) data.append('itemCode', product.itemCode);
        if (product.mrp) data.append('mrp', product.mrp);
        if (product.nrp) data.append('nrp', product.nrp);
        if (product.sdp) data.append('sdp', product.sdp);
        if (product.npp) data.append('npp', product.npp);
        if (product.clp) data.append('clp', product.clp);
        if (product.effectivePriceListDate) data.append('effectivePriceListDate', product.effectivePriceListDate);
        if (product.hsnCode) data.append('hsnCode', product.hsnCode);
        if (product.gst) data.append('gst', product.gst);

        // Category / classification fields
        if (product.broadCategory) data.append('broadCategory', product.broadCategory);
        if (product.cat) data.append('cat', product.cat);
        if (product.subCat) data.append('subCat', product.subCat);
        if (product.range) data.append('range', product.range);
        if (product.segment) data.append('segment', product.segment);

        // Other fields
        if (product.flag) data.append('flag', product.flag);
        if (product.channelType) data.append('channelType', product.channelType);
        if (product.schemeType) data.append('schemeType', product.schemeType);

        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`${product.name}: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error creating product from Excel:', error);
        failCount++;
        errors.push(`${product.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    let message = `Excel upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (errors.length > 0 && errors.length <= 5) {
      message += `\n\nErrors:\n${errors.join('\n')}`;
    }

    showNotification(message, successCount > 0 ? 'success' : 'error');
    fetchProducts();
    fetchCategories();
    fetchCompanies();
    closeExcelPreview();
    closeBulkModal();
  };

  const closeExcelPreview = () => {
    setShowExcelPreview(false);
    setExcelData(null);
  };

  const updateExcelProduct = (index, field, value) => {
    setExcelData(prev => ({
      ...prev,
      products: prev.products.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    try {
      // Full template matching all fields in the manual product entry form
      const templateData = [
        {
          'Product Name': 'GRAB BAR 300mm',
          'Category': 'Toilet',
          'Company Name': 'Jaguar',
          'Brand': 'Premium',
          'Variant / Model': 'Chrome Finish',
          'Description': 'High quality stainless steel grab bar',
          'Price': 1105,
          'Original Price (MRP)': 1300,
          'Stock': 10,
          'SKU': 'ACN-BLM',
          'Rating (0-5)': 4.5,
          'Tags': 'grab bar, bathroom, safety',
          'Material': 'Stainless Steel',
          'Size': '300mm',
          'Color': 'Chrome',
          'Warranty': '2 Years',
          'Features': 'Anti-slip, Corrosion resistant',
          'Item Code': 'JG-GB-300',
          'MRP': 1300,
          'NRP (Net Retail Price)': 1200,
          'SDP (Suggested Dealer Price)': 1100,
          'NPP (Net Purchase Price)': 950,
          'CLP (Cost List Price)': 1105,
          'Effective Price List Date': '01-04-2026',
          'HSN Code': '7326.90.00',
          'GST %': 18,
          'Broad Category': 'Bathroom Accessories',
          'CAT (Category)': 'Grab Bars',
          'SUB CAT (Sub Category)': 'Safety Bars',
          'RANGE': 'Premium',
          'Segment': 'Residential',
          'Status': 'Active',
          'Flag': 'New',
          'Channel Type': 'Retail',
          'Scheme Type': 'Standard'
        },
        {
          'Product Name': 'GRAB BAR 200mm',
          'Category': 'Faucet',
          'Company Name': 'Jaguar',
          'Brand': 'Standard',
          'Variant / Model': 'White',
          'Description': 'Compact grab bar for small spaces',
          'Price': 1160,
          'Original Price (MRP)': 1400,
          'Stock': 5,
          'SKU': 'ACN-CH',
          'Rating (0-5)': 4.2,
          'Tags': 'grab bar, compact',
          'Material': 'Stainless Steel',
          'Size': '200mm',
          'Color': 'White',
          'Warranty': '1 Year',
          'Features': 'Easy install',
          'Item Code': 'JG-GB-200',
          'MRP': 1400,
          'NRP (Net Retail Price)': 1250,
          'SDP (Suggested Dealer Price)': 1150,
          'NPP (Net Purchase Price)': 1000,
          'CLP (Cost List Price)': 1160,
          'Effective Price List Date': '01-04-2026',
          'HSN Code': '7326.90.00',
          'GST %': 18,
          'Broad Category': 'Bathroom Accessories',
          'CAT (Category)': 'Grab Bars',
          'SUB CAT (Sub Category)': 'Safety Bars',
          'RANGE': 'Standard',
          'Segment': 'Residential',
          'Status': 'Active',
          'Flag': '',
          'Channel Type': 'Retail',
          'Scheme Type': 'Standard'
        }
      ];

      // Create a new workbook
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Set column widths for all columns
      ws['!cols'] = [
        { wch: 28 }, // Product Name
        { wch: 15 }, // Category
        { wch: 18 }, // Company Name
        { wch: 15 }, // Brand
        { wch: 20 }, // Variant / Model
        { wch: 35 }, // Description
        { wch: 12 }, // Price
        { wch: 22 }, // Original Price (MRP)
        { wch: 10 }, // Stock
        { wch: 15 }, // SKU
        { wch: 14 }, // Rating (0-5)
        { wch: 25 }, // Tags
        { wch: 20 }, // Material
        { wch: 15 }, // Size
        { wch: 15 }, // Color
        { wch: 15 }, // Warranty
        { wch: 30 }, // Features
        { wch: 15 }, // Item Code
        { wch: 12 }, // MRP
        { wch: 22 }, // NRP
        { wch: 26 }, // SDP
        { wch: 24 }, // NPP
        { wch: 22 }, // CLP
        { wch: 26 }, // Effective Price List Date
        { wch: 16 }, // HSN Code
        { wch: 10 }, // GST %
        { wch: 22 }, // Broad Category
        { wch: 18 }, // CAT
        { wch: 22 }, // SUB CAT
        { wch: 15 }, // RANGE
        { wch: 18 }, // Segment
        { wch: 12 }, // Status
        { wch: 12 }, // Flag
        { wch: 15 }, // Channel Type
        { wch: 15 }, // Scheme Type
      ];

      // Add instructions sheet
      const instructionsSheet = XLSX.utils.aoa_to_sheet([
        ['PRODUCT IMPORT TEMPLATE - Full Format'],
        ['This template matches all fields available in the manual Add Product form.'],
        [''],
        ['REQUIRED FIELDS (marked with *)'],
        ['- Product Name *: Name of the product'],
        ['- Price *: Selling / CLP price'],
        ['- Category: Name must exactly match a category in your admin panel (e.g., Toilet, Faucet, Tiles)'],
        ['  If matched, the product is auto-assigned. If not matched, you select it in the preview.'],
        [''],
        ['OPTIONAL FIELDS'],
        ['- Company Name: Supplier / Manufacturer name (e.g., Jaguar, Kohler)'],
        ['- Brand: Product brand or line (e.g., Premium, Standard, Luxury)'],
        ['- Variant / Model: Model or variant name (e.g., White Ceramic, Chrome Finish)'],
        ['- Description: Product description'],
        ['- Original Price (MRP): MRP for showing discounts'],
        ['- Stock: Available quantity (default 0)'],
        ['- SKU: Stock keeping unit code'],
        ['- Rating (0-5): Product rating'],
        ['- Tags: Comma-separated tags (e.g., premium, ceramic, soft-close)'],
        ['- Material: Product material (e.g., Ceramic, Brass, Glass)'],
        ['- Size: Product size (e.g., 24x18 inches)'],
        ['- Color: Product color (e.g., White)'],
        ['- Warranty: Warranty period (e.g., 2 Years)'],
        ['- Features: Comma-separated features'],
        ['- Item Code: Internal item code (e.g., SKU-001)'],
        ['- MRP: Maximum Retail Price'],
        ['- NRP (Net Retail Price): Net retail price'],
        ['- SDP (Suggested Dealer Price): Suggested dealer price'],
        ['- NPP (Net Purchase Price): Net purchase price'],
        ['- CLP (Cost List Price): Cost list price'],
        ['- Effective Price List Date: Date in DD-MM-YYYY format'],
        ['- HSN Code: Harmonized System Nomenclature code (e.g., 6910.10.00)'],
        ['- GST %: Tax percentage (default 18)'],
        ['- Broad Category: Broad product category (e.g., Bathroom Fixtures)'],
        ['- CAT (Category): Product category label (e.g., Toilet Seats)'],
        ['- SUB CAT (Sub Category): Sub-category (e.g., Ceramic)'],
        ['- RANGE: Product range (e.g., Premium, Standard)'],
        ['- Segment: Market segment (e.g., Residential, Commercial)'],
        ['- Status: Active / Inactive / Draft (default Active)'],
        ['- Flag: Product flag (e.g., New, Featured)'],
        ['- Channel Type: Sales channel (e.g., Retail, Wholesale)'],
        ['- Scheme Type: Scheme type (e.g., Standard, Promotional)'],
        [''],
        ['INSTRUCTIONS'],
        ['1. Fill in at least Product Name and Price'],
        ['2. All other fields are optional - leave blank if not needed'],
        ['3. Do not modify column headers'],
        ['4. Save the file as .xlsx format before uploading'],
        ['5. After upload, select a Category for each product in the preview'],
        ['6. Images can be added separately after product creation'],
        [''],
        ['NOTES'],
        ['- Stock defaults to 0 if not provided'],
        ['- GST % defaults to 18 if not provided'],
        ['- Status defaults to Active if not provided'],
        ['- You can edit all details after uploading in the admin panel']
      ]);

      XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

      // Download the file
      XLSX.writeFile(wb, 'Product_Import_Template.xlsx');
      showNotification('Excel template downloaded! Fill in the columns and upload.', 'success');
    } catch (error) {
      console.error('Error downloading template:', error);
      showNotification('Error downloading template', 'error');
    }
  };

  return (
    <div className="admin-products">
      <header className="admin-products__header">
        <div>
          <h1>Products Management</h1>
          <p className="admin-products__subtitle">
            {filterCategory || filterCompany || filterItemType || filterStatus || searchTerm
              ? `${products.length} products found`
              : `${products.length} total products`
            }
          </p>
        </div>
        <div className="admin-products__header-actions">
          <button className="admin-products__bulk-btn" onClick={openBulkModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Bulk Upload (Form)
          </button>
          <button className="admin-products__bulk-btn" onClick={openBulkImageModal} style={{ background: '#f59e0b' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Bulk Upload (Images)
          </button>
          <button className="admin-products__add-btn" onClick={openModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="admin-products__filters">
        <div className="admin-products__search">
          <input
            type="text"
            placeholder="Search by name, SKU, variant, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name} ({categoryCounts[cat._id] || 0})
            </option>
          ))}
        </select>

        <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(comp => (
            <option key={comp._id} value={comp._id}>
              {comp.name} ({companyCounts[comp._id] || 0})
            </option>
          ))}
        </select>

        <select value={filterItemType} onChange={(e) => setFilterItemType(e.target.value)}>
          <option value="">All Item Types</option>
          {itemTypes.map(it => (
            <option key={it._id} value={it._id}>
              {it.icon} {it.name} ({itemTypeCounts[it._id] || 0})
            </option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(searchTerm || filterCategory || filterCompany || filterItemType || filterStatus) && (
          <button className="admin-products__clear-btn" onClick={handleClearFilters}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-products__loading">Loading products...</div>
      ) : (
        <div className="admin-products__table-container">
          <table className="admin-products__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Company</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.images && product.images[0] ? (
                      <img 
                        src={`http://localhost:5000${product.images[0]}`} 
                        alt={product.name}
                        className="admin-products__thumb"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="admin-products__thumb" style={{ 
                        background: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#999'
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>
                    {typeof product.company === 'object' 
                      ? (product.company?.name || '-')
                      : (product.company || '-')
                    }
                  </td>
                  <td>₹{product.price?.toLocaleString('en-IN')}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <div className="admin-products__actions">
                      <button onClick={() => handleEdit(product)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(product._id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-products__modal-overlay" onClick={closeModal}>
          <div className="admin-products__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-products__form">
              <div className="admin-products__field">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-products__field">
                <label>Item Type (for Budget Planner)</label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                >
                  <option value="">Select item type (optional)</option>
                  {itemTypes
                    .filter(it => !formData.category || (it.category && it.category._id === formData.category))
                    .map(it => (
                      <option key={it._id} value={it._id}>
                        {it.icon} {it.name}
                      </option>
                    ))}
                </select>
                <small>Select to make this product appear in budget recommendations</small>
              </div>

              <div className="admin-products__field">
                <label>Company Name</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                >
                  <option value="">Select company (optional)</option>
                  {companies.map(comp => (
                    <option key={comp._id} value={comp._id}>
                      {comp.name} {comp.isPartner ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                <small>⭐ = Partner company (shown in budget planner)</small>
              </div>

              <div className="admin-products__field">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Premium, Standard, Luxury"
                />
              </div>

              <div className="admin-products__field">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Premium Ceramic Toilet Seat"
                />
              </div>

              <div className="admin-products__field">
                <label>Variant / Model</label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  placeholder="e.g., White Ceramic, Chrome Finish"
                />
              </div>

              <div className="admin-products__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Product description"
                />
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <small>For showing discounts</small>
                </div>

                <div className="admin-products__field">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Product SKU"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="premium, ceramic, soft-close"
                  />
                </div>
              </div>

              <div className="admin-products__field">
                <label>Specifications (Optional)</label>
                <div className="admin-products__specs-grid">
                  <input
                    type="text"
                    name="spec_material"
                    value={formData.specifications.material}
                    onChange={handleChange}
                    placeholder="Material (e.g., Ceramic)"
                  />
                  <input
                    type="text"
                    name="spec_size"
                    value={formData.specifications.size}
                    onChange={handleChange}
                    placeholder="Size (e.g., 24x18 inches)"
                  />
                  <input
                    type="text"
                    name="spec_color"
                    value={formData.specifications.color}
                    onChange={handleChange}
                    placeholder="Color (e.g., White)"
                  />
                  <input
                    type="text"
                    name="spec_warranty"
                    value={formData.specifications.warranty}
                    onChange={handleChange}
                    placeholder="Warranty (e.g., 2 Years)"
                  />
                  <input
                    type="text"
                    name="spec_features"
                    value={formData.specifications.features}
                    onChange={handleChange}
                    placeholder="Features (comma separated)"
                  />
                </div>
              </div>

              {/* Additional Product Details */}
              <div className="admin-products__field">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.specifications?.material || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, material: e.target.value }
                  })}
                  placeholder="e.g., Ceramic, Brass, Glass"
                />
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>MRP (Maximum Retail Price)</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>CLP (Cost List Price)</label>
                  <input
                    type="number"
                    name="clp"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>HSN Code</label>
                  <input
                    type="text"
                    name="hsnCode"
                    placeholder="e.g., 6910.10.00"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>GST %</label>
                  <input
                    type="number"
                    name="gst"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 18"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Broad Category</label>
                  <input
                    type="text"
                    name="broadCategory"
                    placeholder="e.g., Bathroom Fixtures"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Segment</label>
                  <input
                    type="text"
                    name="segment"
                    placeholder="e.g., Residential, Commercial"
                  />
                </div>
              </div>

              {/* Additional Product Details */}
              <div className="admin-products__field">
                <label>Item Code</label>
                <input
                  type="text"
                  placeholder="e.g., SKU-001"
                />
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>NRP (Net Retail Price)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>SDP (Suggested Dealer Price)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>NPP (Net Purchase Price)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>CLP (Cost List Price)</label>
                  <input
                    type="number"
                    name="clp"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Effective Price List Date</label>
                  <input
                    type="date"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Status</label>
                  <select>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>CAT (Category)</label>
                  <input
                    type="text"
                    placeholder="e.g., Toilet Seats"
                  />
                </div>

                <div className="admin-products__field">
                  <label>SUB CAT (Sub Category)</label>
                  <input
                    type="text"
                    placeholder="e.g., Ceramic"
                  />
                </div>

                <div className="admin-products__field">
                  <label>RANGE</label>
                  <input
                    type="text"
                    placeholder="e.g., Premium, Standard"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>Flag</label>
                  <input
                    type="text"
                    placeholder="e.g., New, Featured"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Channel Type</label>
                  <input
                    type="text"
                    placeholder="e.g., Retail, Wholesale"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Scheme Type</label>
                  <input
                    type="text"
                    placeholder="e.g., Standard, Promotional"
                  />
                </div>
              </div>

              <div className="admin-products__field">
                <label>Product Images * {editingProduct && '(Add more images)'}</label>

                {/* Show existing images when editing */}
                {editingProduct && existingImages.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <small style={{ color: '#16a34a', fontWeight: 600 }}>
                      ✅ {existingImages.length} existing image(s) — add more below or keep as is
                    </small>
                    <div className="admin-products__existing-images" style={{ marginTop: '8px' }}>
                      {existingImages.map((img, index) => (
                        <div key={index} className="admin-products__existing-image">
                          <img src={`http://localhost:5000${img}`} alt="" />
                          <button type="button" onClick={() => removeExistingImage(index)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show info when editing product with no images */}
                {editingProduct && existingImages.length === 0 && selectedFiles.length === 0 && (
                  <small style={{ color: '#f59e0b', display: 'block', marginBottom: '8px' }}>
                    ⚠️ This product has no images. You can add images below or save without them.
                  </small>
                )}

                <div
                  className={`admin-products__drop-zone ${isDragging ? 'admin-products__drop-zone--active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  tabIndex={0}
                  onFocus={() => {}}
                >
                  <div className="admin-products__drop-zone-inner">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="admin-products__drop-title">
                      {isDragging ? 'Drop images here' : 'Drag & drop images here'}
                    </p>
                    <p className="admin-products__drop-sub">
                      or paste with <kbd>Ctrl+V</kbd> · or click to browse
                    </p>
                    <label className="admin-products__drop-browse-btn">
                      Browse Files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                <small>Max 10 images · 5MB each · JPG, PNG, WEBP</small>

                {selectedFiles.length > 0 && (
                  <div className="admin-products__image-preview-grid">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="admin-products__image-preview-item">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                        />
                        <button
                          type="button"
                          className="admin-products__image-preview-remove"
                          onClick={() => removeSelectedFile(index)}
                          title="Remove"
                        >
                          ×
                        </button>
                        <span className="admin-products__image-preview-name">
                          {file.name.length > 14 ? file.name.slice(0, 12) + '…' : file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-products__field">
                <label className="admin-products__checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active (visible on frontend)</span>
                </label>
              </div>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeModal} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-products__btn-submit">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="admin-products__modal-overlay" onClick={closeBulkModal}>
          <div className="admin-products__bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>Bulk Upload Products</h2>
              <button onClick={closeBulkModal}>×</button>
            </div>

            {/* Excel Upload Option */}
            <div className="admin-products__bulk-upload-tabs">
              <div className="admin-products__upload-option-box">
                <h3>📊 Upload from Excel File</h3>
                <p>Select an Excel file (.xlsx, .xls, or .csv) with product data</p>
                
                <div className="admin-products__template-section">
                  <button 
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="admin-products__download-template-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Template
                  </button>
                  <small>Download the Excel template to see the required format</small>
                </div>

                <div className="admin-products__divider">or</div>

                <label className="admin-products__upload-label-large">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                    <line x1="9" y1="17" x2="15" y2="17"/>
                  </svg>
                  <span>Click to select Excel file</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <small>Columns: Product Name, Price, Company, Stock, SKU, Variant, Description, etc.</small>
              </div>
            </div>

            {/* Form-based Upload Option */}
            <div className="admin-products__bulk-upload-divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleBulkSubmit} className="admin-products__bulk-form">
              <h3>📝 Manual Product Entry</h3>
              <div className="admin-products__bulk-products">
                {bulkProducts.map((product, index) => (
                  <div key={product.id} className="admin-products__bulk-item">
                    <div className="admin-products__bulk-item-header">
                      <h3>Product {index + 1}</h3>
                      {bulkProducts.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeBulkProduct(product.id)}
                          className="admin-products__remove-bulk"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="admin-products__bulk-grid">
                      <div className="admin-products__field">
                        <label>Category *</label>
                        <select
                          value={product.category}
                          onChange={(e) => handleBulkChange(product.id, 'category', e.target.value)}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-products__field">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleBulkChange(product.id, 'name', e.target.value)}
                          required
                          placeholder="Product name"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={product.company || ''}
                          onChange={(e) => handleBulkChange(product.id, 'company', e.target.value)}
                          placeholder="e.g., Kohler, Jaguar, Vanity"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Brand</label>
                        <input
                          type="text"
                          value={product.brand || ''}
                          onChange={(e) => handleBulkChange(product.id, 'brand', e.target.value)}
                          placeholder="e.g., Premium, Standard, Luxury"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Price *</label>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleBulkChange(product.id, 'price', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleBulkChange(product.id, 'stock', e.target.value)}
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>SKU</label>
                        <input
                          type="text"
                          value={product.sku}
                          onChange={(e) => handleBulkChange(product.id, 'sku', e.target.value)}
                          placeholder="SKU"
                        />
                      </div>
                    </div>

                    <div className="admin-products__field">
                      <label>Description</label>
                      <textarea
                        value={product.description}
                        onChange={(e) => handleBulkChange(product.id, 'description', e.target.value)}
                        rows="2"
                        placeholder="Product description"
                      />
                    </div>

                    {/* Additional Product Details */}
                    <div className="admin-products__bulk-grid">
                      <div className="admin-products__field">
                        <label>Item Code</label>
                        <input
                          type="text"
                          value={product.itemCode || ''}
                          onChange={(e) => handleBulkChange(product.id, 'itemCode', e.target.value)}
                          placeholder="e.g., SKU-001"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Material</label>
                        <input
                          type="text"
                          value={product.material || ''}
                          onChange={(e) => handleBulkChange(product.id, 'material', e.target.value)}
                          placeholder="e.g., Ceramic, Brass, Glass"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>MRP (Maximum Retail Price)</label>
                        <input
                          type="number"
                          value={product.originalPrice || ''}
                          onChange={(e) => handleBulkChange(product.id, 'originalPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>NRP (Net Retail Price)</label>
                        <input
                          type="number"
                          value={product.nrp || ''}
                          onChange={(e) => handleBulkChange(product.id, 'nrp', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>SDP (Suggested Dealer Price)</label>
                        <input
                          type="number"
                          value={product.sdp || ''}
                          onChange={(e) => handleBulkChange(product.id, 'sdp', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>NPP (Net Purchase Price)</label>
                        <input
                          type="number"
                          value={product.npp || ''}
                          onChange={(e) => handleBulkChange(product.id, 'npp', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>CLP (Cost List Price)</label>
                        <input
                          type="number"
                          value={product.clp || product.price}
                          onChange={(e) => handleBulkChange(product.id, 'clp', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Effective Price List Date</label>
                        <input
                          type="date"
                          value={product.effectivePriceListDate || ''}
                          onChange={(e) => handleBulkChange(product.id, 'effectivePriceListDate', e.target.value)}
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>HSN Code</label>
                        <input
                          type="text"
                          value={product.hsnCode || ''}
                          onChange={(e) => handleBulkChange(product.id, 'hsnCode', e.target.value)}
                          placeholder="e.g., 6910.10.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>GST %</label>
                        <input
                          type="number"
                          value={product.gst || ''}
                          onChange={(e) => handleBulkChange(product.id, 'gst', e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="e.g., 18"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Broad Category</label>
                        <input
                          type="text"
                          value={product.broadCategory || ''}
                          onChange={(e) => handleBulkChange(product.id, 'broadCategory', e.target.value)}
                          placeholder="e.g., Bathroom Fixtures"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>CAT (Category)</label>
                        <input
                          type="text"
                          value={product.cat || ''}
                          onChange={(e) => handleBulkChange(product.id, 'cat', e.target.value)}
                          placeholder="e.g., Toilet Seats"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>SUB CAT (Sub Category)</label>
                        <input
                          type="text"
                          value={product.subCat || ''}
                          onChange={(e) => handleBulkChange(product.id, 'subCat', e.target.value)}
                          placeholder="e.g., Ceramic"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>RANGE</label>
                        <input
                          type="text"
                          value={product.range || ''}
                          onChange={(e) => handleBulkChange(product.id, 'range', e.target.value)}
                          placeholder="e.g., Premium, Standard"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Segment</label>
                        <input
                          type="text"
                          value={product.segment || ''}
                          onChange={(e) => handleBulkChange(product.id, 'segment', e.target.value)}
                          placeholder="e.g., Residential, Commercial"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Status</label>
                        <select
                          value={product.status || 'Active'}
                          onChange={(e) => handleBulkChange(product.id, 'status', e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>

                      <div className="admin-products__field">
                        <label>Flag</label>
                        <input
                          type="text"
                          value={product.flag || ''}
                          onChange={(e) => handleBulkChange(product.id, 'flag', e.target.value)}
                          placeholder="e.g., New, Featured"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Channel Type</label>
                        <input
                          type="text"
                          value={product.channelType || ''}
                          onChange={(e) => handleBulkChange(product.id, 'channelType', e.target.value)}
                          placeholder="e.g., Retail, Wholesale"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Scheme Type</label>
                        <input
                          type="text"
                          value={product.schemeType || ''}
                          onChange={(e) => handleBulkChange(product.id, 'schemeType', e.target.value)}
                          placeholder="e.g., Standard, Promotional"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Variant / Model</label>
                        <input
                          type="text"
                          value={product.variant || ''}
                          onChange={(e) => handleBulkChange(product.id, 'variant', e.target.value)}
                          placeholder="e.g., White Ceramic, Chrome Finish"
                        />
                      </div>
                    </div>

                    <div className="admin-products__field">
                      <label>Product Images *</label>
                      <label className="admin-products__upload-label">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>Select Images for This Product</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleBulkFileChange(product.id, e.target.files)}
                          required
                          style={{ display: 'none' }}
                        />
                      </label>
                      {product.images.length > 0 && (
                        <div className="admin-products__file-list">
                          <strong>{product.images.length} image(s) selected</strong>
                          {product.images.map((file, idx) => (
                            <span key={idx}>📷 {file.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addBulkProduct}
                className="admin-products__add-more-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Another Product
              </button>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeBulkModal} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-products__btn-submit">
                  Upload All Products ({bulkProducts.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Image Upload Modal */}
      {showBulkImageModal && (
        <div className="admin-products__modal-overlay" onClick={closeBulkImageModal}>
          <div className="admin-products__bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>📸 Bulk Upload Product Images</h2>
              <button onClick={closeBulkImageModal}>×</button>
            </div>

            <div className="admin-products__bulk-image-content">
              <div className="admin-products__info-box">
                <h4>ℹ️ How it works:</h4>
                <ul>
                  <li>Select multiple product images at once</li>
                  <li>Image filename (without extension) becomes the product name</li>
                  <li>Products are created with "Draft" status</li>
                  <li>You can edit price, category, and other details after upload</li>
                  <li>Supports up to 200+ images at once</li>
                </ul>
              </div>

              <div className="admin-products__field">
                <label>Category *</label>
                <select
                  value={bulkImageCategory}
                  onChange={(e) => setBulkImageCategory(e.target.value)}
                  required
                >
                  <option value="">-- Select a category --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <small>Select a category for all products</small>
              </div>

              <div className="admin-products__image-upload-area">
                <label className="admin-products__upload-label-large">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="upload-text">
                    <strong>Click to select images or drag & drop</strong>
                    <small>PNG, JPG, GIF up to 10MB each</small>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {bulkImages.length > 0 && (
                <div className="admin-products__selected-images">
                  <h4>{bulkImages.length} image(s) selected</h4>
                  <div className="admin-products__image-grid">
                    {bulkImages.map((file, idx) => (
                      <div key={idx} className="admin-products__image-preview-item">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${idx}`} />
                        <span className="image-name">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="admin-products__modal-actions">
              <button type="button" onClick={closeBulkImageModal} className="admin-products__btn-cancel">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleBulkImageUpload} 
                className="admin-products__btn-submit"
                disabled={bulkImages.length === 0}
              >
                Upload {bulkImages.length} Image{bulkImages.length !== 1 ? 's' : ''} as Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      {showExcelPreview && excelData && (
        <div className="admin-products__modal-overlay" onClick={closeExcelPreview}>
          <div className="admin-products__bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>📊 Excel Preview - {excelData.file}</h2>
              <button onClick={closeExcelPreview}>×</button>
            </div>

            <div className="admin-products__excel-preview">
              <div className="admin-products__info-box">
                <p>
                  Found <strong>{excelData.totalRows}</strong> products.&nbsp;
                  <span style={{ color: '#16a34a' }}>
                    ✅ {excelData.products.filter(p => p.category).length} categories auto-matched.
                  </span>
                  {excelData.products.filter(p => !p.category).length > 0 && (
                    <span style={{ color: '#dc2626' }}>
                      &nbsp;⚠️ {excelData.products.filter(p => !p.category).length} product(s) need a category selected below.
                    </span>
                  )}
                </p>
                <p style={{ marginTop: '6px' }}>
                  <span style={{ color: '#16a34a' }}>
                    🏢 {excelData.products.filter(p => p.companyAutoMatched).length} companies matched to existing.
                  </span>
                  {excelData.products.filter(p => p.company && !p.companyAutoMatched).length > 0 && (
                    <span style={{ color: '#f59e0b' }}>
                      &nbsp;⚡ {[...new Set(excelData.products.filter(p => p.company && !p.companyAutoMatched).map(p => p.company))].length} new company/companies will be auto-created on upload.
                    </span>
                  )}
                </p>
              </div>

              {/* Apply one category to ALL unmatched products */}
              {excelData.products.some(p => !p.category) && (
                <div className="admin-products__field" style={{ background: '#fef9c3', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 600 }}>⚡ Apply category to all unmatched products:</label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      if (!categoryId) return;
                      setExcelData(prev => ({
                        ...prev,
                        products: prev.products.map(p => p.category ? p : { ...p, category: categoryId })
                      }));
                    }}
                  >
                    <option value="">-- Select to apply to unmatched --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <small style={{ display: 'block', marginTop: '6px', color: '#92400e' }}>
                    💡 Or just click <strong>Upload</strong> — if your Excel has a Category column, categories will be auto-created. If blank, products will be uploaded without a category assignment.
                  </small>
                </div>
              )}

              <div className="admin-products__excel-table-container">
                <table className="admin-products__excel-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Company</th>
                      <th>Stock</th>
                      <th>SKU</th>
                      <th>Material</th>
                      <th>HSN Code</th>
                      <th>GST %</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.products.map((product, index) => (
                      <tr key={index} style={{ background: product.category ? 'inherit' : '#fff7ed' }}>
                        <td>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateExcelProduct(index, 'name', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="Product name"
                          />
                        </td>
                        <td>
                          <select
                            value={product.category || ''}
                            onChange={(e) => updateExcelProduct(index, 'category', e.target.value)}
                            style={{
                              border: product.category ? '1px solid #16a34a' : '2px solid #dc2626',
                              borderRadius: '4px',
                              padding: '4px',
                              fontSize: '12px',
                              minWidth: '120px',
                              background: product.category ? '#f0fdf4' : '#fff1f2'
                            }}
                            required
                          >
                            <option value="">⚠️ Select category</option>
                            {categories.map(cat => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                          {product.category && product.categoryName && (
                            <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>
                              ✅ Auto: {product.categoryName}
                            </div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) => updateExcelProduct(index, 'price', e.target.value)}
                            className="admin-products__excel-input"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.company}
                            onChange={(e) => updateExcelProduct(index, 'company', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="Company"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => updateExcelProduct(index, 'stock', e.target.value)}
                            className="admin-products__excel-input"
                            min="0"
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.sku}
                            onChange={(e) => updateExcelProduct(index, 'sku', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="SKU"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.material || ''}
                            onChange={(e) => updateExcelProduct(index, 'material', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="Material"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.hsnCode || ''}
                            onChange={(e) => updateExcelProduct(index, 'hsnCode', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="HSN"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.gst || ''}
                            onChange={(e) => updateExcelProduct(index, 'gst', e.target.value)}
                            className="admin-products__excel-input"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="GST %"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              const detailsDiv = document.getElementById(`product-details-${index}`);
                              if (detailsDiv) {
                                detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
                              }
                            }}
                            className="admin-products__details-btn"
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detailed Product Information */}
              <div className="admin-products__excel-details-section">
                {excelData.products.map((product, index) => (
                  <div key={index} id={`product-details-${index}`} className="admin-products__product-details-card" style={{ display: 'none' }}>
                    <h4>Product {index + 1}: {product.name}</h4>
                    
                    <div className="admin-products__details-grid">
                      <div className="admin-products__detail-field">
                        <label>Description</label>
                        <textarea
                          value={product.description || ''}
                          onChange={(e) => updateExcelProduct(index, 'description', e.target.value)}
                          placeholder="Product description"
                          rows="3"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>Variant / Model</label>
                        <input
                          type="text"
                          value={product.variant || ''}
                          onChange={(e) => updateExcelProduct(index, 'variant', e.target.value)}
                          placeholder="e.g., White Ceramic, Chrome Finish"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>Original Price / MRP</label>
                        <input
                          type="number"
                          value={product.originalPrice || ''}
                          onChange={(e) => updateExcelProduct(index, 'originalPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>Category Name</label>
                        <input
                          type="text"
                          value={product.category_name || ''}
                          onChange={(e) => updateExcelProduct(index, 'category_name', e.target.value)}
                          placeholder="e.g., Toilet Seats, Faucets"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>Material</label>
                        <input
                          type="text"
                          value={product.material || ''}
                          onChange={(e) => updateExcelProduct(index, 'material', e.target.value)}
                          placeholder="e.g., Ceramic, Brass, Glass"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>HSN Code</label>
                        <input
                          type="text"
                          value={product.hsnCode || ''}
                          onChange={(e) => updateExcelProduct(index, 'hsnCode', e.target.value)}
                          placeholder="e.g., 6910.10.00"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>GST %</label>
                        <input
                          type="number"
                          value={product.gst || ''}
                          onChange={(e) => updateExcelProduct(index, 'gst', e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="e.g., 18"
                        />
                      </div>

                      <div className="admin-products__detail-field">
                        <label>Status</label>
                        <select
                          value={product.isActive ? 'active' : 'inactive'}
                          onChange={(e) => updateExcelProduct(index, 'isActive', e.target.value === 'active')}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeExcelPreview} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleExcelUpload} 
                  className="admin-products__btn-submit"
                >
                  Upload {excelData.totalRows} Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
