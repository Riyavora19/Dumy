const mongoose = require('mongoose');

const defaultProductSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  companyName: { type: String, default: '' },
  images:      [{ type: String }],
  price:       { type: Number, default: 0 },
  quantity:    { type: Number, default: 1 },
  essential:   { type: Boolean, default: true },
  // Area assignment (set when admin picks area in preset UI)
  areaId:      { type: String, default: 'all' },
  areaName:    { type: String, default: '' },
  areaIcon:    { type: String, default: '' },
}, { _id: false });

const areaSchema = new mongoose.Schema({
  id:              { type: String, required: true },
  name:            { type: String, required: true },
  icon:            { type: String, default: '🏠' },
  defaultProducts: [defaultProductSchema]
}, { _id: false });

const budgetPlanPresetSchema = new mongoose.Schema({
  roomName:  { type: String, required: true, unique: true, trim: true },
  icon:      { type: String, default: '🏠' },
  isActive:  { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
  // Flat list of all products (with areaId on each) — primary source
  products:  [defaultProductSchema],
  // Areas array — derived grouping, kept for backward compat
  areas:     [areaSchema]
}, { timestamps: true });

module.exports = mongoose.model('BudgetPlanPreset', budgetPlanPresetSchema);
