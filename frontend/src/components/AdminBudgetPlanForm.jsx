import { useState, useEffect } from 'react';
import './AdminBudgetPlanForm.css';
import QuotationPDFGenerator from './QuotationPDFGenerator';

const AdminBudgetPlanForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saveOption, setSaveOption] = useState(null); // 'quotation' or 'order'
  const [roomTemplates, setRoomTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  // Define areas - ALL room types now have the same 4 areas
  const standardAreas = [
    { id: 'shower', name: 'Shower Area', icon: '🚿' },
    { id: 'basin', name: 'Basin Area', icon: '🪣' },
    { id: 'wc', name: 'WC Area', icon: '🚽' },
    { id: 'urinal', name: 'Urinal Area', icon: '🚻' }
  ];

  // All room types use the same 3 areas
  const bathroomAreas = standardAreas;
  const toiletAreas = standardAreas;
  const kitchenAreas = standardAreas;
  const defaultAreas = standardAreas;

  // General areas for browsing when no room is selected
  const generalBrowsingAreas = [
    { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'dining', name: 'Dining', icon: '🍽️' }
  ];

  // Preset room name options for each template type
  const getRoomNameOptions = (templateName) => {
    const lowerName = templateName.toLowerCase();
    
    if (lowerName.includes('bathroom')) {
      return [
        { id: 'master', label: 'Master Bathroom' },
        { id: 'children', label: 'Children Bathroom' },
        { id: 'parents', label: 'Parents Bathroom' },
        { id: 'powder', label: 'Powder Bathroom' },
        { id: 'custom', label: 'Custom Bathroom', isCustom: true }
      ];
    } else if (lowerName.includes('toilet')) {
      return [
        { id: 'powder', label: 'Powder Toilet' },
        { id: 'children', label: 'Children Toilet' },
        { id: 'custom', label: 'Custom Toilet', isCustom: true }
      ];
    } else if (lowerName.includes('kitchen')) {
      return [
        { id: 'custom', label: 'Custom Kitchen', isCustom: true }
      ];
    } else if (lowerName.includes('dining')) {
      return [
        { id: 'custom', label: 'Custom Dining Area', isCustom: true }
      ];
    } else {
      return [
        { id: 'custom', label: 'Custom Room', isCustom: true }
      ];
    }
  };

  // Function to get areas based on room name/template
  // Now all rooms have the same 3 areas
  const getAreasForRoom = (roomName) => {
    return standardAreas;
  };
  
  // Product browsing filters - These help filter products when adding them
  const getProductFilterAreas = (roomName) => {
    return [
      { id: 'all', name: 'All Areas', icon: '🏠' },
      ...standardAreas
    ];
  };

  // Get general browsing areas when no room is selected
  const getGeneralFilterAreas = () => {
    return [
      { id: 'all', name: 'All Products', icon: '🏠' },
      ...generalBrowsingAreas
    ];
  };
  
  const [formData, setFormData] = useState({
    // Step 1: Customer & Room Selection
    customer: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGST: '',
    isNewCustomer: true,
    roomTemplate: null,
    roomName: '',
    hasBudget: false, // false = without budget (default), true = with budget
    totalBudget: 50000, // This is now just a default/starting value
    
    // Step 2: Rooms and Product Selection
    rooms: [], // Array of rooms: [{ id, name, budget, areas: [{ id, name, products: [] }] }]
    currentRoomId: null, // Currently selected room
    currentArea: 'all', // Currently selected area filter for product browsing
    
    // Step 2: Product Selection (Manual)
    selectedProducts: [],
    
    // Step 3: Quotation-specific fields
    quotationValidity: '30 days',
    deliveryTime: '2-3 weeks',
    paymentTerms: '50% advance, 50% before dispatch',
    specialInstructions: '',
    
    // Step 3: Order-specific fields (only if saving as order)
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    sameAsShipping: true,
    paymentMethod: 'pending',
    
    // Notes
    notes: '',
    status: 'draft'
  });

  const [generating, setGenerating] = useState(false);
  const [savingAs, setSavingAs] = useState(null); // 'plan' or 'order'
  const [showPreview, setShowPreview] = useState(false); // For preview modal
  const [isEditMode, setIsEditMode] = useState(false); // For editable preview
  const [editedPrices, setEditedPrices] = useState({}); // Store edited prices by product ID
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false); // NEW: Modal for selecting room name after template click
  const [selectedTemplate, setSelectedTemplate] = useState(null); // NEW: Currently selected template for adding room
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomBudgetInput, setRoomBudgetInput] = useState(50000);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [viewingRoomId, setViewingRoomId] = useState(null); // Which room's products to display in cart
  const [viewingAreaId, setViewingAreaId] = useState('all'); // Which area within room to display
  const [selectedAreaForSuggestions, setSelectedAreaForSuggestions] = useState('all'); // For showing product suggestions - default to 'all'
  const [selectedSuggestion, setSelectedSuggestion] = useState(''); // For highlighting selected suggestion
  const [selectedRoomNames, setSelectedRoomNames] = useState([]); // For checkbox selection in modal
  const [customRoomName, setCustomRoomName] = useState(''); // For custom room name input
  
  // Product type suggestions for each area
  const getAreaSuggestions = (areaId) => {
    const suggestions = {
      all: [
        // Combined suggestions from products that actually exist
        'Toilet Seat', 'WC', 'One Piece', 'Two Piece', 'Smart Toilet', 'Flush Tank', 'Flush Plate', 'Health Faucet',
        'Shower Head', 'Rain Shower', 'Hand Shower', 'Shower Panel', 'Shower Mixer', 'Diverter', 'Body Jets', 'Shower Arm', 'Sliding Rail', 'Bath Spout',
        'Wash Basin', 'Basin', 'Table Top', 'Countertop', 'Under Counter', 'Pedestal', 'Wall Hung', 'Tap', 'Faucet', 'Basin Mixer', 'Pillar Cock', 'Sensor Tap', 'Mirror', 'LED Mirror', 'Vanity Unit', 'Cabinet',
        'Urinal', 'Flat Back', 'Corner', 'Sensor', 'Waterless', 'Flush Valve', 'Partition'
      ],
      wc: [
        'Toilet Seat', 'WC', 'One Piece', 'Two Piece', 'Wall Hung', 'Smart Toilet', 'Flush Tank', 'Concealed Cistern', 'Flush Plate', 'Health Faucet', 'Seat Cover'
      ],
      shower: [
        'Shower Head', 'Rain Shower', 'Hand Shower', 'Overhead Shower', 'Shower Panel', 'Shower Mixer', 'Diverter', 'Body Jets', 'Shower Arm', 'Sliding Rail', 'Bath Spout'
      ],
      basin: [
        'Wash Basin', 'Basin', 'Table Top', 'Countertop', 'Under Counter', 'Semi Recessed', 'Full Pedestal', 'Half Pedestal', 'Wall Hung', 
        'Tap', 'Faucet', 'Basin Mixer', 'Pillar Cock', 'Sensor Tap', 'Mirror', 'LED Mirror', 'Mirror Cabinet', 'Vanity Unit', 'Cabinet', 'Towel Rack', 'Soap Dispenser'
      ],
      urinal: [
        'Urinal', 'Wall Hung', 'Floor Mounted', 'Flat Back', 'Corner', 'Sensor', 'Manual', 'Waterless', 'Spreader', 'Flush Valve', 'Partition'
      ]
    };
    
    return suggestions[areaId] || [];
  };

  useEffect(() => {
    fetchRoomTemplates();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [productSearchQuery, selectedCategory, allProducts, formData.currentArea]);

  const fetchRoomTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/room-templates');
      const data = await response.json();
      setRoomTemplates(data);
    } catch (error) {
      console.error('Error fetching room templates:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Products fetched:', data);
      
      // Handle different response structures
      let products = [];
      if (data.success && data.data) {
        products = data.data;
      } else if (data.products) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      }
      
      // Ensure each product has required fields
      products = products.map(product => ({
        ...product,
        images: product.images || [],
        price: product.price || 0,
        variant: product.variant || '',
        company: product.company || { name: 'Unknown' }
      }));
      
      console.log('Processed products:', products.length);
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products. Please check console for details.');
      setAllProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      // Ensure categories is always an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Filter by search query
    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.variant?.toLowerCase().includes(query) ||
        product.company?.name?.toLowerCase().includes(query) ||
        product.itemTypeName?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?._id === selectedCategory || product.category === selectedCategory
      );
    }

    // Filter by area (based on product name and item type)
    if (formData.currentArea !== 'all') {
      const currentRoom = getCurrentRoom();
      const roomName = currentRoom ? currentRoom.name : null;
      
      // Get area-specific keywords based on room type (or general if no room)
      const areaKeywords = getAreaKeywords(roomName, formData.currentArea);

      if (areaKeywords.length > 0) {
        filtered = filtered.filter(product => {
          const searchText = `${product.name} ${product.variant || ''} ${product.itemTypeName || ''}`.toLowerCase();
          return areaKeywords.some(keyword => searchText.includes(keyword));
        });
      }
    }

    setFilteredProducts(filtered);
  };

  // Get keywords for filtering products based on room type and area
  const getAreaKeywords = (roomName, areaId) => {
    // Simplified keywords for the 4 standard areas
    const areaKeywords = {
      shower: ['shower', 'rain', 'hand shower', 'shower head', 'shower panel', 'diverter', 'spray', 'overhead'],
      basin: ['basin', 'washbasin', 'wash basin', 'sink', 'faucet', 'tap', 'mixer', 'counter', 'vanity', 'cabinet', 'mirror'],
      wc: ['toilet', 'wc', 'commode', 'flush', 'seat', 'cistern', 'tank', 'bowl', 'bidet'],
      urinal: ['urinal', 'urinals', 'wall hung', 'floor mounted', 'sensor urinal', 'waterless']
    };
    
    return areaKeywords[areaId] || [];
  };

  // Room Management Functions - Simplified (rooms are added from Step 1)
  const deleteRoom = (roomId) => {
    setFormData(prev => {
      const updatedRooms = prev.rooms.filter(r => r.id !== roomId);
      return {
        ...prev,
        rooms: updatedRooms,
        currentRoomId: updatedRooms.length > 0 ? updatedRooms[0].id : null
      };
    });
    
    // Update viewing room if the deleted room was being viewed
    if (viewingRoomId === roomId) {
      const remainingRooms = formData.rooms.filter(r => r.id !== roomId);
      setViewingRoomId(remainingRooms.length > 0 ? remainingRooms[0].id : null);
    }
  };

  const getCurrentRoom = () => {
    return formData.rooms.find(r => r.id === formData.currentRoomId);
  };

  const searchContacts = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/contacts/search/autocomplete?q=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const handleCustomerSearch = (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, customerName: query }));
    searchContacts(query);
  };

  const selectCustomer = (contact) => {
    setFormData(prev => ({
      ...prev,
      customer: contact._id,
      customerName: contact.name,
      customerEmail: contact.email || '',
      customerPhone: contact.phone || '',
      customerAddress: contact.address ? 
        `${contact.address.street || ''}, ${contact.address.city || ''}, ${contact.address.state || ''} ${contact.address.pincode || ''}`.trim() : '',
      customerGST: contact.gstNumber || '',
      isNewCustomer: false
    }));
    setSearchResults([]);
  };

  const selectRoomTemplate = (template) => {
    // NEW: Instead of directly setting the template, show modal to select room name
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  // NEW: Handle adding room from template with selected name
  const handleAddRoomFromTemplate = (roomNameOption, customName = '') => {
    if (!selectedTemplate) return;

    const finalRoomName = roomNameOption.isCustom && customName 
      ? customName 
      : roomNameOption.label;

    // Get budget from template
    const roomBudget = formData.hasBudget 
      ? (selectedTemplate.estimatedBudget?.recommended || selectedTemplate.estimatedBudget?.min || 50000)
      : 0;

    // Create new room with the 4 standard areas
    const newRoom = {
      id: Date.now().toString() + Math.random(),
      name: finalRoomName,
      budget: roomBudget,
      templateId: selectedTemplate._id,
      templateName: selectedTemplate.name,
      areas: standardAreas.map(area => ({
        id: area.id,
        name: area.name,
        icon: area.icon,
        products: []
      }))
    };

    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
      currentRoomId: newRoom.id
    }));

    // Set viewing room to the new room
    setViewingRoomId(newRoom.id);
    setViewingAreaId('all');

    // Close modal and reset
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  // NEW: Handle adding multiple selected rooms
  const handleAddSelectedRooms = () => {
    if (!selectedTemplate || selectedRoomNames.length === 0) return;

    const roomBudget = formData.hasBudget 
      ? (selectedTemplate.estimatedBudget?.recommended || selectedTemplate.estimatedBudget?.min || 50000)
      : 0;

    const newRooms = selectedRoomNames.map(roomName => ({
      id: Date.now().toString() + Math.random(),
      name: roomName,
      budget: roomBudget,
      templateId: selectedTemplate._id,
      templateName: selectedTemplate.name,
      areas: standardAreas.map(area => ({
        id: area.id,
        name: area.name,
        icon: area.icon,
        products: []
      }))
    }));

    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, ...newRooms],
      currentRoomId: newRooms[0].id
    }));

    // Set viewing room to the first new room
    setViewingRoomId(newRooms[0].id);
    setViewingAreaId('all');

    // Close modal and reset
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setSelectedRoomNames([]);
    setCustomRoomName('');
  };

  // Toggle room name selection
  const toggleRoomNameSelection = (roomName) => {
    setSelectedRoomNames(prev => {
      if (prev.includes(roomName)) {
        return prev.filter(name => name !== roomName);
      } else {
        return [...prev, roomName];
      }
    });
  };

  const addProductToCart = (product) => {
    // If rooms exist, add to current room's viewing area
    if (formData.rooms.length > 0) {
      if (!formData.currentRoomId) {
        alert('Please select a room first');
        return;
      }

      const currentRoom = getCurrentRoom();
      
      // Determine target area: use the current area filter (left side) if specific, otherwise use first area of the room
      let targetAreaId = formData.currentArea;
      if (!targetAreaId || targetAreaId === 'all') {
        // Use the first area of the current room
        targetAreaId = currentRoom.areas[0]?.id;
      }

      const currentArea = currentRoom.areas.find(a => a.id === targetAreaId);
      
      if (!currentArea) {
        alert('Selected area not found. Please select a specific area from the filters.');
        return;
      }

      const existingIndex = currentArea.products.findIndex(p => p.product === product._id);
      
      if (existingIndex >= 0) {
        // Product already exists in this area, increase quantity
        setFormData(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === prev.currentRoomId) {
              return {
                ...room,
                areas: room.areas.map(area => {
                  if (area.id === targetAreaId) {
                    const updated = [...area.products];
                    updated[existingIndex].quantity += 1;
                    updated[existingIndex].totalPrice = updated[existingIndex].unitPrice * updated[existingIndex].quantity;
                    return { ...area, products: updated };
                  }
                  return area;
                })
              };
            }
            return room;
          })
        }));
        return;
      }

      // Add new product to current area
      const newProduct = {
        product: product._id,
        productName: product.name,
        variant: product.variant,
        sku: product.sku || '',
        company: product.company?._id || product.company,
        companyName: product.company?.name || '',
        category: product.category?._id || product.category,
        categoryName: product.category?.name || '',
        itemType: product.itemType?._id || product.itemType,
        itemName: product.itemTypeName || product.name,
        itemTypeName: product.itemTypeName || '',
        quantity: 1,
        unitPrice: product.mrp || product.price,
        discount: 0,
        discountPercent: product.discountPercentage || 0,
        totalPrice: product.price,
        image: product.images?.[0] || '',
        roomId: formData.currentRoomId,
        roomName: currentRoom.name,
        areaId: targetAreaId,
        areaName: currentArea.name
      };

      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === prev.currentRoomId) {
            return {
              ...room,
              areas: room.areas.map(area => {
                if (area.id === targetAreaId) {
                  return { ...area, products: [...area.products, newProduct] };
                }
                return area;
              })
            };
          }
          return room;
        })
      }));
    } else {
      // No rooms - add to general product list
      const existingIndex = formData.selectedProducts.findIndex(p => p.product === product._id);
      
      if (existingIndex >= 0) {
        // Product already exists, increase quantity
        const updated = [...formData.selectedProducts];
        updated[existingIndex].quantity += 1;
        updated[existingIndex].totalPrice = updated[existingIndex].unitPrice * updated[existingIndex].quantity;
        setFormData(prev => ({ ...prev, selectedProducts: updated }));
        return;
      }

      // Add new product
      const newProduct = {
        product: product._id,
        productName: product.name,
        variant: product.variant,
        sku: product.sku || '',
        company: product.company?._id || product.company,
        companyName: product.company?.name || '',
        category: product.category?._id || product.category,
        categoryName: product.category?.name || '',
        itemType: product.itemType?._id || product.itemType,
        itemName: product.itemTypeName || product.name,
        itemTypeName: product.itemTypeName || '',
        quantity: 1,
        unitPrice: product.mrp || product.price,
        discount: 0,
        discountPercent: product.discountPercentage || 0,
        totalPrice: product.price,
        image: product.images?.[0] || ''
      };

      setFormData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, newProduct]
      }));
    }
  };

  const updateProductQuantity = (index, quantity) => {
    if (formData.rooms.length > 0 && viewingRoomId) {
      if (viewingAreaId === 'all') {
        // When viewing all areas, find which area the product is in
        setFormData(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === viewingRoomId) {
              let productCount = 0;
              return {
                ...room,
                areas: room.areas.map(area => {
                  const productsInArea = area.products.length;
                  const isInThisArea = index >= productCount && index < productCount + productsInArea;
                  
                  if (isInThisArea) {
                    const localIndex = index - productCount;
                    const updated = [...area.products];
                    updated[localIndex].quantity = parseInt(quantity) || 1;
                    // Calculate with discount
                    const discountAmount = (updated[localIndex].unitPrice * updated[localIndex].discountPercent) / 100;
                    const discountedPrice = updated[localIndex].unitPrice - discountAmount;
                    updated[localIndex].totalPrice = discountedPrice * updated[localIndex].quantity;
                    return { ...area, products: updated };
                  }
                  
                  productCount += productsInArea;
                  return area;
                })
              };
            }
            return room;
          })
        }));
      } else {
        // Update product in specific area
        setFormData(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === viewingRoomId) {
              return {
                ...room,
                areas: room.areas.map(area => {
                  if (area.id === viewingAreaId) {
                    const updated = [...area.products];
                    updated[index].quantity = parseInt(quantity) || 1;
                    // Calculate with discount
                    const discountAmount = (updated[index].unitPrice * updated[index].discountPercent) / 100;
                    const discountedPrice = updated[index].unitPrice - discountAmount;
                    updated[index].totalPrice = discountedPrice * updated[index].quantity;
                    return { ...area, products: updated };
                  }
                  return area;
                })
              };
            }
            return room;
          })
        }));
      }
    } else {
      // Update product in general list
      const updated = [...formData.selectedProducts];
      updated[index].quantity = parseInt(quantity) || 1;
      // Calculate with discount
      const discountAmount = (updated[index].unitPrice * updated[index].discountPercent) / 100;
      const discountedPrice = updated[index].unitPrice - discountAmount;
      updated[index].totalPrice = discountedPrice * updated[index].quantity;
      setFormData(prev => ({ ...prev, selectedProducts: updated }));
    }
  };

  const updateProductDiscount = (index, discountPercent) => {
    if (formData.rooms.length > 0 && viewingRoomId && viewingAreaId !== 'all') {
      // Update product in specific area
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === viewingRoomId) {
            return {
              ...room,
              areas: room.areas.map(area => {
                if (area.id === viewingAreaId) {
                  const updated = [...area.products];
                  const percent = parseFloat(discountPercent) || 0;
                  updated[index].discountPercent = percent;
                  // Calculate discount amount from percentage
                  const discountAmount = (updated[index].unitPrice * percent) / 100;
                  updated[index].discount = discountAmount;
                  const discountedPrice = updated[index].unitPrice - discountAmount;
                  updated[index].totalPrice = discountedPrice * updated[index].quantity;
                  return { ...area, products: updated };
                }
                return area;
              })
            };
          }
          return room;
        })
      }));
    } else {
      // Update product in general list
      const updated = [...formData.selectedProducts];
      const percent = parseFloat(discountPercent) || 0;
      updated[index].discountPercent = percent;
      // Calculate discount amount from percentage
      const discountAmount = (updated[index].unitPrice * percent) / 100;
      updated[index].discount = discountAmount;
      const discountedPrice = updated[index].unitPrice - discountAmount;
      updated[index].totalPrice = discountedPrice * updated[index].quantity;
      setFormData(prev => ({ ...prev, selectedProducts: updated }));
    }
  };

  const removeProduct = (index) => {
    if (formData.rooms.length > 0 && viewingRoomId) {
      // When viewing all areas, we need to find which area the product is in
      if (viewingAreaId === 'all') {
        // Find the product across all areas in the viewing room
        setFormData(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === viewingRoomId) {
              let productCount = 0;
              return {
                ...room,
                areas: room.areas.map(area => {
                  const productsBeforeFilter = area.products.length;
                  const filteredProducts = area.products.filter((_, i) => {
                    const globalIndex = productCount + i;
                    return globalIndex !== index;
                  });
                  productCount += productsBeforeFilter;
                  return { ...area, products: filteredProducts };
                })
              };
            }
            return room;
          })
        }));
      } else {
        // Remove product from specific area
        setFormData(prev => ({
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === viewingRoomId) {
              return {
                ...room,
                areas: room.areas.map(area => {
                  if (area.id === viewingAreaId) {
                    return { ...area, products: area.products.filter((_, i) => i !== index) };
                  }
                  return area;
                })
              };
            }
            return room;
          })
        }));
      }
    } else {
      // Remove product from general list
      setFormData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotals = (specificRoomId = null, specificAreaId = null) => {
    let totalCost = 0;
    let totalBudget = 0;
    
    // If a specific room and area are requested
    if (specificRoomId && specificAreaId && specificAreaId !== 'all' && formData.rooms.length > 0) {
      const room = formData.rooms.find(r => r.id === specificRoomId);
      if (room) {
        const area = room.areas.find(a => a.id === specificAreaId);
        if (area) {
          totalCost = area.products.reduce((sum, item) => {
            const productKey = `${specificRoomId}-${specificAreaId}-${item.productName}-${item.variant}`;
            const price = editedPrices[productKey] !== undefined ? editedPrices[productKey] : item.totalPrice;
            return sum + price;
          }, 0);
        }
        totalBudget = room.budget || 0;
      }
    }
    // If a specific room is requested (all areas)
    else if (specificRoomId && formData.rooms.length > 0) {
      const room = formData.rooms.find(r => r.id === specificRoomId);
      if (room) {
        room.areas.forEach(area => {
          totalCost += area.products.reduce((sum, item) => {
            const productKey = `${specificRoomId}-${area.id}-${item.productName}-${item.variant}`;
            const price = editedPrices[productKey] !== undefined ? editedPrices[productKey] : item.totalPrice;
            return sum + price;
          }, 0);
        });
        totalBudget = room.budget || 0;
      }
    }
    // Calculate from all rooms if they exist
    else if (formData.rooms.length > 0) {
      formData.rooms.forEach(room => {
        room.areas.forEach(area => {
          totalCost += area.products.reduce((sum, item) => {
            const productKey = `${room.id}-${area.id}-${item.productName}-${item.variant}`;
            const price = editedPrices[productKey] !== undefined ? editedPrices[productKey] : item.totalPrice;
            return sum + price;
          }, 0);
        });
        totalBudget += room.budget || 0;
      });
    } 
    // Calculate from general product list
    else {
      totalCost = formData.selectedProducts.reduce((sum, item) => {
        const productKey = `general-${item.productName}-${item.variant}`;
        const price = editedPrices[productKey] !== undefined ? editedPrices[productKey] : item.totalPrice;
        return sum + price;
      }, 0);
      totalBudget = formData.totalBudget;
    }
    
    const remainingBudget = formData.hasBudget ? totalBudget - totalCost : null;
    return { totalCost, totalBudget, remainingBudget };
  };

  // Helper function to get product price (edited or original)
  const getProductPrice = (productKey, originalPrice) => {
    return editedPrices[productKey] !== undefined ? editedPrices[productKey] : originalPrice;
  };

  // Helper function to handle price edit
  const handlePriceEdit = (productKey, newPrice) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0) {
      setEditedPrices(prev => ({
        ...prev,
        [productKey]: price
      }));
    }
  };

  // Helper function to reset edited prices
  const resetEditedPrices = () => {
    setEditedPrices({});
    setIsEditMode(false);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.customerName) {
        alert('Please provide customer name');
        return;
      }
      
      // Create customer if new
      if (formData.isNewCustomer && !formData.customer) {
        try {
          const response = await fetch('http://localhost:5000/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.customerName,
              email: formData.customerEmail,
              phone: formData.customerPhone,
              contactType: 'individual',
              status: 'active'
            })
          });
          
          if (response.ok) {
            const newContact = await response.json();
            setFormData(prev => ({ ...prev, customer: newContact._id }));
          }
        } catch (error) {
          console.error('Error creating contact:', error);
        }
      }
    }
    
    if (currentStep === 2) {
      // Check if there are any products in rooms or in selectedProducts
      let hasProducts = false;
      if (formData.rooms.length > 0) {
        hasProducts = formData.rooms.some(room => 
          room.areas.some(area => area.products.length > 0)
        );
      } else {
        hasProducts = formData.selectedProducts.length > 0;
      }
      
      if (!hasProducts) {
        alert('Please add at least one product');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveBudgetPlan = async () => {
    try {
      setSavingAs('plan');
      const totals = calculateTotals();
      
      // Collect all products from rooms and areas
      let allProducts = [];
      if (formData.rooms.length > 0) {
        formData.rooms.forEach(room => {
          room.areas.forEach(area => {
            area.products.forEach(product => {
              allProducts.push({
                ...product,
                roomId: room.id,
                roomName: room.name,
                areaId: area.id,
                areaName: area.name
              });
            });
          });
        });
      } else {
        allProducts = formData.selectedProducts;
      }
      
      // Determine status based on save option
      let status = 'draft';
      if (saveOption === 'quotation') {
        status = 'finalized';
      }
      
      const budgetPlanData = {
        userId: formData.customer,
        userName: formData.customerName,
        userEmail: formData.customerEmail,
        userPhone: formData.customerPhone,
        roomTemplate: formData.roomTemplate || null,
        roomName: formData.roomName || 'Custom Project',
        totalBudget: totals.totalBudget,
        selectedProducts: allProducts.map(item => ({
          itemType: item.itemType,
          itemName: item.itemName || item.itemTypeName || item.productName,
          product: item.product,
          productName: item.productName,
          company: item.company || null,
          companyName: item.companyName || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          roomId: item.roomId || null,
          roomName: item.roomName || '',
          areaId: item.areaId || null,
          areaName: item.areaName || ''
        })),
        totalCost: totals.totalCost,
        remainingBudget: totals.remainingBudget,
        status: status,
        notes: formData.notes,
        rooms: formData.rooms.map(room => ({
          id: room.id,
          name: room.name,
          budget: room.budget,
          areas: room.areas.map(area => ({
            id: area.id,
            name: area.name,
            productCount: area.products.length
          }))
        })),
        // Add quotation-specific fields if saving as quotation
        ...(saveOption === 'quotation' && {
          quotationValidity: formData.quotationValidity,
          deliveryTime: formData.deliveryTime,
          paymentTerms: formData.paymentTerms,
          specialInstructions: formData.specialInstructions
        })
      };

      console.log('Saving budget plan:', budgetPlanData);

      const response = await fetch('http://localhost:5000/api/budget-plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify(budgetPlanData)
      });

      const result = await response.json();

      if (response.ok) {
        const message = saveOption === 'quotation' 
          ? 'Quotation saved successfully!' 
          : 'Budget plan saved successfully!';
        alert(message);
        onSuccess && onSuccess(result);
        onClose && onClose();
      } else {
        console.error('Server error:', result);
        alert(`Error: ${result.message || 'Failed to save budget plan'}`);
      }
    } catch (error) {
      console.error('Error saving budget plan:', error);
      alert(`Error saving budget plan: ${error.message}`);
    } finally {
      setSavingAs(null);
    }
  };

  const handleSaveAsOrder = async () => {
    try {
      setSavingAs('order');
      const totals = calculateTotals();
      
      // Collect all products from rooms and areas
      let allProducts = [];
      if (formData.rooms.length > 0) {
        formData.rooms.forEach(room => {
          room.areas.forEach(area => {
            area.products.forEach(product => {
              allProducts.push({
                ...product,
                roomId: room.id,
                roomName: room.name,
                areaId: area.id,
                areaName: area.name
              });
            });
          });
        });
      } else {
        allProducts = formData.selectedProducts;
      }
      
      // First, save as budget plan (quotation)
      const budgetPlanData = {
        userId: formData.customer,
        userName: formData.customerName,
        userEmail: formData.customerEmail,
        userPhone: formData.customerPhone,
        roomTemplate: formData.roomTemplate || null,
        roomName: formData.roomName || 'Custom Project',
        totalBudget: totals.totalBudget,
        selectedProducts: allProducts.map(item => ({
          itemType: item.itemType,
          itemName: item.itemName || item.itemTypeName || item.productName,
          product: item.product,
          productName: item.productName,
          company: item.company || null,
          companyName: item.companyName || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          roomId: item.roomId || null,
          roomName: item.roomName || '',
          areaId: item.areaId || null,
          areaName: item.areaName || ''
        })),
        totalCost: totals.totalCost,
        remainingBudget: totals.remainingBudget,
        status: 'completed', // Mark as completed since it's being converted to order
        notes: formData.notes,
        rooms: formData.rooms.map(room => ({
          id: room.id,
          name: room.name,
          budget: room.budget,
          areas: room.areas.map(area => ({
            id: area.id,
            name: area.name,
            productCount: area.products.length
          }))
        }))
      };

      const budgetResponse = await fetch('http://localhost:5000/api/budget-plans', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify(budgetPlanData)
      });

      const budgetResult = await budgetResponse.json();
      
      if (!budgetResponse.ok) {
        throw new Error(budgetResult.message || 'Failed to create quotation');
      }

      // Now create the order
      const orderData = {
        customer: formData.customer,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        products: allProducts,
        shippingAddress: {
          name: formData.customerName,
          phone: formData.customerPhone,
          street: formData.shippingAddress.street,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          pincode: formData.shippingAddress.pincode,
          country: 'India',
          landmark: formData.shippingAddress.landmark
        },
        billingAddress: formData.sameAsShipping ? {
          name: formData.customerName,
          phone: formData.customerPhone,
          street: formData.shippingAddress.street,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          pincode: formData.shippingAddress.pincode,
          country: 'India'
        } : formData.billingAddress,
        sameAsShipping: formData.sameAsShipping,
        subtotal: totals.totalCost,
        discount: 0,
        discountType: 'none',
        tax: (totals.totalCost * 18) / 100,
        taxRate: 18,
        shippingCharges: 0,
        total: totals.totalCost + (totals.totalCost * 18) / 100,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: formData.notes,
        source: 'admin',
        budgetPlan: budgetResult._id // Link to the quotation
      };

      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (orderResponse.ok) {
        alert(`✅ Order created successfully!\n\nOrder Number: ${orderResult.orderNumber}\nQuotation also saved and linked to this order.`);
        onSuccess && onSuccess(orderResult);
        onClose && onClose();
      } else {
        throw new Error(orderResult.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error saving as order:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSavingAs(null);
    }
  };

  const handleConvertToOrder = async () => {
    // This functionality has been removed
    // Budget plans should be converted to orders from the Budget Plans list
    // which opens the full order form with proper address collection
    alert('Please save this as a Budget Plan first, then convert it to an order from the Budget Plans list.');
  };

  const renderStep1 = () => {
    const selectedTemplate = roomTemplates.find(t => t._id === formData.roomTemplate);
    
    return (
      <div className="form-step full-width">
        <h3>Step 1: Customer & Project Details</h3>
        
        <div className="form-row">
          <div className="form-group flex-2">
            <label>Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={handleCustomerSearch}
              placeholder="Search or enter customer name"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(contact => (
                  <div key={contact._id} className="search-result-item" onClick={() => selectCustomer(contact)}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              value={formData.customerGST}
              onChange={(e) => setFormData(prev => ({ ...prev, customerGST: e.target.value }))}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={formData.customerAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
            placeholder="Full address"
          />
        </div>

        <div className="form-group">
          <label>Project / Room Name</label>
          <input
            type="text"
            value={formData.roomName}
            onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
            placeholder="e.g., Master Bathroom, Kitchen Renovation"
          />
        </div>

        {/* SECTION 1: Budget Planning - NOW FIRST */}
        <div className="budget-option-section">
          <h4>Budget Planning</h4>
          <p className="section-description">Choose how you want to plan this project</p>
          
          <div className="budget-options">
            <div 
              className={`budget-option-card ${formData.hasBudget ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, hasBudget: true }))}
            >
              <div className="option-icon">💰</div>
              <h5>With Budget</h5>
              <p>Set a budget limit and track spending</p>
            </div>

            <div 
              className={`budget-option-card ${!formData.hasBudget ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, hasBudget: false, totalBudget: 0 }))}
            >
              <div className="option-icon">🚀</div>
              <h5>Without Budget</h5>
              <p>No budget limit, add products freely</p>
            </div>
          </div>

          {formData.hasBudget && (
            <div className="form-group">
              <label>Estimated Budget (₹) *</label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="1000"
                className="budget-input"
                placeholder="Enter budget amount"
              />
            </div>
          )}
        </div>

        {/* SECTION 2: Room Templates - NOW SECOND */}
        <div className="form-group">
          <label>Add Rooms - Click template to add multiple rooms</label>
          <div className="room-templates-grid">
            {roomTemplates.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#666', fontStyle: 'italic' }}>
                No room templates available.
              </p>
            ) : (
              roomTemplates.map(template => (
                <div 
                  key={template._id} 
                  className="room-template-card"
                  onClick={() => selectRoomTemplate(template)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                  <span className="template-budget">
                    ₹{(template.estimatedBudget?.min / 1000).toFixed(0)}k - ₹{(template.estimatedBudget?.max / 1000).toFixed(0)}k
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 3: Added Rooms Display - NOW LAST */}
        {formData.rooms.length > 0 && (
          <div className="added-rooms-section">
            <h4>Added Rooms ({formData.rooms.length})</h4>
            <div className="added-rooms-list">
              {formData.rooms.map(room => (
                <div key={room.id} className="added-room-chip">
                  <span className="room-chip-name">{room.name}</span>
                  {formData.hasBudget && (
                    <span className="room-chip-budget">₹{(room.budget / 1000).toFixed(0)}k</span>
                  )}
                  <button
                    className="room-chip-remove"
                    onClick={() => deleteRoom(room.id)}
                    title="Remove room"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Notes / Requirements</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
            placeholder="Add any special requirements or notes..."
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const totals = calculateTotals(); // Total across all rooms
    const viewingTotals = viewingRoomId ? calculateTotals(viewingRoomId, viewingAreaId) : totals; // Totals for viewing room/area

    // Show loading state if products haven't loaded yet
    if (allProducts.length === 0) {
      return (
        <div className="form-step product-selection-step">
          <div className="loading-products">
            <p>Loading products...</p>
          </div>
        </div>
      );
    }

    const currentRoom = getCurrentRoom();
    
    // Determine which room's products to display in cart
    let displayRoomId = viewingRoomId;
    
    // If no viewing room is set but rooms exist, default to current room
    if (!displayRoomId && formData.rooms.length > 0) {
      displayRoomId = formData.currentRoomId;
      setViewingRoomId(displayRoomId);
      setViewingAreaId('all');
    }
    
    const viewingRoom = formData.rooms.find(r => r.id === displayRoomId);
    
    // Get products based on viewing area
    let currentProducts = [];
    if (formData.rooms.length > 0 && viewingRoom) {
      if (viewingAreaId === 'all') {
        // Show all products from all areas in this room
        viewingRoom.areas.forEach(area => {
          currentProducts = [...currentProducts, ...area.products];
        });
      } else {
        // Show products from specific area ONLY
        const viewingArea = viewingRoom.areas.find(a => a.id === viewingAreaId);
        if (viewingArea) {
          currentProducts = viewingArea.products;
        } else {
          currentProducts = [];
        }
      }
    } else {
      currentProducts = formData.selectedProducts;
    }

    return (
      <div className="form-step product-selection-step">
        <div className="product-selection-layout">
          {/* Left: Product Search & List */}
          <div className="products-panel">
            {/* Room Management - Inside Products Panel */}
            <div className="room-management-inline">
              <div className="room-inline-header">
                <h4>🏠 Selected Rooms</h4>
              </div>

              {formData.rooms.length > 0 ? (
                <div className="room-tabs-inline">
                  {formData.rooms.map(room => (
                    <div
                      key={room.id}
                      className={`room-tab-inline ${formData.currentRoomId === room.id ? 'active' : ''}`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, currentRoomId: room.id }));
                        setViewingRoomId(room.id);
                        setViewingAreaId('all');
                      }}
                    >
                      <span className="room-name">{room.name}</span>
                      <span className="room-count">({room.areas.reduce((sum, area) => sum + area.products.length, 0)})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-rooms-message">No rooms added yet. Go back to Step 1 to add rooms.</p>
              )}
            </div>

            <div className="products-header">
              <div className="products-header-row">
                <h3>Add Products{currentRoom ? ` to ${currentRoom.name}` : ''}</h3>
                
                {/* Area Filter Buttons - ALWAYS show the 4 standard areas */}
                <div className="area-filter-wrapper">
                  <button 
                    className="filter-scroll-btn"
                    onClick={() => {
                      const container = document.querySelector('.area-filter-inline');
                      if (container) container.scrollLeft -= 200;
                    }}
                  >
                    ←
                  </button>
                  
                  <div className="area-filter-inline">
                    {/* All Areas button */}
                    <button
                      className={`area-btn-inline ${formData.currentArea === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, currentArea: 'all' }));
                        setSelectedAreaForSuggestions('all');
                        const suggestions = getAreaSuggestions('all');
                        setSelectedSuggestion(suggestions[0] || '');
                      }}
                    >
                      <span className="area-icon">🏠</span>
                      <span>All Areas</span>
                    </button>
                    
                    {/* Standard 4 areas - ALWAYS shown */}
                    {standardAreas.map(area => (
                      <button
                        key={area.id}
                        className={`area-btn-inline ${formData.currentArea === area.id ? 'active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, currentArea: area.id }));
                          setSelectedAreaForSuggestions(area.id);
                          const suggestions = getAreaSuggestions(area.id);
                          setSelectedSuggestion(suggestions[0] || '');
                        }}
                      >
                        <span className="area-icon">{area.icon}</span>
                        <span>{area.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="filter-scroll-btn"
                    onClick={() => {
                      const container = document.querySelector('.area-filter-inline');
                      if (container) container.scrollLeft += 200;
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              
              {/* Search Bar and Suggestions Row - Below area filters */}
              <div className="products-filters-row">
                {/* Search Bar - Left side */}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="product-search-input"
                />
                
                {/* Product Type Suggestions - Right side */}
                {selectedAreaForSuggestions && (
                  <>
                    <button 
                      className="suggestion-scroll-btn"
                      onClick={() => {
                        const container = document.querySelector('.product-suggestions-list');
                        if (container) container.scrollLeft -= 200;
                      }}
                    >
                      ←
                    </button>
                    
                    <div className="product-suggestions-list">
                      {getAreaSuggestions(selectedAreaForSuggestions).map((suggestion, index) => (
                        <button
                          key={index}
                          className={`suggestion-chip ${selectedSuggestion === suggestion ? 'active' : ''}`}
                          onClick={() => {
                            setProductSearchQuery(suggestion);
                            setSelectedSuggestion(suggestion);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className="suggestion-scroll-btn"
                      onClick={() => {
                        const container = document.querySelector('.product-suggestions-list');
                        if (container) container.scrollLeft += 200;
                      }}
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Product Grid */}
            <div className="products-grid-scroll">
              {filteredProducts.length === 0 ? (
                <div className="no-products-found">
                  <p>No products found</p>
                  <p className="hint">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      className="product-card-mini with-image"
                    >
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x150/667eea/ffffff?text=Product';
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '150px', 
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}></div>
                      )}
                      <div className="product-card-info">
                        <strong>{product.name} {product.company?.name && `(${product.company.name})`}</strong>
                        <span className="variant">{product.variant}</span>
                        <div className="price-container">
                          {product.mrp && product.mrp > product.price ? (
                            <>
                              <span className="price-mrp">₹{product.mrp.toLocaleString()}</span>
                              <span className="price">₹{product.price.toLocaleString()}</span>
                              {product.discountPercentage > 0 && (
                                <span className="discount-badge-mini">{product.discountPercentage}% OFF</span>
                              )}
                            </>
                          ) : (
                            <span className="price">₹{product.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addProductToCart(product);
                        }}
                        title="Add to cart"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Products Cart */}
          <div className="cart-panel">
            <div className="cart-header">
              <h3>Selected Products ({currentProducts.length})</h3>
              
              {/* Room Selector Dropdown - Show when multiple rooms exist */}
              {formData.rooms.length > 0 && (
                <>
                  <div className="room-selector-dropdown">
                    <label>View Room:</label>
                    <select
                      value={viewingRoomId || ''}
                      onChange={(e) => {
                        const selectedRoomId = e.target.value;
                        setViewingRoomId(selectedRoomId);
                        setViewingAreaId('all');
                        // Also update the left side current room
                        setFormData(prev => ({ ...prev, currentRoomId: selectedRoomId }));
                      }}
                      className="room-dropdown"
                    >
                      {formData.rooms.map(room => {
                        const totalProducts = room.areas.reduce((sum, area) => sum + area.products.length, 0);
                        return (
                          <option key={room.id} value={room.id}>
                            {room.name} ({totalProducts} items)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {/* Area Selector Dropdown - Show when room is selected */}
                  {viewingRoomId && (
                    <div className="room-selector-dropdown">
                      <label>View Area:</label>
                      <select
                        value={viewingAreaId}
                        onChange={(e) => setViewingAreaId(e.target.value)}
                        className="room-dropdown"
                      >
                        <option value="all">All Areas</option>
                        {viewingRoom?.areas.map(area => (
                          <option key={area.id} value={area.id}>
                            {area.icon} {area.name} ({area.products.length})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              {/* Budget Summary */}
              <div className="budget-summary-compact">
                {formData.hasBudget ? (
                  <>
                    {/* Show all rooms breakdown when multiple rooms exist */}
                    {formData.rooms.length > 0 && (
                      <>
                        <div className="room-breakdown-grid">
                          {formData.rooms.map(room => {
                            const roomCost = room.areas.reduce((sum, area) => 
                              sum + area.products.reduce((areaSum, product) => areaSum + product.totalPrice, 0), 0
                            );
                            return (
                              <div key={room.id} className="summary-row room-breakdown-item">
                                <span>{room.name}:</span>
                                <strong>₹{roomCost.toLocaleString()}</strong>
                              </div>
                            );
                          })}
                        </div>
                        <div className="summary-divider"></div>
                      </>
                    )}
                    
                    {/* Overall total cost */}
                    {formData.rooms.length > 0 ? (
                      <>
                        <div className="summary-row overall-row">
                          <span>Total Cost (All Rooms):</span>
                          <strong>₹{totals.totalCost.toLocaleString()}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="summary-row">
                          <span>Total Cost:</span>
                          <strong>₹{totals.totalCost.toLocaleString()}</strong>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Show all rooms breakdown when multiple rooms exist (without budget) */}
                    {formData.rooms.length > 0 && (
                      <>
                        <div className="room-breakdown-grid">
                          {formData.rooms.map(room => {
                            const roomCost = room.areas.reduce((sum, area) => 
                              sum + area.products.reduce((areaSum, product) => areaSum + product.totalPrice, 0), 0
                            );
                            return (
                              <div key={room.id} className="summary-row room-breakdown-item">
                                <span>{room.name}:</span>
                                <strong>₹{roomCost.toLocaleString()}</strong>
                              </div>
                            );
                          })}
                        </div>
                        <div className="summary-divider"></div>
                      </>
                    )}
                    <div className="summary-row no-budget">
                      <span>{formData.rooms.length > 0 ? 'Total Cost (All Rooms):' : 'Total Cost:'}</span>
                      <strong>₹{totals.totalCost.toLocaleString()}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cart Items - Table Layout */}
            <div className="cart-items-scroll">
              {currentProducts.length === 0 ? (
                <div className="empty-cart">
                  <p>No products added yet</p>
                  <p className="hint">{formData.rooms.length > 0 ? `No products in ${viewingRoom?.name || 'this room'}` : 'Click on products to add them'}</p>
                </div>
              ) : (
                <div className="cart-items-table">
                  {currentProducts.map((item, index) => (
                    <div key={index} className="cart-table-item">
                      {/* Row 1: Product Name, Variant, Company Badge, and Remove Button */}
                      <div className="cart-table-row-1">
                        <div className="product-info-row">
                          <strong className="product-name">{item.productName}</strong>
                          <span className="variant-text">{item.variant}</span>
                          <span className="company-badge">{item.companyName}</span>
                          <button 
                            className="remove-btn-table"
                            onClick={() => removeProduct(index)}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      {/* Row 2: QTY with +/-, DISC%, and Price */}
                      <div className="cart-table-row-2">
                        <div className="product-controls-inline">
                          <div className="control-group qty-control">
                            <label>QTY:</label>
                            <div className="qty-buttons-wrapper">
                              <button 
                                className="qty-btn"
                                onClick={() => updateProductQuantity(index, Math.max(1, item.quantity - 1))}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateProductQuantity(index, e.target.value)}
                              />
                              <button 
                                className="qty-btn"
                                onClick={() => updateProductQuantity(index, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className="control-group">
                            <label>DISC %:</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent || 0}
                              onChange={(e) => updateProductDiscount(index, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="product-pricing">
                          <div className="unit-price-container">
                            <span className="unit-price-mrp">₹{item.unitPrice.toLocaleString()}</span>
                            <span className="unit-price-discounted">
                              ₹{(item.unitPrice * (1 - item.discountPercent / 100)).toLocaleString()} each
                            </span>
                            {item.discountPercent > 0 && (
                              <span className="discount-badge-cart">{item.discountPercent}% OFF</span>
                            )}
                          </div>
                          <span className="total-price-large">₹{item.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Removed, use Step 3 instead */}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="form-step save-option-step">
        <h3>Step 3: Choose How to Save</h3>
        <p className="step-description">Select how you want to save this project</p>
        
        <div className="save-options-three">
          <div 
            className={`save-option-card ${saveOption === 'budget-plan' ? 'selected' : ''}`}
            onClick={() => setSaveOption('budget-plan')}
          >
            <div className="option-icon">💼</div>
            <h4>Save as Budget Plan</h4>
            <p>Save as a draft budget plan. You can edit and finalize it later.</p>
            <ul className="option-features">
              <li>✓ Quick save</li>
              <li>✓ Can edit later</li>
              <li>✓ Track budget vs actual</li>
            </ul>
          </div>

          <div 
            className={`save-option-card ${saveOption === 'quotation' ? 'selected' : ''}`}
            onClick={() => setSaveOption('quotation')}
          >
            <div className="option-icon">📄</div>
            <h4>Save as Quotation</h4>
            <p>Create a finalized quotation for the customer. Generate PDF quotation.</p>
            <ul className="option-features">
              <li>✓ Professional quotation</li>
              <li>✓ Generate PDF</li>
              <li>✓ Can convert to order later</li>
            </ul>
          </div>

          <div 
            className={`save-option-card ${saveOption === 'order' ? 'selected' : ''}`}
            onClick={() => setSaveOption('order')}
          >
            <div className="option-icon">📦</div>
            <h4>Save as Order</h4>
            <p>Create a confirmed order with full details including shipping address and payment.</p>
            <ul className="option-features">
              <li>✓ Full order details</li>
              <li>✓ Shipping & billing address</li>
              <li>✓ Quotation auto-generated</li>
            </ul>
          </div>
        </div>

        {saveOption === 'quotation' && (
          <div className="quotation-details-form">
            <h4>Quotation Details</h4>
            <p className="form-description">Provide important information for the quotation</p>
            
            <div className="form-row">
              <div className="form-group">
                <label>Quotation Validity *</label>
                <select
                  value={formData.quotationValidity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quotationValidity: e.target.value }))}
                >
                  <option value="15 days">15 Days</option>
                  <option value="30 days">30 Days</option>
                  <option value="45 days">45 Days</option>
                  <option value="60 days">60 Days</option>
                  <option value="90 days">90 Days</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expected Delivery Time *</label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                >
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="2-3 weeks">2-3 Weeks</option>
                  <option value="3-4 weeks">3-4 Weeks</option>
                  <option value="1 month">1 Month</option>
                  <option value="6-8 weeks">6-8 Weeks</option>
                  <option value="2 months">2 Months</option>
                  <option value="As per discussion">As per Discussion</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Payment Terms *</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
              >
                <option value="100% advance">100% Advance</option>
                <option value="50% advance, 50% before dispatch">50% Advance, 50% Before Dispatch</option>
                <option value="30% advance, 70% before dispatch">30% Advance, 70% Before Dispatch</option>
                <option value="50% advance, 50% on delivery">50% Advance, 50% On Delivery</option>
                <option value="As per agreement">As Per Agreement</option>
              </select>
            </div>

            <div className="form-group">
              <label>Special Instructions / Notes</label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                rows="3"
                placeholder="Any special instructions, warranty details, or additional notes for the quotation..."
              />
            </div>
          </div>
        )}

        {saveOption === 'order' && (
          <div className="order-details-form">
            <h4>Order Details</h4>
            
            <div className="form-section">
              <h5>Shipping Address</h5>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                    }))}
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.pincode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, pincode: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Landmark</label>
                  <input
                    type="text"
                    value={formData.shippingAddress.landmark}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, landmark: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sameAsShipping}
                  onChange={(e) => setFormData(prev => ({ ...prev, sameAsShipping: e.target.checked }))}
                />
                Billing address same as shipping
              </label>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="pending">Pending</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose && onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose && onClose();
  };

  return (
    <>
    <div className="modal-overlay fullscreen" onClick={handleOverlayClick}>
      <div className={`modal-content budget-plan-form-modal fullscreen ${currentStep === 1 ? 'step-1-compact' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-with-progress">
            <h2>Create Budget Plan / Order</h2>
            <div className="inline-progress-bar">
              <div 
                className="inline-progress-fill" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
          <button className="modal-close" onClick={handleCloseClick} type="button">×</button>
        </div>

        <div className="form-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {currentStep === 1 && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleNext} className="btn-primary">
              Next: Add Products →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="modal-footer">
            <button onClick={handlePrevious} className="btn-secondary">
              ← Previous
            </button>
            <button 
              onClick={() => setShowPreview(true)} 
              className="btn-preview"
              disabled={
                formData.rooms.length > 0 
                  ? !formData.rooms.some(room => room.areas.some(area => area.products.length > 0))
                  : formData.selectedProducts.length === 0
              }
            >
              👁️ Preview
            </button>
            <button 
              onClick={handleNext} 
              className="btn-primary"
              disabled={
                formData.rooms.length > 0 
                  ? !formData.rooms.some(room => room.areas.some(area => area.products.length > 0))
                  : formData.selectedProducts.length === 0
              }
            >
              Next: Choose Save Option →
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="modal-footer">
            <button onClick={handlePrevious} className="btn-secondary">
              ← Previous
            </button>
            {saveOption === 'budget-plan' && (
              <button 
                onClick={handleSaveBudgetPlan} 
                className="btn-primary"
                disabled={savingAs === 'plan'}
              >
                {savingAs === 'plan' ? 'Saving...' : '💼 Save as Budget Plan'}
              </button>
            )}
            {saveOption === 'quotation' && (
              <button 
                onClick={handleSaveBudgetPlan} 
                className="btn-primary"
                disabled={savingAs === 'plan'}
              >
                {savingAs === 'plan' ? 'Saving...' : '📄 Save as Quotation'}
              </button>
            )}
            {saveOption === 'order' && (
              <button 
                onClick={handleSaveAsOrder} 
                className="btn-primary"
                disabled={savingAs === 'order' || !formData.shippingAddress.street || !formData.shippingAddress.city || !formData.shippingAddress.state || !formData.shippingAddress.pincode}
              >
                {savingAs === 'order' ? 'Creating Order...' : '📦 Save as Order'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Room Name Selection Modal - At component level for proper z-index */}
    {showTemplateModal && selectedTemplate && (
      <div className="room-name-modal-overlay" onClick={() => {
        setShowTemplateModal(false);
        setSelectedRoomNames([]);
        setCustomRoomName('');
      }}>
        <div className="room-name-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-simple">
            <h3>Select Room Names for {selectedTemplate.name}</h3>
            <button className="btn-close-simple" onClick={() => {
              setShowTemplateModal(false);
              setSelectedRoomNames([]);
              setCustomRoomName('');
            }}>×</button>
          </div>
          
          <div className="room-name-options">
            {getRoomNameOptions(selectedTemplate.name).map(option => (
              <div key={option.id} className="room-name-option-checkbox">
                {option.isCustom ? (
                  <div className="custom-room-input-checkbox">
                    <input
                      type="text"
                      placeholder={`Enter custom ${selectedTemplate.name.toLowerCase()} name`}
                      value={customRoomName}
                      onChange={(e) => setCustomRoomName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          toggleRoomNameSelection(e.target.value.trim());
                          setCustomRoomName('');
                        }
                      }}
                    />
                    <button
                      className="btn-add-custom-checkbox"
                      onClick={() => {
                        if (customRoomName.trim()) {
                          toggleRoomNameSelection(customRoomName.trim());
                          setCustomRoomName('');
                        }
                      }}
                      disabled={!customRoomName.trim()}
                    >
                      Add to Selection
                    </button>
                  </div>
                ) : (
                  <label className="checkbox-room-name">
                    <input
                      type="checkbox"
                      checked={selectedRoomNames.includes(option.label)}
                      onChange={() => toggleRoomNameSelection(option.label)}
                    />
                    <span className="checkbox-label">{option.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* Selected rooms display */}
          {selectedRoomNames.length > 0 && (
            <div className="selected-rooms-preview">
              <p><strong>Selected ({selectedRoomNames.length}):</strong></p>
              <div className="selected-rooms-chips">
                {selectedRoomNames.map((name, index) => (
                  <span key={index} className="selected-room-chip">
                    {name}
                    <button onClick={() => toggleRoomNameSelection(name)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add button */}
          <div className="modal-footer-simple">
            <button
              className="btn-add-selected-rooms"
              onClick={handleAddSelectedRooms}
              disabled={selectedRoomNames.length === 0}
            >
              Add {selectedRoomNames.length} Room{selectedRoomNames.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Preview Modal */}
    {showPreview && (
      <div className="modal-overlay fullscreen" onClick={() => setShowPreview(false)}>
        <div className="modal-content preview-modal preview-modal-quotation" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>📋 Quotation Preview</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={() => setIsEditMode(!isEditMode)} 
                className={isEditMode ? "btn-edit-active" : "btn-edit"}
                title={isEditMode ? "View Mode" : "Edit Mode"}
              >
                {isEditMode ? '👁️ View' : '✏️ Edit Prices'}
              </button>
              {isEditMode && Object.keys(editedPrices).length > 0 && (
                <button 
                  onClick={resetEditedPrices} 
                  className="btn-reset"
                  title="Reset all edited prices"
                >
                  🔄 Reset
                </button>
              )}
              <button className="modal-close" onClick={() => setShowPreview(false)}>×</button>
            </div>
          </div>
          
          <div className="preview-content preview-quotation-content">
            {/* Simple Header */}
            <div className="preview-header-simple">
              <div className="preview-header-left">
                <h3>Customer: {formData.customerName}</h3>
                <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
              <div className="preview-header-right">
                <p>Phone: {formData.customerPhone}</p>
                <p>Email: {formData.customerEmail}</p>
              </div>
            </div>

            {/* Products Summary */}
            {formData.rooms.length > 0 ? (
              <div className="preview-rooms-summary">
                {formData.rooms.map(room => {
                  // Flatten products from all areas
                  let allRoomProducts = [];
                  room.areas.forEach(area => {
                    area.products.forEach(product => {
                      allRoomProducts.push({
                        ...product,
                        areaId: area.id,
                        roomId: room.id
                      });
                    });
                  });
                  
                  const roomTotal = allRoomProducts.reduce((sum, product) => {
                    const productKey = `${product.roomId}-${product.areaId}-${product.productName}-${product.variant}`;
                    return sum + getProductPrice(productKey, product.totalPrice);
                  }, 0);
                  
                  return (
                    <div key={room.id} className="preview-room-card">
                      <div className="preview-room-header">
                        <h4>{room.name}</h4>
                        <span className="preview-room-total">₹{roomTotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="preview-products-list">
                        {allRoomProducts.map((product, idx) => {
                          const productKey = `${product.roomId}-${product.areaId}-${product.productName}-${product.variant}`;
                          const currentPrice = getProductPrice(productKey, product.totalPrice);
                          
                          return (
                            <div key={idx} className="preview-product-item">
                              <div className="preview-product-info">
                                <span className="preview-product-name">{product.productName}</span>
                                {product.variant && <span className="preview-product-variant">{product.variant}</span>}
                              </div>
                              <div className="preview-product-qty">
                                <span>Qty: {product.quantity}</span>
                              </div>
                              <div className="preview-product-price">
                                {isEditMode ? (
                                  <input
                                    type="number"
                                    value={currentPrice}
                                    onChange={(e) => handlePriceEdit(productKey, e.target.value)}
                                    className="price-edit-input"
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <span className={editedPrices[productKey] !== undefined ? 'edited-price' : ''}>
                                    ₹{currentPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="preview-products-list">
                {formData.selectedProducts.map((product, idx) => {
                  const productKey = `general-${product.productName}-${product.variant}`;
                  const currentPrice = getProductPrice(productKey, product.totalPrice);
                  
                  return (
                    <div key={idx} className="preview-product-item">
                      <div className="preview-product-info">
                        <span className="preview-product-name">{product.productName}</span>
                        {product.variant && <span className="preview-product-variant">{product.variant}</span>}
                      </div>
                      <div className="preview-product-qty">
                        <span>Qty: {product.quantity}</span>
                      </div>
                      <div className="preview-product-price">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => handlePriceEdit(productKey, e.target.value)}
                            className="price-edit-input"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className={editedPrices[productKey] !== undefined ? 'edited-price' : ''}>
                            ₹{currentPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grand Total */}
            <div className="preview-grand-total">
              <span>Grand Total:</span>
              <span className="preview-total-amount">₹{calculateTotals().totalCost.toLocaleString()}</span>
            </div>
            
            {Object.keys(editedPrices).length > 0 && (
              <div className="preview-edit-notice">
                <span>⚠️ {Object.keys(editedPrices).length} price(s) have been edited</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={() => setShowPreview(false)} className="btn-secondary">Close</button>
            <button 
              onClick={async () => {
                setGenerating(true);
                try {
                  // Get staff info from localStorage
                  const staffId = localStorage.getItem('staffId') || '';
                  const staffName = localStorage.getItem('staffName') || '';
                  const staffPhone = localStorage.getItem('staffPhone') || '';
                  
                  // Apply edited prices to rooms data
                  const roomsWithEditedPrices = formData.rooms.map(room => ({
                    ...room,
                    areas: room.areas.map(area => ({
                      ...area,
                      products: area.products.map(product => {
                        const productKey = `${room.id}-${area.id}-${product.productName}-${product.variant}`;
                        const editedPrice = editedPrices[productKey];
                        return {
                          ...product,
                          totalPrice: editedPrice !== undefined ? editedPrice : product.totalPrice
                        };
                      })
                    }))
                  }));
                  
                  // Prepare quotation data for PDF
                  const quotationData = {
                    quotationNumber: `QT-${Date.now()}`,
                    quotationDate: new Date().toLocaleDateString('en-GB'),
                    clientData: {
                      clientName: formData.customerName,
                      companyName: formData.customerName,
                      mobileNumber: formData.customerPhone,
                      email: formData.customerEmail,
                      address: formData.customerAddress,
                      gstNumber: formData.customerGST
                    },
                    rooms: roomsWithEditedPrices,
                    total: calculateTotals().totalCost,
                    attendedByStaffId: staffId,
                    attendedByName: staffName,
                    attendedByPhone: staffPhone
                  };
                  
                  await QuotationPDFGenerator(quotationData, { separateByRoom: false });
                  alert('PDF generated successfully!');
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  alert('Failed to generate PDF');
                } finally {
                  setGenerating(false);
                }
              }}
              className="btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : '📥 Download Combined PDF'}
            </button>
            {formData.rooms && formData.rooms.length > 1 && (
              <button 
                onClick={async () => {
                  setGenerating(true);
                  try {
                    // Get staff info from localStorage
                    const staffId = localStorage.getItem('staffId') || '';
                    const staffName = localStorage.getItem('staffName') || '';
                    const staffPhone = localStorage.getItem('staffPhone') || '';
                    
                    // Apply edited prices to rooms data
                    const roomsWithEditedPrices = formData.rooms.map(room => ({
                      ...room,
                      areas: room.areas.map(area => ({
                        ...area,
                        products: area.products.map(product => {
                          const productKey = `${room.id}-${area.id}-${product.productName}-${product.variant}`;
                          const editedPrice = editedPrices[productKey];
                          return {
                            ...product,
                            totalPrice: editedPrice !== undefined ? editedPrice : product.totalPrice
                          };
                        })
                      }))
                    }));
                    
                    // Prepare quotation data for PDF
                    const quotationData = {
                      quotationNumber: `QT-${Date.now()}`,
                      quotationDate: new Date().toLocaleDateString('en-GB'),
                      clientData: {
                        clientName: formData.customerName,
                        companyName: formData.customerName,
                        mobileNumber: formData.customerPhone,
                        email: formData.customerEmail,
                        address: formData.customerAddress,
                        gstNumber: formData.customerGST
                      },
                      rooms: roomsWithEditedPrices,
                      total: calculateTotals().totalCost,
                      attendedByStaffId: staffId,
                      attendedByName: staffName,
                      attendedByPhone: staffPhone
                    };
                    
                    await QuotationPDFGenerator(quotationData, { separateByRoom: true });
                    alert(`${formData.rooms.length} separate PDFs generated successfully!`);
                  } catch (error) {
                    console.error('Error generating PDFs:', error);
                    alert('Failed to generate PDFs');
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="btn-primary"
                disabled={generating}
                style={{ marginLeft: '10px' }}
              >
                {generating ? 'Generating...' : '📥 Download Separate PDFs'}
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminBudgetPlanForm;
