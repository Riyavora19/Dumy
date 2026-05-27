import { useState, useEffect } from 'react';
import './AdminBudgetPlanForm.css';
import './QuotationPreviewPDF.css';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import { roomTemplatePresets } from './RoomTemplatePresets';

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
    if (!templateName) return [{ id: 'custom', label: 'Custom Room', isCustom: true }];
    
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
  // Now uses preset templates with predefined areas
  const getAreasForRoom = (roomName) => {
    // Check if we have a preset template for this room name (case-insensitive)
    const presetKey = Object.keys(roomTemplatePresets).find(
      key => key.toLowerCase() === roomName.toLowerCase()
    );
    
    if (presetKey && roomTemplatePresets[presetKey]) {
      return roomTemplatePresets[presetKey].areas;
    }
    
    // Fallback to standard areas
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
    projectLocation: '', // NEW: Project Location field
    attention: '', // NEW: Attention/Contact person field
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
  const [columnFormat, setColumnFormat] = useState('format2'); // Column format: format1-6
  const [isEditMode, setIsEditMode] = useState(false); // For editable preview
  const [editedPrices, setEditedPrices] = useState({}); // Store edited prices by product ID
  const [gstRate, setGstRate] = useState(18); // GST rate percentage (default 18%)
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
    // First, check if we have a current room with preset suggestions for this area
    if (viewingRoomId) {
      const currentRoom = formData.rooms.find(r => r.id === viewingRoomId);
      if (currentRoom) {
        const area = currentRoom.areas.find(a => a.id === areaId);
        if (area && area.suggestedProducts && area.suggestedProducts.length > 0) {
          // Return preset suggestions for this specific room's area
          return area.suggestedProducts;
        }
      }
    }
    
    // Fallback to general suggestions
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
      ],
      bathtub: [
        'Bathtub', 'Freestanding', 'Built-in', 'Jacuzzi', 'Bath Spout', 'Bath Mixer', 'Bath Filler'
      ],
      sink: [
        'Kitchen Sink', 'Single Bowl', 'Double Bowl', 'Sink Mixer', 'Soap Dispenser', 'Drain Basket'
      ],
      countertop: [
        'Countertop', 'Granite', 'Marble', 'Quartz', 'Backsplash', 'Tiles'
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
      const response = await fetch('https://dumy-2-mli2.onrender.com/api/room-templates');
      const data = await response.json();
      setRoomTemplates(data);
    } catch (error) {
      console.error('Error fetching room templates:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://dumy-2-mli2.onrender.com/api/products');
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
        company: product.company || { name: 'Unknown' },
        discountPercentage: product.company?.defaultDiscountPercentage || 0
      }));
      
      console.log('Processed products:', products.length);
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://dumy-2-mli2.onrender.com/api/categories');
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

    // Filter by search query — also checks itemType name for suggestion chip matches
    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();

      // Build a keyword map: suggestion label → keywords to match in product fields
      const suggestionKeywords = {
        'table top basin': ['table top', 'countertop basin', 'vessel', 'table top basin'],
        'wall hung basin': ['wall hung basin', 'wall mount basin', 'wall hung wash'],
        'pedestal basin': ['pedestal', 'full pedestal', 'half pedestal'],
        'basin mixer': ['basin mixer', 'basin tap', 'basin faucet', 'pillar cock', 'pillar tap', 'mono bloc', 'single lever'],
        'led mirror': ['led mirror', 'backlit mirror', 'illuminated mirror', 'smart mirror'],
        'mirror': ['mirror'],
        'vanity unit': ['vanity', 'vanity unit', 'vanity cabinet'],
        'rain shower': ['rain shower', 'overhead shower', 'ceiling shower'],
        'hand shower': ['hand shower', 'hand held shower'],
        'shower mixer': ['shower mixer', 'shower valve', 'diverter'],
        'shower panel': ['shower panel', 'shower column', 'shower tower', 'shower system'],
        'one piece': ['one piece', 'one-piece', '1 piece'],
        'two piece': ['two piece', 'two-piece', '2 piece', 'flush tank'],
        'wall hung toilet': ['wall hung toilet', 'wall hung wc', 'concealed cistern', 'flush plate'],
        'health faucet': ['health faucet', 'bidet'],
        'flush plate': ['flush plate', 'flush button'],
        'smart toilet': ['smart toilet', 'intelligent toilet'],
        'sensor faucet': ['sensor', 'touchless', 'automatic tap'],
        'angle valve': ['angle valve', 'stop cock', 'ball valve'],
        'bathtub': ['bathtub', 'bath tub'],
        'jacuzzi': ['jacuzzi', 'whirlpool', 'spa bath'],
        'urinal': ['urinal'],
        'floor tiles': ['floor tile', 'flooring'],
        'wall tiles': ['wall tile', 'ceramic tile', 'porcelain', 'vitrified', 'tile'],
      };

      // Check if the query matches a known suggestion label
      const knownKeywords = suggestionKeywords[query];

      filtered = filtered.filter(product => {
        const searchText = [
          product.name || '',
          product.variant || '',
          product.itemTypeName || '',
          // also check the populated itemType name
          (typeof product.itemType === 'object' && product.itemType?.name) ? product.itemType.name : '',
          product.broadCategory || '',
          product.cat || '',
        ].join(' ').toLowerCase();

        if (knownKeywords) {
          // Match by item type name first (most reliable)
          const itemTypeName = [
            product.itemTypeName || '',
            (typeof product.itemType === 'object' && product.itemType?.name) ? product.itemType.name : ''
          ].join(' ').toLowerCase();

          if (itemTypeName && knownKeywords.some(kw => itemTypeName.includes(kw))) return true;
          // Fallback: keyword match on full text
          return knownKeywords.some(kw => searchText.includes(kw));
        }

        // Regular free-text search
        return searchText.includes(query);
      });
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
      const areaKeywords = getAreaKeywords(roomName, formData.currentArea);

      if (areaKeywords.length > 0) {
        filtered = filtered.filter(product => {
          const searchText = [
            product.name || '',
            product.variant || '',
            product.itemTypeName || '',
            (typeof product.itemType === 'object' && product.itemType?.name) ? product.itemType.name : '',
          ].join(' ').toLowerCase();
          return areaKeywords.some(keyword => searchText.includes(keyword));
        });
      }
    }

    setFilteredProducts(filtered);
  };

  // Get keywords for filtering products based on room type and area
  // Also maps area → item type names for reliable matching
  const getAreaKeywords = (roomName, areaId) => {
    const areaKeywords = {
      shower: [
        // item type names
        'shower head', 'rain shower', 'shower panel',
        // product name keywords
        'shower', 'rain', 'hand shower', 'overhead', 'shower mixer', 'diverter',
        'spray', 'body jet', 'body spray', 'shower arm', 'sliding rail', 'slide rail',
        'shower drain', 'shower tray', 'shower enclosure', 'shower cabin', 'shower door',
        'shower screen', 'shower curtain', 'shower hose', 'shower bracket', 'shower holder',
        'bath spout', 'bath mixer', 'bath filler', 'bathtub', 'freestanding bathtub', 'jacuzzi'
      ],
      basin: [
        // item type names
        'basin faucet', 'table top basin', 'wall hung basin', 'pedestal basin',
        'sensor faucet', 'led mirror', 'smart mirror', 'vanity cabinet', 'wall cabinet',
        // product name keywords
        'basin', 'washbasin', 'wash basin', 'sink', 'lavatory', 'faucet', 'tap', 'mixer',
        'pillar cock', 'pillar tap', 'counter', 'vanity', 'cabinet', 'mirror',
        'sensor tap', 'touchless', 'angle valve', 'stop cock', 'waste coupling',
        'bottle trap', 'p-trap', 'drain', 'strainer', 'aerator', 'soap dispenser', 'soap dish',
        'towel bar', 'towel ring', 'towel rack', 'robe hook', 'toilet paper holder',
        'paper holder', 'tumbler', 'toothbrush', 'grab bar', 'accessories', 'accessory',
        'o-ring', 'oring', 'washer', 'screw', 'nut', 'bolt', 'spring', 'clip', 'seal',
        'gasket', 'fitting', 'connector', 'adapter', 'elbow', 'tee', 'reducer', 'coupling',
        'nipple', 'flange', 'bracket', 'anchor', 'aspirator', 'spud', 'combo pack'
      ],
      wc: [
        // item type names
        'one piece toilet', 'two piece toilet', 'wall hung toilet', 'smart toilet',
        // product name keywords
        'toilet', 'wc', 'commode', 'closet', 'flush', 'seat', 'cistern', 'tank', 'bowl',
        'bidet', 'health faucet', 'one piece', 'two piece', 'flush plate', 'seat cover'
      ],
      urinal: [
        'urinal', 'urinals', 'flush valve', 'partition', 'spreader', 'waterless'
      ]
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
      const response = await fetch(`https://dumy-2-mli2.onrender.com/api/contacts/search/autocomplete?q=${query}`);
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
  // Function to auto-add default products for a room
  const autoAddDefaultProducts = (roomId, roomName) => {
    try {
      const roomPreset = roomTemplatePresets[roomName];
      if (!roomPreset || !roomPreset.areas) {
        console.log('No preset found for room:', roomName);
        return;
      }
      
      // Check if products are loaded
      if (!allProducts || allProducts.length === 0) {
        console.warn('Products not loaded yet, skipping auto-add');
        return;
      }

      // Collect all default products from all areas
      const defaultProductsToAdd = [];
      
      for (const area of roomPreset.areas) {
        if (area.defaultProducts && area.defaultProducts.length > 0) {
          for (const defaultProd of area.defaultProducts) {
            // Safety check for keyword
            if (!defaultProd || !defaultProd.keyword) {
              console.warn('Invalid default product config:', defaultProd);
              continue;
            }
            
            // Search for a product matching the keyword
            const matchingProduct = allProducts.find(p => 
              (p.name && p.name.toLowerCase().includes(defaultProd.keyword.toLowerCase())) ||
              (p.variant && p.variant.toLowerCase().includes(defaultProd.keyword.toLowerCase()))
            );
            
            if (matchingProduct) {
              console.log(`✓ Found product for "${defaultProd.keyword}":`, matchingProduct.name);
              defaultProductsToAdd.push({
                product: matchingProduct,
                areaId: area.id,
                quantity: defaultProd.quantity || 1,
                essential: defaultProd.essential || false
              });
            } else {
              console.warn(`✗ No product found for keyword: "${defaultProd.keyword}" in area: ${area.name}`);
            }
          }
        }
      }

      // Add all found products to the room
      if (defaultProductsToAdd.length > 0) {
        setFormData(prev => {
          const updatedRooms = prev.rooms.map(room => {
            if (room.id === roomId) {
              const updatedAreas = room.areas.map(area => {
                const productsForThisArea = defaultProductsToAdd.filter(p => p.areaId === area.id);
                
                if (productsForThisArea.length > 0) {
                  const newProducts = productsForThisArea.map(p => {
                    const unitPrice = p.product.price || 0;
                    // Default to 0% discount - admin can change later
                    const discountPercent = 0;
                    const discountedPrice = unitPrice;
                    const totalPrice = discountedPrice * p.quantity;
                    
                    return {
                      _id: p.product._id,
                      productId: p.product._id,
                      productName: p.product.name,
                      variant: p.product.variant || '',
                      company: p.product.company?._id || p.product.company,
                      companyName: p.product.company?.name || '',
                      category: p.product.category?._id || p.product.category,
                      categoryName: p.product.category?.name || '',
                      quantity: p.quantity,
                      unitPrice: unitPrice,
                      rate: unitPrice,
                      discountPercent: discountPercent,
                      totalPrice: totalPrice,
                      images: p.product.images || [],
                      sku: p.product.sku || '',
                      isEssential: p.essential // Mark as essential
                    };
                  });
                  
                  return {
                    ...area,
                    products: [...area.products, ...newProducts]
                  };
                }
                return area;
              });
              
              return {
                ...room,
                areas: updatedAreas
              };
            }
            return room;
          });
          
          return {
            ...prev,
            rooms: updatedRooms
          };
        });
        
        console.log(`Auto-added ${defaultProductsToAdd.length} products to ${roomName}`);
      }
    } catch (error) {
      console.error('Error auto-adding products:', error);
    }
  };

  const handleAddRoomFromTemplate = async (roomNameOption, customName = '') => {
    if (!selectedTemplate) return;

    const finalRoomName = roomNameOption.isCustom && customName 
      ? customName 
      : roomNameOption.label;

    // Get budget from template
    const roomBudget = formData.hasBudget 
      ? (selectedTemplate.estimatedBudget?.recommended || selectedTemplate.estimatedBudget?.min || 50000)
      : 0;

    // Get preset areas for this room name, or fallback to standard areas
    const roomAreas = getAreasForRoom(finalRoomName);

    // Create new room with preset areas from template
    const newRoom = {
      id: Date.now().toString() + Math.random(),
      name: finalRoomName,
      budget: roomBudget,
      templateId: selectedTemplate._id,
      templateName: selectedTemplate.name,
      areas: roomAreas.map(area => ({
        id: area.id,
        name: area.name,
        icon: area.icon,
        suggestedProducts: area.suggestedProducts || [], // Store suggested product keywords
        defaultProducts: area.defaultProducts || [], // Store default products config
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

    // Auto-add default products after a short delay to ensure room is created
    setTimeout(() => {
      autoAddDefaultProducts(newRoom.id, finalRoomName);
    }, 100);
  };

  // NEW: Handle adding multiple selected rooms
  const handleAddSelectedRooms = () => {
    if (!selectedTemplate || selectedRoomNames.length === 0) return;

    const roomBudget = formData.hasBudget 
      ? (selectedTemplate.estimatedBudget?.recommended || selectedTemplate.estimatedBudget?.min || 50000)
      : 0;

    const newRooms = selectedRoomNames.map(roomName => {
      // Get preset areas for this room name
      const roomAreas = getAreasForRoom(roomName);
      
      return {
        id: Date.now().toString() + Math.random(),
        name: roomName,
        budget: roomBudget,
        templateId: selectedTemplate._id,
        templateName: selectedTemplate.name,
        areas: roomAreas.map(area => ({
          id: area.id,
          name: area.name,
          icon: area.icon,
          suggestedProducts: area.suggestedProducts || [], // Store suggested product keywords
          defaultProducts: area.defaultProducts || [], // Store default products config
          products: []
        }))
      };
    });

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

    // Auto-add default products for all new rooms
    setTimeout(() => {
      newRooms.forEach(room => {
        autoAddDefaultProducts(room.id, room.name);
      });
    }, 100);
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
    console.log('Adding product to cart:', {
      name: product.name,
      company: product.company,
      discountPercentage: product.discountPercentage,
      companyDiscount: product.company?.defaultDiscountPercentage
    });
    
    // If rooms exist, add to current room's viewing area
    if (formData.rooms.length > 0) {
      if (!formData.currentRoomId) {
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
        discountPercent: 0, // Default to 0% discount - admin can change later
        totalPrice: product.mrp || product.price,
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
        // Recalculate with discount
        const discountAmount = (updated[existingIndex].unitPrice * updated[existingIndex].discountPercent) / 100;
        const discountedPrice = updated[existingIndex].unitPrice - discountAmount;
        updated[existingIndex].totalPrice = discountedPrice * updated[existingIndex].quantity;
        setFormData(prev => ({ ...prev, selectedProducts: updated }));
        return;
      }

      // Add new product
      const unitPrice = product.mrp || product.price;
      const discountPercent = 0; // Default to 0% discount - admin can change later
      const discountAmount = 0;
      const discountedPrice = unitPrice;
      
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
        unitPrice: unitPrice,
        discount: discountAmount,
        discountPercent: discountPercent,
        totalPrice: discountedPrice,
        image: product.images?.[0] || ''
      };

      setFormData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, newProduct]
      }));
    }
  };

  const updateProductQuantity = (displayIndex, quantity) => {
    // Get the product from the display list to find its actual location
    const viewingRoom = formData.rooms.find(r => r.id === viewingRoomId);
    let currentProducts = [];
    
    if (formData.rooms.length > 0 && viewingRoom) {
      if (viewingAreaId === 'all') {
        viewingRoom.areas.forEach(area => {
          area.products.forEach((product, productIndex) => {
            currentProducts.push({
              ...product,
              _areaId: area.id,
              _productIndex: productIndex
            });
          });
        });
      } else {
        const viewingArea = viewingRoom.areas.find(a => a.id === viewingAreaId);
        if (viewingArea) {
          currentProducts = viewingArea.products.map((product, productIndex) => ({
            ...product,
            _areaId: viewingArea.id,
            _productIndex: productIndex
          }));
        }
      }
    } else {
      currentProducts = formData.selectedProducts.map((product, productIndex) => ({
        ...product,
        _productIndex: productIndex
      }));
    }
    
    const productToUpdate = currentProducts[displayIndex];
    if (!productToUpdate) {
      console.error('Product not found at index:', displayIndex);
      return;
    }
    
    const actualAreaId = productToUpdate._areaId;
    const actualIndex = productToUpdate._productIndex;
    const qty = parseInt(quantity) || 1;
    
    if (formData.rooms.length > 0 && viewingRoomId) {
      // Update product in specific area
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === viewingRoomId) {
            return {
              ...room,
              areas: room.areas.map(area => {
                if (area.id === actualAreaId) {
                  const updated = [...area.products];
                  const product = updated[actualIndex];
                  if (product) {
                    product.quantity = qty;
                    const discountAmount = (product.unitPrice * product.discountPercent) / 100;
                    const discountedPrice = product.unitPrice - discountAmount;
                    product.totalPrice = discountedPrice * product.quantity;
                  }
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
      const product = updated[actualIndex];
      if (product) {
        product.quantity = qty;
        const discountAmount = (product.unitPrice * product.discountPercent) / 100;
        const discountedPrice = product.unitPrice - discountAmount;
        product.totalPrice = discountedPrice * product.quantity;
      }
      setFormData(prev => ({ ...prev, selectedProducts: updated }));
    }
  };

  const updateProductDiscount = (displayIndex, discountPercent) => {
    const percent = parseFloat(discountPercent) || 0;
    
    // Get the product from the display list to find its actual location
    const viewingRoom = formData.rooms.find(r => r.id === viewingRoomId);
    let currentProducts = [];
    
    if (formData.rooms.length > 0 && viewingRoom) {
      if (viewingAreaId === 'all') {
        viewingRoom.areas.forEach(area => {
          area.products.forEach((product, productIndex) => {
            currentProducts.push({
              ...product,
              _areaId: area.id,
              _productIndex: productIndex
            });
          });
        });
      } else {
        const viewingArea = viewingRoom.areas.find(a => a.id === viewingAreaId);
        if (viewingArea) {
          currentProducts = viewingArea.products.map((product, productIndex) => ({
            ...product,
            _areaId: viewingArea.id,
            _productIndex: productIndex
          }));
        }
      }
    } else {
      currentProducts = formData.selectedProducts.map((product, productIndex) => ({
        ...product,
        _productIndex: productIndex
      }));
    }
    
    const productToUpdate = currentProducts[displayIndex];
    if (!productToUpdate) {
      console.error('Product not found at index:', displayIndex);
      return;
    }
    
    const actualAreaId = productToUpdate._areaId;
    const actualIndex = productToUpdate._productIndex;
    
    console.log('Updating discount:', { displayIndex, actualIndex, actualAreaId, percent });
    
    if (formData.rooms.length > 0 && viewingRoomId) {
      // Update product in specific area
      setFormData(prev => {
        const newState = {
          ...prev,
          rooms: prev.rooms.map(room => {
            if (room.id === viewingRoomId) {
              return {
                ...room,
                areas: room.areas.map(area => {
                  if (area.id === actualAreaId) {
                    const updated = [...area.products];
                    const product = updated[actualIndex];
                    if (product) {
                      product.discountPercent = percent;
                      const discountAmount = (product.unitPrice * percent) / 100;
                      product.discount = discountAmount;
                      const discountedPrice = product.unitPrice - discountAmount;
                      product.totalPrice = discountedPrice * product.quantity;
                      console.log('Updated product:', { 
                        name: product.productName, 
                        unitPrice: product.unitPrice, 
                        percent, 
                        discountedPrice, 
                        totalPrice: product.totalPrice 
                      });
                    }
                    return { ...area, products: updated };
                  }
                  return area;
                })
              };
            }
            return room;
          })
        };
        return newState;
      });
    } else {
      // Update product in general list
      setFormData(prev => {
        const updated = [...prev.selectedProducts];
        const product = updated[actualIndex];
        if (product) {
          product.discountPercent = percent;
          const discountAmount = (product.unitPrice * percent) / 100;
          product.discount = discountAmount;
          const discountedPrice = product.unitPrice - discountAmount;
          product.totalPrice = discountedPrice * product.quantity;
          console.log('Updated product (general):', { 
            name: product.productName, 
            unitPrice: product.unitPrice, 
            percent, 
            totalPrice: product.totalPrice 
          });
        }
        return { ...prev, selectedProducts: updated };
      });
    }
  };

  const removeProduct = (displayIndex) => {
    // Get the product from the display list to find its actual location
    const viewingRoom = formData.rooms.find(r => r.id === viewingRoomId);
    let currentProducts = [];
    
    if (formData.rooms.length > 0 && viewingRoom) {
      if (viewingAreaId === 'all') {
        viewingRoom.areas.forEach(area => {
          area.products.forEach((product, productIndex) => {
            currentProducts.push({
              ...product,
              _areaId: area.id,
              _productIndex: productIndex
            });
          });
        });
      } else {
        const viewingArea = viewingRoom.areas.find(a => a.id === viewingAreaId);
        if (viewingArea) {
          currentProducts = viewingArea.products.map((product, productIndex) => ({
            ...product,
            _areaId: viewingArea.id,
            _productIndex: productIndex
          }));
        }
      }
    } else {
      currentProducts = formData.selectedProducts.map((product, productIndex) => ({
        ...product,
        _productIndex: productIndex
      }));
    }
    
    const productToRemove = currentProducts[displayIndex];
    if (!productToRemove) {
      console.error('Product not found at index:', displayIndex);
      return;
    }
    
    const actualAreaId = productToRemove._areaId;
    const actualIndex = productToRemove._productIndex;
    
    if (formData.rooms.length > 0 && viewingRoomId) {
      // Remove product from specific area
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => {
          if (room.id === viewingRoomId) {
            return {
              ...room,
              areas: room.areas.map(area => {
                if (area.id === actualAreaId) {
                  return { ...area, products: area.products.filter((_, i) => i !== actualIndex) };
                }
                return area;
              })
            };
          }
          return room;
        })
      }));
    } else {
      // Remove product from general list
      setFormData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter((_, i) => i !== actualIndex)
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
    
    // Calculate GST breakdown (reverse calculation since MRP includes GST)
    const divisor = 100 + gstRate; // 118 for 18% GST
    const taxableAmount = (totalCost / divisor) * 100;
    const gstAmount = totalCost - taxableAmount;
    
    const remainingBudget = formData.hasBudget ? totalBudget - totalCost : null;
    return { 
      totalCost, 
      totalBudget, 
      remainingBudget,
      taxableAmount: taxableAmount,
      gstAmount: gstAmount
    };
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
        return;
      }
      
      // Create customer if new
      if (formData.isNewCustomer && !formData.customer) {
        try {
          const response = await fetch('https://dumy-2-mli2.onrender.com/api/contacts', {
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

      const response = await fetch('https://dumy-2-mli2.onrender.com/api/budget-plans', {
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
        onSuccess && onSuccess(result);
        onClose && onClose();
      } else {
        console.error('Server error:', result);
      }
    } catch (error) {
      console.error('Error saving budget plan:', error);
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

      const budgetResponse = await fetch('https://dumy-2-mli2.onrender.com/api/budget-plans', {
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

      const orderResponse = await fetch('https://dumy-2-mli2.onrender.com/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (orderResponse.ok) {
        onSuccess && onSuccess(orderResult);
        onClose && onClose();
      } else {
        throw new Error(orderResult.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error saving as order:', error);
    } finally {
      setSavingAs(null);
    }
  };

  const handleConvertToOrder = async () => {
    // This functionality has been removed
    // Budget plans should be converted to orders from the Budget Plans list
    // which opens the full order form with proper address collection
    console.log('Please save this as a Budget Plan first, then convert it to an order from the Budget Plans list.');
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
          <label>Project Location</label>
          <input
            type="text"
            value={formData.projectLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, projectLocation: e.target.value }))}
            placeholder="Project location (e.g., Ahmedabad, Gujarat)"
          />
        </div>

        <div className="form-group">
          <label>Attention (Contact Person)</label>
          <input
            type="text"
            value={formData.attention}
            onChange={(e) => setFormData(prev => ({ ...prev, attention: e.target.value }))}
            placeholder="Contact person name (e.g., Mr. Rajesh Kumar)"
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
    try {
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
      // Store products with metadata about their location for proper updating
      let currentProducts = [];
      if (formData.rooms.length > 0 && viewingRoom) {
        if (viewingAreaId === 'all') {
          // Show all products from all areas in this room
          // Add metadata to track which area each product belongs to
          viewingRoom.areas.forEach(area => {
            area.products.forEach((product, productIndex) => {
              currentProducts.push({
                ...product,
                _areaId: area.id,
                _productIndex: productIndex
              });
            });
          });
        } else {
          // Show products from specific area ONLY
          const viewingArea = viewingRoom.areas.find(a => a.id === viewingAreaId);
          if (viewingArea) {
            currentProducts = viewingArea.products.map((product, productIndex) => ({
              ...product,
              _areaId: viewingArea.id,
              _productIndex: productIndex
            }));
          } else {
            currentProducts = [];
          }
        }
      } else {
        currentProducts = formData.selectedProducts.map((product, productIndex) => ({
          ...product,
          _productIndex: productIndex
        }));
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
                          src={product.images[0].startsWith('http') ? product.images[0] : `${product.images[0].startsWith('http') ? product.images[0] : 'https://dumy-2-mli2.onrender.com' + product.images[0]}`} 
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
                          <span className="price">₹{product.price.toLocaleString()}</span>
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
                              step="0.1"
                              value={item.discountPercent || 0}
                              onChange={(e) => updateProductDiscount(index, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        
                        <div className="product-pricing">
                          <div className="unit-price-container">
                            <span className="unit-price-discounted">
                              ₹{(item.unitPrice * (1 - item.discountPercent / 100)).toLocaleString()} each
                            </span>
                          </div>
                          <span className="total-price-large">₹{(item.totalPrice || 0).toLocaleString()}</span>
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
    } catch (error) {
      console.error('Error rendering Step 2:', error);
      return (
        <div className="form-step product-selection-step">
          <div className="error-message">
            <h3>Error Loading Products</h3>
            <p>There was an error loading the product selection page.</p>
            <p style={{ color: '#666', fontSize: '14px' }}>{error.message}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
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
                      placeholder={`Enter custom ${selectedTemplate?.name?.toLowerCase() || 'room'} name`}
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
          
          {/* Column Format Selector */}
          <div style={{ 
            padding: '15px 20px', 
            background: '#f8f9fa', 
            borderBottom: '2px solid #e0e0e0',
            display: 'flex',
            gap: '15px',
            alignItems: 'center'
          }}>
            <strong style={{ color: '#333', fontSize: '14px' }}>Select Column Format:</strong>
            
            <select
              value={columnFormat}
              onChange={(e) => setColumnFormat(e.target.value)}
              style={{
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                background: 'white',
                border: '2px solid #2563eb',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '400px',
                transition: 'all 0.2s'
              }}
            >
              <option value="format1">Format 1: MRP + YOUR PRICE</option>
              <option value="format2">Format 2: MRP + DISCOUNT%</option>
              <option value="format3">Format 3: MRP + DISC% + FINAL PRICE</option>
              <option value="format4">Format 4: MRP (with GST breakdown in subtotal)</option>
              <option value="format5">Format 5: MRP + YOUR PRICE (with GST breakdown)</option>
              <option value="format6">Format 6: COMPLETE (MRP + DISC% + YOUR PRICE + GST breakdown)</option>
              <option value="format7">Format 7: NAME + DETAILS ONLY (no images)</option>
            </select>
          </div>
          
          <div className="preview-content preview-quotation-content">
            {/* PDF-Style Header */}
            <div className="preview-pdf-header">
              <div className="preview-pdf-header-left">
                <h1>TILES | CP FITTING | SANITARY | BATHTUB</h1>
                <p>104-105-106, Iscon Plaza, Opp. Star India Bazar,</p>
                <p>Satellite Road, Ahmedabad - 380 015</p>
                <p>Phone: 92272 06063 | Email: gtts47@gmail.com</p>
                <p className="helpline">Helpline: 079-2692 0609 / 4006 6063</p>
              </div>
              <div className="preview-pdf-header-right">
                <img src="/gtss-logo.png" alt="GTSS Logo" className="preview-pdf-logo" />
                <h2>Gujarat Tube & Sanitary Stores</h2>
              </div>
            </div>

            {/* Quotation Title */}
            <div className="preview-quotation-title">
              <h3>QUOTATION</h3>
            </div>

            {/* Client Information Box */}
            <div className="preview-client-box">
              <div className="preview-client-left">
                <h4>TO: {formData.customerName}</h4>
                <p>Address: {formData.customerAddress || '-'}</p>
                <p>Email: {formData.customerEmail || '-'}</p>
                <p>Phone Number: {formData.customerPhone || '-'}</p>
                <p>GST Number: {formData.customerGST || '-'}</p>
              </div>
              <div className="preview-client-right">
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                <p><strong>Rf No.:</strong> QT-{Date.now()}</p>
                <p><strong>Atten:</strong> {formData.attention || '-'}</p>
              </div>
            </div>

            {/* Products Summary - Table Format like PDF */}
            {formData.rooms.length > 0 ? (
              <div className="preview-rooms-summary">
                {formData.rooms.map(room => {
                  // Flatten products from all areas with serial numbers
                  let allRoomProducts = [];
                  let serialNumber = 1;
                  
                  room.areas.forEach(area => {
                    area.products.forEach(product => {
                      allRoomProducts.push({
                        ...product,
                        areaId: area.id,
                        areaName: area.name,
                        roomId: room.id,
                        serialNumber: serialNumber++
                      });
                    });
                  });
                  
                  const roomTotal = allRoomProducts.reduce((sum, product) => {
                    const productKey = `${product.roomId}-${product.areaId}-${product.productName}-${product.variant}`;
                    return sum + getProductPrice(productKey, product.totalPrice);
                  }, 0);
                  
                  return (
                    <div key={room.id} className="preview-room-section">
                      <div className="preview-room-title-bar">
                        <h4>{room.name.toUpperCase()}</h4>
                        <span className="preview-room-total-badge">₹{roomTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      {/* PDF-Style Table */}
                      <table className="preview-products-table">
                        <thead>
                          <tr>
                            <th style={{ width: '4%' }}>SR</th>
                            <th style={{ width: '12%' }}>AREA</th>
                            {columnFormat !== 'format7' && <th style={{ width: '10%' }}>IMAGE</th>}
                            <th style={{ width: columnFormat === 'format6' ? '24%' : columnFormat === 'format7' ? '42%' : '32%' }}>ITEM</th>
                            <th style={{ width: '6%' }}>QTY</th>
                            <th style={{ width: '13%' }}>MRP</th>
                            {columnFormat === 'format1' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                            {columnFormat === 'format2' && <th style={{ width: '10%' }}>DISCOUNT</th>}
                            {columnFormat === 'format3' && <><th style={{ width: '8%' }}>DISC%</th><th style={{ width: '10%' }}>FINAL PRICE</th></>}
                            {columnFormat === 'format4' && null /* MRP only, GST in subtotal */}
                            {columnFormat === 'format5' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                            {columnFormat === 'format6' && <><th style={{ width: '8%' }}>DISC%</th><th style={{ width: '10%' }}>YOUR PRICE</th></>}
                            {columnFormat === 'format7' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                            <th style={{ width: '13%' }}>TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allRoomProducts.map((product, idx) => {
                            const productKey = `${product.roomId}-${product.areaId}-${product.productName}-${product.variant}`;
                            const currentPrice = getProductPrice(productKey, product.totalPrice);
                            const unitPrice = product.unitPrice || 0;
                            const discountPercent = product.discountPercent || 0;
                            const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
                            const finalTotal = discountedUnitPrice * product.quantity;
                            
                            // Check if this is the first product in this area
                            const isFirstInArea = idx === 0 || allRoomProducts[idx - 1].areaId !== product.areaId;
                            
                            // Count how many products are in this area
                            let areaProductCount = 0;
                            if (isFirstInArea) {
                              areaProductCount = allRoomProducts.filter(p => p.areaId === product.areaId).length;
                            }
                            
                            return (
                              <tr key={idx}>
                                <td className="text-center">{product.serialNumber}</td>
                                {isFirstInArea && (
                                  <td className="text-center" rowSpan={areaProductCount} style={{ verticalAlign: 'middle' }}>
                                    {product.areaName}
                                  </td>
                                )}
                                {columnFormat !== 'format7' && (
                                  <td className="text-center">
                                    {(() => {
                                      // Get the first image from images array
                                      const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
                                      
                                      // Skip placeholder images entirely
                                      const isPlaceholder = !productImage || 
                                                          productImage.includes('placeholder.com') || 
                                                          productImage.includes('via.placeholder') ||
                                                          productImage.trim() === '';
                                      
                                      if (isPlaceholder) {
                                        return <div className="preview-no-image">No Image</div>;
                                      }
                                      
                                      const imageUrl = productImage.startsWith('http') 
                                        ? productImage 
                                        : `${productImage.startsWith('http') ? productImage : 'https://dumy-2-mli2.onrender.com' + productImage}`;
                                      
                                      return (
                                        <>
                                          <img 
                                            src={imageUrl}
                                            alt={product.productName}
                                            className="preview-product-image"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              const noImageDiv = e.target.nextElementSibling;
                                              if (noImageDiv) noImageDiv.style.display = 'flex';
                                            }}
                                          />
                                          <div className="preview-no-image" style={{ display: 'none' }}>No Image</div>
                                        </>
                                      );
                                    })()}
                                  </td>
                                )}
                                <td className="text-left">
                                  <div className="preview-item-name">{product.productName}</div>
                                  {product.companyName && (
                                    <div className="preview-item-variant" style={{ color: '#2563eb' }}>
                                      <span>{product.companyName}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="text-center">{product.quantity}</td>
                                <td className="text-left">Rs. {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                {columnFormat === 'format1' && (
                                  <td className="text-left">
                                    {isEditMode ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>Rs.</span>
                                        <input
                                          type="number"
                                          value={discountedUnitPrice.toFixed(2)}
                                          onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                            
                                            // Update the product discount in formData
                                            setFormData(prev => ({
                                              ...prev,
                                              rooms: prev.rooms.map(room => {
                                                if (room.id === product.roomId) {
                                                  return {
                                                    ...room,
                                                    areas: room.areas.map(area => {
                                                      if (area.id === product.areaId) {
                                                        return {
                                                          ...area,
                                                          products: area.products.map(p => {
                                                            if (p.productName === product.productName && p.variant === product.variant) {
                                                              return {
                                                                ...p,
                                                                discountPercent: newDiscount,
                                                                totalPrice: newPrice * p.quantity
                                                              };
                                                            }
                                                            return p;
                                                          })
                                                        };
                                                      }
                                                      return area;
                                                    })
                                                  };
                                                }
                                                return room;
                                              })
                                            }));
                                          }}
                                          className="price-edit-input-table"
                                          min="0"
                                          step="0.01"
                                          style={{ 
                                            width: '100px', 
                                            textAlign: 'right',
                                            border: '2px solid #3b82f6',
                                            backgroundColor: '#fff'
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                  </td>
                                )}
                                {columnFormat === 'format2' && (
                                  <td className="text-center">
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                      <input
                                        type="number"
                                        value={discountPercent}
                                        disabled={!isEditMode}
                                        onChange={(e) => {
                                          const newDiscount = parseFloat(e.target.value) || 0;
                                          
                                          // Update the product discount in formData
                                          setFormData(prev => ({
                                            ...prev,
                                            rooms: prev.rooms.map(room => {
                                              if (room.id === product.roomId) {
                                                return {
                                                  ...room,
                                                  areas: room.areas.map(area => {
                                                    if (area.id === product.areaId) {
                                                      return {
                                                        ...area,
                                                        products: area.products.map(p => {
                                                          if (p.productName === product.productName && p.variant === product.variant) {
                                                            const unitPrice = p.unitPrice || 0;
                                                            const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                                            const newTotalPrice = discountedPrice * p.quantity;
                                                            
                                                            // Also update editedPrices to reflect the change
                                                            const productKey = `${product.roomId}-${product.areaId}-${p.productName}-${p.variant}`;
                                                            setEditedPrices(prevEdited => ({
                                                              ...prevEdited,
                                                              [productKey]: newTotalPrice
                                                            }));
                                                            
                                                            return {
                                                              ...p,
                                                              discountPercent: newDiscount,
                                                              totalPrice: newTotalPrice
                                                            };
                                                          }
                                                          return p;
                                                        })
                                                      };
                                                    }
                                                    return area;
                                                  })
                                                };
                                              }
                                              return room;
                                            })
                                          }));
                                        }}
                                        className="price-edit-input-table"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        style={{ 
                                          width: '70px', 
                                          textAlign: 'center', 
                                          paddingRight: '20px',
                                          backgroundColor: isEditMode ? '#fff !important' : '#f3f4f6 !important',
                                          cursor: isEditMode ? 'text !important' : 'not-allowed !important',
                                          opacity: isEditMode ? '1' : '0.6',
                                          border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                        }}
                                      />
                                      <span style={{ 
                                        position: 'absolute', 
                                        right: '8px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        fontSize: '12px',
                                        pointerEvents: 'none',
                                        color: '#666'
                                      }}>%</span>
                                    </div>
                                  </td>
                                )}
                                {columnFormat === 'format3' && (
                                  <>
                                    <td className="text-center">
                                      <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <input
                                          type="number"
                                          value={discountPercent}
                                          disabled={!isEditMode}
                                          onChange={(e) => {
                                            const newDiscount = parseFloat(e.target.value) || 0;
                                            setFormData(prev => ({
                                              ...prev,
                                              rooms: prev.rooms.map(room => {
                                                if (room.id === product.roomId) {
                                                  return {
                                                    ...room,
                                                    areas: room.areas.map(area => {
                                                      if (area.id === product.areaId) {
                                                        return {
                                                          ...area,
                                                          products: area.products.map(p => {
                                                            if (p.productName === product.productName && p.variant === product.variant) {
                                                              const unitPrice = p.unitPrice || 0;
                                                              const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                                              const newTotalPrice = discountedPrice * p.quantity;
                                                              
                                                              // Also update editedPrices
                                                              const productKey = `${product.roomId}-${product.areaId}-${p.productName}-${p.variant}`;
                                                              setEditedPrices(prevEdited => ({
                                                                ...prevEdited,
                                                                [productKey]: newTotalPrice
                                                              }));
                                                              
                                                              return {
                                                                ...p,
                                                                discountPercent: newDiscount,
                                                                totalPrice: newTotalPrice
                                                              };
                                                            }
                                                            return p;
                                                          })
                                                        };
                                                      }
                                                      return area;
                                                    })
                                                  };
                                                }
                                                return room;
                                              })
                                            }));
                                          }}
                                          className="price-edit-input-table"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          style={{ 
                                            width: '60px', 
                                            textAlign: 'center',
                                            backgroundColor: isEditMode ? '#fff' : '#f3f4f6',
                                            cursor: isEditMode ? 'text' : 'not-allowed',
                                            opacity: isEditMode ? '1' : '0.6',
                                            border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                          }}
                                        />
                                        <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', pointerEvents: 'none', color: '#666' }}>%</span>
                                      </div>
                                    </td>
                                    <td className="text-left">
                                      Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </>
                                )}
                                {columnFormat === 'format4' && null /* MRP only, GST in subtotal */}
                                {columnFormat === 'format5' && (
                                  <td className="text-left">
                                    {isEditMode ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>Rs.</span>
                                        <input
                                          type="number"
                                          value={discountedUnitPrice.toFixed(2)}
                                          onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                            setFormData(prev => ({
                                              ...prev,
                                              rooms: prev.rooms.map(room => {
                                                if (room.id === product.roomId) {
                                                  return {
                                                    ...room,
                                                    areas: room.areas.map(area => {
                                                      if (area.id === product.areaId) {
                                                        return {
                                                          ...area,
                                                          products: area.products.map(p => {
                                                            if (p.productName === product.productName && p.variant === product.variant) {
                                                              return {
                                                                ...p,
                                                                discountPercent: newDiscount,
                                                                totalPrice: newPrice * p.quantity
                                                              };
                                                            }
                                                            return p;
                                                          })
                                                        };
                                                      }
                                                      return area;
                                                    })
                                                  };
                                                }
                                                return room;
                                              })
                                            }));
                                          }}
                                          className="price-edit-input-table"
                                          min="0"
                                          step="0.01"
                                          style={{ 
                                            width: '100px', 
                                            textAlign: 'right',
                                            border: '2px solid #3b82f6',
                                            backgroundColor: '#fff'
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                  </td>
                                )}
                                {columnFormat === 'format6' && (
                                  <>
                                    <td className="text-center">
                                      <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <input
                                          type="number"
                                          value={discountPercent}
                                          disabled={!isEditMode}
                                          onChange={(e) => {
                                            const newDiscount = parseFloat(e.target.value) || 0;
                                            setFormData(prev => ({
                                              ...prev,
                                              rooms: prev.rooms.map(room => {
                                                if (room.id === product.roomId) {
                                                  return {
                                                    ...room,
                                                    areas: room.areas.map(area => {
                                                      if (area.id === product.areaId) {
                                                        return {
                                                          ...area,
                                                          products: area.products.map(p => {
                                                            if (p.productName === product.productName && p.variant === product.variant) {
                                                              const unitPrice = p.unitPrice || 0;
                                                              const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                                              const newTotalPrice = discountedPrice * p.quantity;
                                                              
                                                              // Also update editedPrices
                                                              const productKey = `${product.roomId}-${product.areaId}-${p.productName}-${p.variant}`;
                                                              setEditedPrices(prevEdited => ({
                                                                ...prevEdited,
                                                                [productKey]: newTotalPrice
                                                              }));
                                                              
                                                              return {
                                                                ...p,
                                                                discountPercent: newDiscount,
                                                                totalPrice: newTotalPrice
                                                              };
                                                            }
                                                            return p;
                                                          })
                                                        };
                                                      }
                                                      return area;
                                                    })
                                                  };
                                                }
                                                return room;
                                              })
                                            }));
                                          }}
                                          className="price-edit-input-table"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          style={{ 
                                            width: '60px', 
                                            textAlign: 'center',
                                            backgroundColor: isEditMode ? '#fff' : '#f3f4f6',
                                            cursor: isEditMode ? 'text' : 'not-allowed',
                                            opacity: isEditMode ? '1' : '0.6',
                                            border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                          }}
                                        />
                                        <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', pointerEvents: 'none', color: '#666' }}>%</span>
                                      </div>
                                    </td>
                                    <td className="text-left">
                                      Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                  </>
                                )}
                                {columnFormat === 'format7' && (
                                  <td className="text-left">
                                    {isEditMode ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>Rs.</span>
                                        <input
                                          type="number"
                                          value={discountedUnitPrice.toFixed(2)}
                                          onChange={(e) => {
                                            const newPrice = parseFloat(e.target.value) || 0;
                                            const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                            setFormData(prev => ({
                                              ...prev,
                                              rooms: prev.rooms.map(room => {
                                                if (room.id === product.roomId) {
                                                  return {
                                                    ...room,
                                                    areas: room.areas.map(area => {
                                                      if (area.id === product.areaId) {
                                                        return {
                                                          ...area,
                                                          products: area.products.map(p => {
                                                            if (p.productName === product.productName && p.variant === product.variant) {
                                                              return {
                                                                ...p,
                                                                discountPercent: newDiscount,
                                                                totalPrice: newPrice * p.quantity
                                                              };
                                                            }
                                                            return p;
                                                          })
                                                        };
                                                      }
                                                      return area;
                                                    })
                                                  };
                                                }
                                                return room;
                                              })
                                            }));
                                          }}
                                          className="price-edit-input-table"
                                          min="0"
                                          step="0.01"
                                          style={{ 
                                            width: '100px', 
                                            textAlign: 'right',
                                            border: '2px solid #3b82f6',
                                            backgroundColor: '#fff'
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                  </td>
                                )}
                                <td className="text-right">
                                  <span className={editedPrices[productKey] !== undefined ? 'edited-price' : ''}>
                                    Rs. {finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {/* Subtotal Row */}
                          <tr className="subtotal-row">
                            <td colSpan={
                              columnFormat === 'format1' ? 6 : 
                              columnFormat === 'format2' ? 6 : 
                              columnFormat === 'format3' ? 7 :
                              columnFormat === 'format4' ? 5 :
                              columnFormat === 'format5' ? 6 :
                              columnFormat === 'format6' ? 7 :
                              columnFormat === 'format7' ? 5 : 6
                            } className="text-right"></td>
                            <td className="text-right"><strong>SUBTOTAL:</strong></td>
                            <td className="text-right"><strong>Rs. {roomTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                          </tr>
                          
                          {/* GST Breakdown Rows for formats 4, 5, 6 */}
                          {(columnFormat === 'format4' || columnFormat === 'format5' || columnFormat === 'format6') && (() => {
                            const divisor = 100 + gstRate;
                            const taxableAmount = (roomTotal / divisor) * 100;
                            const gstAmount = roomTotal - taxableAmount;
                            
                            return (
                              <>
                                <tr className="gst-breakdown-row">
                                  <td colSpan={
                                    columnFormat === 'format4' ? 5 :
                                    columnFormat === 'format5' ? 6 :
                                    columnFormat === 'format6' ? 7 :
                                    6
                                  } className="text-right"></td>
                                  <td className="text-right"><strong>Taxable Amount:</strong></td>
                                  <td className="text-right"><strong>Rs. {taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                                </tr>
                                <tr className="gst-breakdown-row">
                                  <td colSpan={
                                    columnFormat === 'format4' ? 5 :
                                    columnFormat === 'format5' ? 6 :
                                    columnFormat === 'format6' ? 7 :
                                    6
                                  } className="text-right"></td>
                                  <td className="text-right"><strong>GST @{gstRate}%:</strong></td>
                                  <td className="text-right"><strong>Rs. {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="preview-room-section">
                <table className="preview-products-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%' }}>SR</th>
                      {columnFormat !== 'format7' && <th style={{ width: '10%' }}>IMAGE</th>}
                      <th style={{ width: columnFormat === 'format7' ? '54%' : '44%' }}>ITEM</th>
                      <th style={{ width: '6%' }}>QTY</th>
                      <th style={{ width: '13%' }}>MRP</th>
                      {columnFormat === 'format1' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                      {columnFormat === 'format2' && <th style={{ width: '10%' }}>DISCOUNT</th>}
                      {columnFormat === 'format3' && <><th style={{ width: '8%' }}>DISC%</th><th style={{ width: '10%' }}>FINAL PRICE</th></>}
                      {columnFormat === 'format4' && null}
                      {columnFormat === 'format5' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                      {columnFormat === 'format6' && <><th style={{ width: '8%' }}>DISC%</th><th style={{ width: '10%' }}>YOUR PRICE</th></>}
                      {columnFormat === 'format7' && <th style={{ width: '10%' }}>YOUR PRICE</th>}
                      <th style={{ width: '13%' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.selectedProducts.map((product, idx) => {
                      const productKey = `general-${product.productName}-${product.variant}`;
                      const currentPrice = getProductPrice(productKey, product.totalPrice);
                      const unitPrice = product.unitPrice || 0;
                      const discountPercent = product.discountPercent || 0;
                      const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
                      const finalTotal = discountedUnitPrice * product.quantity;
                      
                      return (
                        <tr key={idx}>
                          <td className="text-center">{idx + 1}</td>
                          {columnFormat !== 'format7' && (
                            <td className="text-center">
                              {(() => {
                                // Get the first image from images array
                                const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
                                
                                // Skip placeholder images entirely
                                const isPlaceholder = !productImage || 
                                                    productImage.includes('placeholder.com') || 
                                                    productImage.includes('via.placeholder') ||
                                                    productImage.trim() === '';
                                
                                if (isPlaceholder) {
                                  return <div className="preview-no-image">No Image</div>;
                                }
                                
                                const imageUrl = productImage.startsWith('http') 
                                  ? productImage 
                                  : `${productImage.startsWith('http') ? productImage : 'https://dumy-2-mli2.onrender.com' + productImage}`;
                                
                                return (
                                  <>
                                    <img 
                                      src={imageUrl}
                                      alt={product.productName}
                                      className="preview-product-image"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        const noImageDiv = e.target.nextElementSibling;
                                        if (noImageDiv) noImageDiv.style.display = 'flex';
                                      }}
                                    />
                                    <div className="preview-no-image" style={{ display: 'none' }}>No Image</div>
                                  </>
                                );
                              })()}
                            </td>
                          )}
                          <td className="text-left">
                            <div className="preview-item-name">{product.productName}</div>
                            {product.companyName && (
                              <div className="preview-item-variant" style={{ color: '#2563eb' }}>
                                <span>{product.companyName}</span>
                              </div>
                            )}
                          </td>
                          <td className="text-center">{product.quantity}</td>
                          <td className="text-left">Rs. {unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          {columnFormat === 'format1' && (
                            <td className="text-left">
                              {isEditMode ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span>Rs.</span>
                                  <input
                                    type="number"
                                    value={discountedUnitPrice.toFixed(2)}
                                    onChange={(e) => {
                                      const newPrice = parseFloat(e.target.value) || 0;
                                      const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                      
                                      // Update the product discount in formData
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedProducts: prev.selectedProducts.map((p, i) => {
                                          if (i === idx) {
                                            return {
                                              ...p,
                                              discountPercent: newDiscount,
                                              totalPrice: newPrice * p.quantity
                                            };
                                          }
                                          return p;
                                        })
                                      }));
                                    }}
                                    className="price-edit-input-table"
                                    min="0"
                                    step="0.01"
                                    style={{ 
                                      width: '100px', 
                                      textAlign: 'right',
                                      border: '2px solid #3b82f6',
                                      backgroundColor: '#fff'
                                    }}
                                  />
                                </div>
                              ) : (
                                <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              )}
                            </td>
                          )}
                          {columnFormat === 'format2' && (
                            <td className="text-center">
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <input
                                  type="number"
                                  value={discountPercent}
                                  disabled={!isEditMode}
                                  onChange={(e) => {
                                    const newDiscount = parseFloat(e.target.value) || 0;
                                    
                                    // Update the product discount in formData
                                    setFormData(prev => ({
                                      ...prev,
                                      selectedProducts: prev.selectedProducts.map((p, i) => {
                                        if (i === idx) {
                                          const unitPrice = p.unitPrice || 0;
                                          const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                          return {
                                            ...p,
                                            discountPercent: newDiscount,
                                            totalPrice: discountedPrice * p.quantity
                                          };
                                        }
                                        return p;
                                      })
                                    }));
                                  }}
                                  className="price-edit-input-table"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  style={{ 
                                    width: '70px', 
                                    textAlign: 'center', 
                                    paddingRight: '20px',
                                    backgroundColor: isEditMode ? '#fff !important' : '#f3f4f6 !important',
                                    cursor: isEditMode ? 'text !important' : 'not-allowed !important',
                                    opacity: isEditMode ? '1' : '0.6',
                                    border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                  }}
                                />
                                <span style={{ 
                                  position: 'absolute', 
                                  right: '8px', 
                                  top: '50%', 
                                  transform: 'translateY(-50%)',
                                  fontSize: '12px',
                                  pointerEvents: 'none',
                                  color: '#666'
                                }}>%</span>
                              </div>
                            </td>
                          )}
                          {columnFormat === 'format3' && (
                            <>
                              <td className="text-center">
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <input
                                    type="number"
                                    value={discountPercent}
                                    disabled={!isEditMode}
                                    onChange={(e) => {
                                      const newDiscount = parseFloat(e.target.value) || 0;
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedProducts: prev.selectedProducts.map((p, i) => {
                                          if (i === idx) {
                                            const unitPrice = p.unitPrice || 0;
                                            const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                            return {
                                              ...p,
                                              discountPercent: newDiscount,
                                              totalPrice: discountedPrice * p.quantity
                                            };
                                          }
                                          return p;
                                        })
                                      }));
                                    }}
                                    className="price-edit-input-table"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    style={{ 
                                      width: '60px', 
                                      textAlign: 'center',
                                      backgroundColor: isEditMode ? '#fff' : '#f3f4f6',
                                      cursor: isEditMode ? 'text' : 'not-allowed',
                                      opacity: isEditMode ? '1' : '0.6',
                                      border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                    }}
                                  />
                                  <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', pointerEvents: 'none', color: '#666' }}>%</span>
                                </div>
                              </td>
                              <td className="text-left">
                                Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </>
                          )}
                          {columnFormat === 'format4' && null}
                          {columnFormat === 'format5' && (
                            <td className="text-left">
                              {isEditMode ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span>Rs.</span>
                                  <input
                                    type="number"
                                    value={discountedUnitPrice.toFixed(2)}
                                    onChange={(e) => {
                                      const newPrice = parseFloat(e.target.value) || 0;
                                      const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedProducts: prev.selectedProducts.map((p, i) => {
                                          if (i === idx) {
                                            return {
                                              ...p,
                                              discountPercent: newDiscount,
                                              totalPrice: newPrice * p.quantity
                                            };
                                          }
                                          return p;
                                        })
                                      }));
                                    }}
                                    className="price-edit-input-table"
                                    min="0"
                                    step="0.01"
                                    style={{ 
                                      width: '100px', 
                                      textAlign: 'right',
                                      border: '2px solid #3b82f6',
                                      backgroundColor: '#fff'
                                    }}
                                  />
                                </div>
                              ) : (
                                <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              )}
                            </td>
                          )}
                          {columnFormat === 'format6' && (
                            <>
                              <td className="text-center">
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <input
                                    type="number"
                                    value={discountPercent}
                                    disabled={!isEditMode}
                                    onChange={(e) => {
                                      const newDiscount = parseFloat(e.target.value) || 0;
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedProducts: prev.selectedProducts.map((p, i) => {
                                          if (i === idx) {
                                            const unitPrice = p.unitPrice || 0;
                                            const discountedPrice = unitPrice * (1 - newDiscount / 100);
                                            return {
                                              ...p,
                                              discountPercent: newDiscount,
                                              totalPrice: discountedPrice * p.quantity
                                            };
                                          }
                                          return p;
                                        })
                                      }));
                                    }}
                                    className="price-edit-input-table"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    style={{ 
                                      width: '60px', 
                                      textAlign: 'center',
                                      backgroundColor: isEditMode ? '#fff' : '#f3f4f6',
                                      cursor: isEditMode ? 'text' : 'not-allowed',
                                      opacity: isEditMode ? '1' : '0.6',
                                      border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db'
                                    }}
                                  />
                                  <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', pointerEvents: 'none', color: '#666' }}>%</span>
                                </div>
                              </td>
                              <td className="text-left">
                                Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </>
                          )}
                          {columnFormat === 'format7' && (
                            <td className="text-left">
                              {isEditMode ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span>Rs.</span>
                                  <input
                                    type="number"
                                    value={discountedUnitPrice.toFixed(2)}
                                    onChange={(e) => {
                                      const newPrice = parseFloat(e.target.value) || 0;
                                      const newDiscount = ((unitPrice - newPrice) / unitPrice) * 100;
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedProducts: prev.selectedProducts.map((p, i) => {
                                          if (i === idx) {
                                            return {
                                              ...p,
                                              discountPercent: newDiscount,
                                              totalPrice: newPrice * p.quantity
                                            };
                                          }
                                          return p;
                                        })
                                      }));
                                    }}
                                    className="price-edit-input-table"
                                    min="0"
                                    step="0.01"
                                    style={{ 
                                      width: '100px', 
                                      textAlign: 'right',
                                      border: '2px solid #3b82f6',
                                      backgroundColor: '#fff'
                                    }}
                                  />
                                </div>
                              ) : (
                                <span>Rs. {discountedUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              )}
                            </td>
                          )}
                          <td className="text-right">
                            <span className={editedPrices[productKey] !== undefined ? 'edited-price' : ''}>
                              Rs. {finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* GST Breakdown for formats 4, 5, 6 - SHOWN FIRST */}
            {(columnFormat === 'format4' || columnFormat === 'format5' || columnFormat === 'format6') && (() => {
              const totals = calculateTotals();
              return (
                <div className="preview-gst-breakdown" style={{ 
                  marginTop: '15px', 
                  padding: '15px 20px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span><strong>Taxable Amount:</strong></span>
                    <span><strong>₹{totals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span><strong>GST @{gstRate}%:</strong></span>
                    <span><strong>₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                  </div>
                </div>
              );
            })()}

            {/* Grand Total - SHOWN BELOW GST BREAKDOWN */}
            <div className="preview-grand-total" style={{ marginTop: '15px' }}>
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
                  
                  // Apply edited prices to rooms data or selected products
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
                  
                  // Apply edited prices to general products (no rooms)
                  const selectedProductsWithEditedPrices = formData.selectedProducts.map(product => {
                    const productKey = `general-${product.productName}-${product.variant}`;
                    const editedPrice = editedPrices[productKey];
                    return {
                      ...product,
                      totalPrice: editedPrice !== undefined ? editedPrice : product.totalPrice,
                      rate: product.unitPrice,
                      quantity: product.quantity,
                      discountPercent: product.discountPercent || 0
                    };
                  });
                  
                  // Prepare quotation data for PDF
                  const quotationData = {
                    quotationNumber: `QT-${Date.now()}`,
                    quotationDate: new Date().toISOString(),
                    clientData: {
                      clientName: formData.customerName,
                      companyName: formData.customerName,
                      mobileNumber: formData.customerPhone,
                      email: formData.customerEmail,
                      address: formData.customerAddress,
                      gstNumber: formData.customerGST,
                      projectLocation: formData.projectLocation,
                      attention: formData.attention
                    },
                    rooms: roomsWithEditedPrices,
                    items: selectedProductsWithEditedPrices, // Add items for no-room scenario
                    total: calculateTotals().totalCost,
                    columnFormat: columnFormat, // Pass column format to PDF generator
                    gstRate: gstRate, // Pass GST rate to PDF generator
                    attendedByStaffId: staffId,
                    attendedByName: staffName,
                    attendedByPhone: staffPhone,
                    columnFormat: columnFormat // Pass column format to PDF generator
                  };
                  
                  await QuotationPDFGenerator(quotationData, { separateByRoom: false });
                  // PDF generated successfully - no alert needed
                } catch (error) {
                  console.error('Error generating PDF:', error);
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
                    
                    // Apply edited prices to general products (no rooms)
                    const selectedProductsWithEditedPrices = formData.selectedProducts.map(product => {
                      const productKey = `general-${product.productName}-${product.variant}`;
                      const editedPrice = editedPrices[productKey];
                      return {
                        ...product,
                        totalPrice: editedPrice !== undefined ? editedPrice : product.totalPrice,
                        rate: product.unitPrice,
                        quantity: product.quantity,
                        discountPercent: product.discountPercent || 0
                      };
                    });
                    
                    // Prepare quotation data for PDF
                    const quotationData = {
                      quotationNumber: `QT-${Date.now()}`,
                      quotationDate: new Date().toISOString(),
                      clientData: {
                        clientName: formData.customerName,
                        companyName: formData.customerName,
                        mobileNumber: formData.customerPhone,
                        email: formData.customerEmail,
                        address: formData.customerAddress,
                        gstNumber: formData.customerGST,
                        projectLocation: formData.projectLocation,
                        attention: formData.attention
                      },
                      rooms: roomsWithEditedPrices,
                      items: selectedProductsWithEditedPrices, // Add items for no-room scenario
                      total: calculateTotals().totalCost,
                      columnFormat: columnFormat, // Pass column format to PDF generator
                      gstRate: gstRate, // Pass GST rate to PDF generator
                      attendedByStaffId: staffId,
                      attendedByName: staffName,
                      attendedByPhone: staffPhone
                    };
                    
                    await QuotationPDFGenerator(quotationData, { separateByRoom: true });
                    // PDFs generated successfully - no alert needed
                  } catch (error) {
                    console.error('Error generating PDFs:', error);
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
            <button 
              onClick={async () => {
                setGenerating(true);
                try {
                  // Prepare data for images PDF
                  let pdfData = {
                    quotationNumber: `QT-${Date.now()}`,
                    customerName: formData.customerName
                  };
                  
                  if (formData.rooms.length > 0) {
                    // Pass rooms structure for organized PDF (by bathroom and area)
                    pdfData.rooms = formData.rooms.map(room => ({
                      name: room.name,
                      areas: room.areas.map(area => ({
                        name: area.name,
                        products: area.products.map(product => ({
                          productName: product.productName,
                          name: product.productName,
                          variant: product.variant,
                          companyName: product.companyName,
                          company: product.companyName,
                          images: product.images,
                          image: product.images && product.images.length > 0 ? product.images[0] : null
                        }))
                      })).filter(area => area.products.length > 0) // Only include areas with products
                    })).filter(room => room.areas.length > 0); // Only include rooms with products
                  } else {
                    // Fallback: flat products array
                    pdfData.products = formData.selectedProducts.map(product => ({
                      name: product.productName,
                      variant: product.variant,
                      company: product.companyName,
                      images: product.images,
                      image: product.images && product.images.length > 0 ? product.images[0] : product.image
                    }));
                  }
                  
                  // Generate images PDF
                  const { default: generateImagesPDF } = await import('./ImagesPDFGenerator');
                  await generateImagesPDF(pdfData);
                  
                } catch (error) {
                  console.error('Error generating images PDF:', error);
                } finally {
                  setGenerating(false);
                }
              }}
              className="btn-primary"
              disabled={generating}
              style={{ marginLeft: '10px', background: '#8b5cf6' }}
            >
              {generating ? 'Generating...' : '🖼️ Download Images PDF'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminBudgetPlanForm;
