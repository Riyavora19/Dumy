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
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
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
  const [bulkImageCompany, setBulkImageCompany] = useState('');
  const [uploadedProducts, setUploadedProducts] = useState([]);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [showProductEditPanel, setShowProductEditPanel] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [showUpdateExcelModal, setShowUpdateExcelModal] = useState(false);
  const [updateExcelData, setUpdateExcelData] = useState([]);
  const [updateMatchResults, setUpdateMatchResults] = useState([]);
  const [showImageChangeModal, setShowImageChangeModal] = useState(false);
  const [imageChangeProduct, setImageChangeProduct] = useState(null);
  const [newProductImages, setNewProductImages] = useState([]);

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
          p && p._id && p.name && (p.price !== undefined && p.price !== null)
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
        // Show all companies (removed partner filter)
        const allCompanies = response.data.data;
        setCompanies(allCompanies);
        
        // Fetch product count for each company
        const counts = {};
        for (const comp of allCompanies) {
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

  const handleQuickEdit = (product) => {
    console.log('Quick editing product:', product);
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || 0,
      company: (typeof product.company === 'object' ? product.company?._id : '') || '',
      companyName: (typeof product.company === 'object' ? product.company?.name : product.companyName) || product.company || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      flag: product.flag || '',
      specifications: {
        material: product.specifications?.material || '',
        size: product.specifications?.size || '',
        color: product.specifications?.color || '',
        warranty: product.specifications?.warranty || '',
        features: product.specifications?.features || ''
      }
    });
    setShowQuickEditModal(true);
  };

  const closeQuickEditModal = () => {
    setShowQuickEditModal(false);
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
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        company: formData.company || undefined,
        companyName: formData.companyName || undefined,
        isActive: formData.isActive,
        flag: formData.flag || '',
        specifications: {
          material: formData.specifications?.material || '',
          size: formData.specifications?.size || '',
          color: formData.specifications?.color || '',
          warranty: formData.specifications?.warranty || '',
          features: formData.specifications?.features || ''
        }
      };

      const response = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        updateData
      );

      if (response.data.success) {
        showNotification('Product updated successfully!', 'success');
        
        // Save current scroll position
        const scrollPosition = window.scrollY || window.pageYOffset;
        
        // Fetch updated products
        await fetchProducts();
        
        // Restore scroll position after a short delay to ensure DOM is updated
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
        
        closeQuickEditModal();
      } else {
        showNotification(response.data.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification(error.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const handleDelete = async (id) => {
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

  const openImageChangeModal = (product) => {
    setImageChangeProduct(product);
    setNewProductImages([]);
    setShowImageChangeModal(true);
  };

  const closeImageChangeModal = () => {
    setShowImageChangeModal(false);
    setImageChangeProduct(null);
    setNewProductImages([]);
  };

  const handleImageChangeFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewProductImages(files.slice(0, 5)); // Max 5 images
  };

  const handleImageChangeSubmit = async () => {
    if (newProductImages.length === 0) {
      showNotification('Please select at least one image', 'error');
      return;
    }

    try {
      const data = new FormData();
      newProductImages.forEach(file => {
        data.append('images', file);
      });

      const response = await axios.put(
        `http://localhost:5000/api/products/${imageChangeProduct._id}`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        showNotification('Product images updated successfully!', 'success');
        fetchProducts();
        closeImageChangeModal();
      } else {
        showNotification(response.data.message || 'Failed to update images', 'error');
      }
    } catch (error) {
      console.error('Error updating images:', error);
      showNotification(error.response?.data?.message || 'Failed to update images', 'error');
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
    setBulkImageCompany('');
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

    let successCount = 0;
    let failCount = 0;
    const errors = [];
    const createdCategories = new Set();

    // Helper function to intelligently categorize product based on name
    const extractCategoryFromProductName = (productName) => {
      const nameLower = productName.toLowerCase();
      
      // Define keywords for each category
      const categoryKeywords = {
        'Faucet': [
          'faucet', 'tap', 'mixer', 'spout', 'shower', 'basin', 'sink', 
          'diverter', 'valve', 'cock', 'bib', 'pillar', 'wall mixer',
          'overhead', 'hand shower', 'telephonic', 'concealed', 'exposed'
        ],
        'Accessories': [
          'accessories', 'accessory', 'soap', 'dispenser', 'holder', 'rack',
          'towel', 'robe', 'hook', 'shelf', 'grab bar', 'rail', 'ring',
          'tumbler', 'brush', 'paper holder', 'napkin', 'mirror', 'glass',
          'bottle', 'tray', 'basket', 'corner', 'stand'
        ],
        'Tiles': [
          'tile', 'tiles', 'ceramic', 'porcelain', 'vitrified', 'mosaic',
          'wall tile', 'floor tile', 'slab', 'marble', 'granite'
        ]
      };
      
      // Check which category matches best
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (nameLower.includes(keyword)) {
            return category;
          }
        }
      }
      
      // Default to Accessories if no match found
      return 'Accessories';
    };

    // Helper function to resolve category (find existing or create new)
    const resolveCategory = async (categoryName) => {
      if (!categoryName || categoryName.trim() === '') {
        categoryName = 'Accessories'; // Default category
      }

      const trimmedName = categoryName.trim();

      // Check if category exists by name (case-insensitive)
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase().trim() === trimmedName.toLowerCase()
      );

      if (existingCategory) {
        return existingCategory._id;
      }

      // Only create category if it's one of the 3 main categories
      const allowedCategories = ['faucet', 'accessories', 'tiles'];
      if (!allowedCategories.includes(trimmedName.toLowerCase())) {
        // If not an allowed category, default to Accessories
        const accessoriesCategory = categories.find(cat => 
          cat.name.toLowerCase() === 'accessories'
        );
        if (accessoriesCategory) {
          return accessoriesCategory._id;
        }
      }

      // Create new category (only if it's one of the 3 allowed)
      try {
        const catRes = await axios.post('http://localhost:5000/api/categories/find-or-create', {
          name: trimmedName
        });
        if (catRes.data.success) {
          if (catRes.data.created) {
            createdCategories.add(trimmedName);
          }
          return catRes.data.data._id;
        }
      } catch (error) {
        console.error(`Error creating category "${trimmedName}":`, error);
      }
      return null;
    };

    for (const imageFile of bulkImages) {
      try {
        // Extract product name from filename (remove extension)
        const productName = imageFile.name.replace(/\.[^/.]+$/, '');

        // Determine category: use manual selection or auto-extract from product name
        let categoryName;
        if (bulkImageCategory && bulkImageCategory.trim() !== '') {
          // User provided a category - use it for all products
          categoryName = bulkImageCategory.trim();
        } else {
          // Auto-extract category from product name
          categoryName = extractCategoryFromProductName(productName);
        }

        // Resolve category ID (find or create)
        const resolvedCategoryId = await resolveCategory(categoryName);

        if (!resolvedCategoryId) {
          failCount++;
          errors.push(`${productName}: Failed to resolve category`);
          continue;
        }

        // Generate random price between 500 and 100000 (1 lakh)
        const randomPrice = Math.floor(Math.random() * (100000 - 500 + 1)) + 500;

        const data = new FormData();
        data.append('name', productName);
        data.append('description', '');
        data.append('category', resolvedCategoryId);
        data.append('company', bulkImageCompany || ''); // Use selected company
        data.append('price', randomPrice);
        data.append('variant', 'Standard');
        data.append('sku', `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        data.append('stock', 0);
        data.append('isActive', true);
        data.append('images', imageFile);

        // First, try to find existing product by name
        const searchResponse = await axios.get(
          `http://localhost:5000/api/products/search/${encodeURIComponent(productName)}`
        );

        let productId = null;
        if (searchResponse.data.success && searchResponse.data.data.length > 0) {
          // Find exact match (case-insensitive)
          const exactMatch = searchResponse.data.data.find(
            p => p.name.toLowerCase().trim() === productName.toLowerCase().trim()
          );
          if (exactMatch) {
            productId = exactMatch._id;
          }
        }

        let response;
        if (productId) {
          // UPDATE existing product
          response = await axios.put(
            `http://localhost:5000/api/products/${productId}`,
            data,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        } else {
          // CREATE new product
          response = await axios.post(
            'http://localhost:5000/api/products',
            data,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`${productName}: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error uploading product image:', error);
        failCount++;
        errors.push(`${imageFile.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Refresh categories list if new ones were created
    if (createdCategories.size > 0) {
      await fetchCategories();
    }

    let message = `Image upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (createdCategories.size > 0) {
      message += `\n✅ Auto-created ${createdCategories.size} new categories: ${Array.from(createdCategories).join(', ')}`;
    }
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

          // Check for duplicates in existing products
          const isDuplicate = products.some(existingProduct => 
            existingProduct.name.toLowerCase().trim() === p.name.toLowerCase().trim() ||
            (p.sku && existingProduct.sku && existingProduct.sku.toLowerCase().trim() === p.sku.toLowerCase().trim())
          );

          return {
            ...p,
            category: resolvedCategory,
            companyId: resolvedCompanyId,       // ObjectId if matched, empty if new
            company: resolvedCompanyName,        // always keep the name string
            companyAutoMatched: !!resolvedCompanyId,
            isDuplicate: isDuplicate,
            duplicateWarning: isDuplicate ? 'Product already exists in database' : null
          };
        });

        console.log('Parsed products:', resolvedProducts);
        console.log('First parsed product:', resolvedProducts[0]);

        const autoMatched = resolvedProducts.filter(p => p.category).length;
        const companyMatched = resolvedProducts.filter(p => p.companyAutoMatched).length;
        const newCompanies = resolvedProducts.filter(p => p.company && !p.companyAutoMatched).length;
        const duplicates = resolvedProducts.filter(p => p.isDuplicate).length;

        setExcelData({
          file: file.name,
          products: resolvedProducts,
          totalRows: jsonData.length
        });
        setShowExcelPreview(true);
        
        let message = `Excel loaded! ${jsonData.length} products. ` +
          `${autoMatched}/${jsonData.length} categories matched. ` +
          `${companyMatched} companies matched, ${newCompanies} will be auto-created.`;
        
        if (duplicates > 0) {
          message += ` ⚠️ ${duplicates} duplicate(s) found - they will be skipped.`;
        }
        
        showNotification(
          message,
          duplicates > 0 ? 'warning' : (autoMatched === jsonData.length ? 'success' : 'warning')
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

    // Filter out duplicates before uploading
    const productsToUpload = excelData.products.filter(p => !p.isDuplicate);
    const skippedDuplicates = excelData.products.filter(p => p.isDuplicate);

    if (productsToUpload.length === 0) {
      showNotification('All products are duplicates. No products to upload.', 'warning');
      return;
    }

    if (skippedDuplicates.length > 0) {
      showNotification(
        `Skipping ${skippedDuplicates.length} duplicate product(s). Uploading ${productsToUpload.length} new products...`,
        'info'
      );
    }

    // All category/company resolution happens per-product during upload loop below

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Build a category name → ID cache to avoid duplicate API calls
    const categoryCache = {};
    // Pre-populate with already-matched categories
    for (const product of productsToUpload) {
      if (product.categoryName && product.category) {
        categoryCache[product.categoryName.toLowerCase().trim()] = product.category;
      }
    }

    // Build a company name → ID cache to avoid duplicate API calls
    const companyCache = {};
    // Pre-populate cache with already-matched companies
    for (const product of productsToUpload) {
      if (product.company && product.companyId) {
        companyCache[product.company.toLowerCase().trim()] = product.companyId;
      }
    }

    for (const product of productsToUpload) {
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

  // Update from Excel functions
  const handleUpdateExcelFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

        // Match products with existing products in database
        matchProductsForUpdate(jsonData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showNotification('Error reading Excel file', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const matchProductsForUpdate = (excelProducts) => {
    const matchResults = excelProducts.map(excelProduct => {
      // Try to match by name or SKU
      const matchedProduct = products.find(p => 
        (excelProduct['Product Name'] && p.name.toLowerCase() === excelProduct['Product Name'].toLowerCase()) ||
        (excelProduct['SKU'] && p.sku && p.sku.toLowerCase() === excelProduct['SKU'].toLowerCase())
      );

      return {
        excelData: excelProduct,
        matchedProduct: matchedProduct || null,
        status: matchedProduct ? 'matched' : 'not-found',
        willUpdate: matchedProduct ? true : false
      };
    });

    setUpdateMatchResults(matchResults);
    setUpdateExcelData(excelProducts);
    setShowUpdateExcelModal(true);
  };

  const handleUpdateFromExcel = async () => {
    const productsToUpdate = updateMatchResults.filter(r => r.willUpdate && r.matchedProduct);

    if (productsToUpdate.length === 0) {
      showNotification('No products selected for update', 'error');
      return;
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const result of productsToUpdate) {
      try {
        const excelData = result.excelData;
        const productId = result.matchedProduct._id;

        // Build update object with only fields that exist in Excel
        const updateData = {};

        if (excelData['Product Name']) updateData.name = excelData['Product Name'];
        if (excelData['Description']) updateData.description = excelData['Description'];
        if (excelData['Price']) updateData.price = parseFloat(excelData['Price']);
        if (excelData['MRP']) updateData.mrp = parseFloat(excelData['MRP']);
        if (excelData['SKU']) updateData.sku = excelData['SKU'];
        if (excelData['Stock']) updateData.stock = parseInt(excelData['Stock']);
        if (excelData['Brand']) updateData.brand = excelData['Brand'];
        if (excelData['Variant']) updateData.variant = excelData['Variant'];
        if (excelData['Status']) updateData.isActive = excelData['Status'].toLowerCase() === 'active';
        if (excelData['Flag']) updateData.flag = excelData['Flag'];
        
        // Specifications
        const specifications = {};
        if (excelData['Material']) specifications.material = excelData['Material'];
        if (excelData['Size']) specifications.size = excelData['Size'];
        if (excelData['Color']) specifications.color = excelData['Color'];
        if (excelData['Warranty']) specifications.warranty = excelData['Warranty'];
        if (Object.keys(specifications).length > 0) {
          updateData.specifications = specifications;
        }

        // Pricing fields
        if (excelData['NRP']) updateData.nrp = parseFloat(excelData['NRP']);
        if (excelData['SDP']) updateData.sdp = parseFloat(excelData['SDP']);
        if (excelData['NPP']) updateData.npp = parseFloat(excelData['NPP']);
        if (excelData['CLP']) updateData.clp = parseFloat(excelData['CLP']);
        if (excelData['HSN Code']) updateData.hsnCode = excelData['HSN Code'];
        if (excelData['GST %']) updateData.gst = parseFloat(excelData['GST %']);

        const response = await axios.put(
          `http://localhost:5000/api/products/${productId}`,
          updateData
        );

        if (response.data.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`${excelData['Product Name']}: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error updating product:', error);
        failCount++;
        errors.push(`${result.excelData['Product Name']}: ${error.response?.data?.message || error.message}`);
      }
    }

    let message = `Update complete!\nSuccess: ${successCount}\nFailed: ${failCount}`;
    if (errors.length > 0 && errors.length <= 5) {
      message += `\n\nErrors:\n${errors.join('\n')}`;
    }

    showNotification(message, successCount > 0 ? 'success' : 'error');
    fetchProducts();
    closeUpdateExcelModal();
  };

  const closeUpdateExcelModal = () => {
    setShowUpdateExcelModal(false);
    setUpdateExcelData([]);
    setUpdateMatchResults([]);
  };

  const toggleUpdateSelection = (index) => {
    setUpdateMatchResults(prev => prev.map((r, i) => 
      i === index ? { ...r, willUpdate: !r.willUpdate } : r
    ));
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
          <button className="admin-products__update-excel-btn" onClick={() => document.getElementById('update-excel-input').click()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Update from Excel
          </button>
          <input
            id="update-excel-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={handleUpdateExcelFileSelect}
          />
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
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="admin-products__thumb" style="background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; width: 60px; height: 60px;">No Image</div>';
                        }}
                      />
                    ) : (
                      <div className="admin-products__thumb" style={{ 
                        background: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#999',
                        width: '60px',
                        height: '60px'
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
                    {typeof product.company === 'object' && product.company?.defaultDiscountPercentage > 0 && (
                      <span style={{ marginLeft: '5px', fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>
                        ({product.company.defaultDiscountPercentage}% OFF)
                      </span>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const companyDiscount = typeof product.company === 'object' ? (product.company?.defaultDiscountPercentage || 0) : 0;
                      const hasDiscount = companyDiscount > 0;
                      const discountedPrice = hasDiscount ? product.price * (1 - companyDiscount / 100) : product.price;
                      
                      return hasDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ textDecoration: 'line-through', fontSize: '12px', color: '#999' }}>
                            ₹{product.price?.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                            ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span>₹{product.price?.toLocaleString('en-IN')}</span>
                      );
                    })()}
                  </td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <div className="admin-products__actions">
                      <button onClick={() => openImageChangeModal(product)} title="Change Image" className="admin-products__image-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </button>
                      <button onClick={() => handleQuickEdit(product)} title="Quick Edit" className="admin-products__quick-edit-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </button>
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
                  <li>Products are automatically categorized into: <strong>Faucet, Accessories, or Tiles</strong></li>
                  <li>Smart detection based on product name keywords (mixer, shower → Faucet; holder, rack → Accessories; etc.)</li>
                  <li>Or specify one category to apply to all products</li>
                  <li>Products are created with "Draft" status (price = 0)</li>
                  <li>You can edit price, category, and other details after upload</li>
                  <li>Supports up to 200+ images at once</li>
                </ul>
              </div>

              <div className="admin-products__field">
                <label>Category (Optional)</label>
                <input
                  type="text"
                  list="bulk-category-list"
                  value={bulkImageCategory}
                  onChange={(e) => setBulkImageCategory(e.target.value)}
                  placeholder="Leave empty to auto-create from product names"
                />
                <datalist id="bulk-category-list">
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name} />
                  ))}
                </datalist>
                <small>💡 Leave empty to auto-create categories from product names, or select/type a category for all products</small>
              </div>

              <div className="admin-products__field">
                <label>Company (Optional)</label>
                <select
                  value={bulkImageCompany}
                  onChange={(e) => setBulkImageCompany(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  <option value="">-- Select Company (Optional) --</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <small>💡 Select a company to assign to all uploaded products</small>
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
                title={
                  bulkImages.length === 0 
                    ? "Please select at least one image" 
                    : "Upload images as products"
                }
              >
                Upload {bulkImages.length} Image{bulkImages.length !== 1 ? 's' : ''} as Products
              </button>
              {bulkImages.length === 0 && (
                <small style={{ color: '#ef4444', marginTop: '8px', display: 'block' }}>
                  ⚠️ Please select at least one image
                </small>
              )}
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
                {excelData.products.filter(p => p.isDuplicate).length > 0 && (
                  <p style={{ marginTop: '6px' }}>
                    <span style={{ color: '#dc2626', fontWeight: '600' }}>
                      ⚠️ {excelData.products.filter(p => p.isDuplicate).length} duplicate product(s) found - these will be automatically skipped during upload.
                    </span>
                  </p>
                )}
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
                      <th>Status</th>
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
                      <tr key={index} style={{ 
                        background: product.isDuplicate ? '#fee2e2' : (product.category ? 'inherit' : '#fff7ed'),
                        opacity: product.isDuplicate ? 0.6 : 1
                      }}>
                        <td style={{ textAlign: 'center', minWidth: '80px' }}>
                          {product.isDuplicate ? (
                            <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '12px' }}>
                              ⚠️ Duplicate
                            </span>
                          ) : (
                            <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '12px' }}>
                              ✓ New
                            </span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateExcelProduct(index, 'name', e.target.value)}
                            className="admin-products__excel-input"
                            placeholder="Product name"
                            disabled={product.isDuplicate}
                          />
                          {product.isDuplicate && (
                            <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '2px' }}>
                              Already exists - will be skipped
                            </div>
                          )}
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

      {/* Quick Edit Modal */}
      {showQuickEditModal && (
        <div className="admin-products__modal-overlay" onClick={closeQuickEditModal}>
          <div className="admin-products__modal admin-products__quick-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>Quick Edit Product</h2>
              <button onClick={closeQuickEditModal}>×</button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="admin-products__form">
              <div className="admin-products__field">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-products__field">
                <label>Company *</label>
                <select
                  value={formData.company}
                  onChange={(e) => {
                    const selectedCompany = companies.find(c => c._id === e.target.value);
                    setFormData({
                      ...formData,
                      company: e.target.value,
                      companyName: selectedCompany?.name || ''
                    });
                  }}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-products__field">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="admin-products__field">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  min="0"
                />
              </div>

              {/* Specifications Section */}
              <div className="admin-products__field" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                <label style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '12px', display: 'block' }}>
                  Product Specifications
                </label>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>Color</label>
                  <input
                    type="text"
                    value={formData.specifications?.color || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      specifications: { 
                        ...formData.specifications, 
                        color: e.target.value 
                      } 
                    })}
                    placeholder="e.g., White, Chrome, Black"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Size</label>
                  <input
                    type="text"
                    value={formData.specifications?.size || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      specifications: { 
                        ...formData.specifications, 
                        size: e.target.value 
                      } 
                    })}
                    placeholder="e.g., 24x18 inches, 66 cm"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>Material</label>
                  <input
                    type="text"
                    value={formData.specifications?.material || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      specifications: { 
                        ...formData.specifications, 
                        material: e.target.value 
                      } 
                    })}
                    placeholder="e.g., Ceramic, Stainless Steel"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Warranty</label>
                  <input
                    type="text"
                    value={formData.specifications?.warranty || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      specifications: { 
                        ...formData.specifications, 
                        warranty: e.target.value 
                      } 
                    })}
                    placeholder="e.g., 1 Year, 5 Years"
                  />
                </div>
              </div>

              <div className="admin-products__field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ marginLeft: '8px' }}>Active</span>
                </label>
              </div>

              <div className="admin-products__field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.flag === 'Featured'}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.checked ? 'Featured' : '' })}
                  />
                  <span style={{ marginLeft: '8px', fontWeight: '600', color: '#f59e0b' }}>⭐ Mark as Featured Product</span>
                </label>
              </div>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeQuickEditModal} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-products__btn-submit">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update from Excel Modal */}
      {showUpdateExcelModal && (
        <div className="admin-products__modal-overlay" onClick={closeUpdateExcelModal}>
          <div className="admin-products__bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>📝 Update Products from Excel</h2>
              <button onClick={closeUpdateExcelModal}>×</button>
            </div>

            <div className="admin-products__excel-preview">
              <div className="admin-products__info-box">
                <p>
                  Found <strong>{updateMatchResults.length}</strong> products in Excel.&nbsp;
                  <span style={{ color: '#16a34a' }}>
                    ✅ {updateMatchResults.filter(r => r.status === 'matched').length} matched with existing products.
                  </span>
                  {updateMatchResults.filter(r => r.status === 'not-found').length > 0 && (
                    <span style={{ color: '#dc2626' }}>
                      &nbsp;⚠️ {updateMatchResults.filter(r => r.status === 'not-found').length} product(s) not found in database.
                    </span>
                  )}
                </p>
                <p style={{ marginTop: '6px', fontSize: '14px', color: '#666' }}>
                  💡 Products are matched by Product Name or SKU. Only matched products can be updated.
                </p>
              </div>

              <div className="admin-products__excel-table-wrapper">
                <table className="admin-products__excel-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Update</th>
                      <th style={{ width: '80px' }}>Status</th>
                      <th>Product Name (Excel)</th>
                      <th>Matched Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updateMatchResults.map((result, index) => (
                      <tr key={index} style={{ 
                        backgroundColor: result.status === 'matched' ? '#f0fdf4' : '#fef2f2'
                      }}>
                        <td style={{ textAlign: 'center' }}>
                          {result.status === 'matched' ? (
                            <input
                              type="checkbox"
                              checked={result.willUpdate}
                              onChange={() => toggleUpdateSelection(index)}
                            />
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {result.status === 'matched' ? (
                            <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Found</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: '600' }}>✗ Not Found</span>
                          )}
                        </td>
                        <td>{result.excelData['Product Name'] || '-'}</td>
                        <td>
                          {result.matchedProduct ? (
                            <span style={{ color: '#16a34a' }}>{result.matchedProduct.name}</span>
                          ) : (
                            <span style={{ color: '#999' }}>No match</span>
                          )}
                        </td>
                        <td>
                          {result.excelData['Price'] ? `₹${parseFloat(result.excelData['Price']).toLocaleString()}` : '-'}
                          {result.matchedProduct && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Current: ₹{result.matchedProduct.price.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td>
                          {result.excelData['Stock'] || '-'}
                          {result.matchedProduct && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Current: {result.matchedProduct.stock}
                            </div>
                          )}
                        </td>
                        <td>{result.excelData['SKU'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-products__modal-actions">
                <button 
                  type="button" 
                  onClick={closeUpdateExcelModal} 
                  className="admin-products__btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleUpdateFromExcel}
                  className="admin-products__btn-submit"
                  disabled={updateMatchResults.filter(r => r.willUpdate).length === 0}
                >
                  Update {updateMatchResults.filter(r => r.willUpdate).length} Product(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Change Modal */}
      {showImageChangeModal && imageChangeProduct && (
        <div className="admin-products__modal-overlay" onClick={closeImageChangeModal}>
          <div className="admin-products__image-change-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__image-change-header">
              <div className="admin-products__image-change-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <div>
                  <h2>Change Product Images</h2>
                  <p>{imageChangeProduct.name}</p>
                </div>
              </div>
              <button onClick={closeImageChangeModal} className="admin-products__image-change-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="admin-products__image-change-body">
              {/* Current Images Section */}
              <div className="admin-products__current-images-section">
                <h3>Current Images</h3>
                {imageChangeProduct.images && imageChangeProduct.images.length > 0 ? (
                  <div className="admin-products__current-images-grid">
                    {imageChangeProduct.images.map((img, idx) => (
                      <div key={idx} className="admin-products__current-image-item">
                        <img 
                          src={`http://localhost:5000${img}`}
                          alt={`Current ${idx + 1}`}
                        />
                        <span>Image {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-products__no-images">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p>No images available</p>
                  </div>
                )}
              </div>

              {/* Upload New Images Section */}
              <div className="admin-products__upload-new-section">
                <h3>Upload New Images</h3>
                <label className="admin-products__image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChangeFileSelect}
                    style={{ display: 'none' }}
                  />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div className="admin-products__upload-text">
                    <strong>Click to upload images</strong>
                    <span>or drag and drop</span>
                  </div>
                  <small>PNG, JPG, WEBP up to 10MB (Max 5 images)</small>
                </label>

                {newProductImages.length > 0 && (
                  <div className="admin-products__new-images-preview">
                    <div className="admin-products__new-images-header">
                      <span>{newProductImages.length} image(s) selected</span>
                      <button 
                        type="button"
                        onClick={() => setNewProductImages([])}
                        className="admin-products__clear-selection"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="admin-products__new-images-grid">
                      {newProductImages.map((file, idx) => (
                        <div key={idx} className="admin-products__new-image-item">
                          <img 
                            src={URL.createObjectURL(file)}
                            alt={`New ${idx + 1}`}
                          />
                          <div className="admin-products__new-image-info">
                            <span className="admin-products__new-image-name">{file.name}</span>
                            <span className="admin-products__new-image-size">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Box */}
              <div className="admin-products__image-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <strong>Important:</strong>
                  <span>Uploading new images will replace all existing product images.</span>
                </div>
              </div>
            </div>

            <div className="admin-products__image-change-footer">
              <button 
                type="button" 
                onClick={closeImageChangeModal} 
                className="admin-products__btn-cancel-new"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleImageChangeSubmit}
                className="admin-products__btn-update-new"
                disabled={newProductImages.length === 0}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Update Images
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminProducts;
