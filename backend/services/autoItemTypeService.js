/**
 * Auto Item Type Assignment Service
 * 
 * Automatically assigns the correct ItemType to a product based on its
 * name, variant, category name, and other fields — so products appear
 * in the correct area of the Budget Planner without manual assignment.
 */

const ProductItemType = require('../models/ProductItemType');

// Keyword rules: each entry maps keywords → item type name
// Order matters — more specific rules first
const KEYWORD_RULES = [
  // ── TOILETS / WC ──────────────────────────────────────────────
  { keywords: ['smart toilet', 'intelligent toilet', 'electronic toilet'], itemType: 'Smart Toilet' },
  { keywords: ['one piece', 'one-piece', '1 piece', 'closet one'], itemType: 'One Piece Toilet' },
  { keywords: ['two piece', 'two-piece', '2 piece', 'closet two', 'flush tank', 'flush cistern'], itemType: 'Two Piece Toilet' },
  { keywords: ['wall hung toilet', 'wall hung wc', 'wall mount toilet', 'wall mounted toilet', 'concealed cistern', 'flush plate', 'in-wall', 'inwall'], itemType: 'Wall Hung Toilet' },
  { keywords: ['toilet seat', 'seat cover', 'wc seat', 'commode seat'], itemType: 'One Piece Toilet' },
  { keywords: ['toilet', 'wc', 'commode', 'closet', 'urinal spud', 'health faucet', 'bidet'], itemType: 'One Piece Toilet' },

  // ── SHOWERS ───────────────────────────────────────────────────
  { keywords: ['rain shower', 'overhead shower', 'ceiling shower', 'rain head'], itemType: 'Rain Shower' },
  { keywords: ['shower panel', 'shower column', 'shower tower', 'shower system'], itemType: 'Shower Panel' },
  { keywords: ['shower head', 'hand shower', 'hand held shower', 'shower set', 'shower arm', 'shower mixer', 'shower diverter', 'shower valve', 'sliding rail', 'slide rail', 'body jet', 'body spray', 'shower drain', 'shower tray', 'shower enclosure', 'shower cabin', 'shower door', 'shower screen', 'shower curtain', 'shower hose', 'shower bracket', 'shower holder'], itemType: 'Shower Head' },

  // ── BATHTUBS ──────────────────────────────────────────────────
  { keywords: ['jacuzzi', 'whirlpool', 'spa bath', 'hydro massage'], itemType: 'Jacuzzi' },
  { keywords: ['freestanding bath', 'freestanding tub', 'clawfoot'], itemType: 'Freestanding Bathtub' },
  { keywords: ['bathtub', 'bath tub', 'bath spout', 'bath mixer', 'bath filler', 'bath drain', 'overflow'], itemType: 'Freestanding Bathtub' },

  // ── BASINS ────────────────────────────────────────────────────
  { keywords: ['table top basin', 'table top wash', 'countertop basin', 'vessel sink', 'vessel basin'], itemType: 'Table Top Basin' },
  { keywords: ['wall hung basin', 'wall mount basin', 'wall mounted basin', 'wall hung wash'], itemType: 'Wall Hung Basin' },
  { keywords: ['pedestal basin', 'full pedestal', 'half pedestal', 'pedestal wash'], itemType: 'Pedestal Basin' },
  { keywords: ['wash basin', 'washbasin', 'basin', 'sink', 'lavatory'], itemType: 'Table Top Basin' },

  // ── FAUCETS / TAPS ────────────────────────────────────────────
  { keywords: ['sensor faucet', 'sensor tap', 'touchless', 'automatic tap', 'infrared tap'], itemType: 'Sensor Faucet' },
  { keywords: ['basin mixer', 'basin tap', 'basin faucet', 'pillar cock', 'pillar tap', 'mono bloc', 'monobloc', 'single lever', 'two hole', 'three hole', 'angle valve', 'stop cock', 'stopcock', 'ball valve', 'gate valve', 'check valve', 'waste coupling', 'bottle trap', 'p-trap', 'u-trap', 'drain', 'strainer', 'aerator', 'cartridge', 'o-ring', 'oring', 'washer', 'screw', 'nut', 'bolt', 'spring', 'clip', 'seal', 'gasket', 'fitting', 'connector', 'adapter', 'elbow', 'tee', 'reducer', 'coupling', 'nipple', 'flange', 'bracket', 'anchor', 'grab bar', 'towel bar', 'towel ring', 'towel rack', 'robe hook', 'soap dish', 'soap dispenser', 'toilet paper holder', 'paper holder', 'tumbler holder', 'toothbrush holder', 'accessories', 'accessory', 'aspirator', 'spud', 'combo pack', 'repair kit', 'spare', 'part'], itemType: 'Basin Faucet' },

  // ── MIRRORS ───────────────────────────────────────────────────
  { keywords: ['led mirror', 'backlit mirror', 'illuminated mirror', 'smart mirror', 'magic mirror'], itemType: 'LED Mirror' },
  { keywords: ['smart mirror'], itemType: 'Smart Mirror' },
  { keywords: ['mirror cabinet', 'mirror with cabinet', 'medicine cabinet'], itemType: 'Wall Cabinet' },
  { keywords: ['mirror'], itemType: 'LED Mirror' },

  // ── CABINETS ──────────────────────────────────────────────────
  { keywords: ['vanity cabinet', 'vanity unit', 'vanity with sink', 'bathroom vanity'], itemType: 'Vanity Cabinet' },
  { keywords: ['wall cabinet', 'wall unit', 'storage cabinet', 'bathroom cabinet'], itemType: 'Wall Cabinet' },

  // ── TILES ─────────────────────────────────────────────────────
  { keywords: ['floor tile', 'floor tiles', 'flooring', 'mosaic floor'], itemType: 'Floor Tiles' },
  { keywords: ['wall tile', 'wall tiles', 'ceramic tile', 'porcelain tile', 'vitrified', 'mosaic', 'tile', 'tiles'], itemType: 'Wall Tiles' },
];

// Cache: itemTypeName → ObjectId  (populated on first use)
let _itemTypeCache = null;

async function getItemTypeCache() {
  if (_itemTypeCache) return _itemTypeCache;
  const all = await ProductItemType.find({ isActive: true });
  _itemTypeCache = {};
  for (const it of all) {
    _itemTypeCache[it.name.toLowerCase().trim()] = it._id.toString();
  }
  return _itemTypeCache;
}

/**
 * Given a product's fields, return the best matching ItemType ObjectId.
 * Returns null if no match found.
 */
async function detectItemType(product) {
  const cache = await getItemTypeCache();

  // Build a combined search string from all relevant fields
  const searchText = [
    product.name || '',
    product.variant || '',
    product.itemTypeName || '',
    product.broadCategory || '',
    product.cat || '',
    product.subCat || '',
    product.description || '',
    // category name if populated
    (typeof product.category === 'object' && product.category?.name) ? product.category.name : '',
  ].join(' ').toLowerCase();

  // Walk rules in order — first match wins
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        const id = cache[rule.itemType.toLowerCase().trim()];
        if (id) return id;
      }
    }
  }

  return null;
}

/**
 * Invalidate the cache (call after creating new item types)
 */
function clearItemTypeCache() {
  _itemTypeCache = null;
}

module.exports = { detectItemType, clearItemTypeCache };
