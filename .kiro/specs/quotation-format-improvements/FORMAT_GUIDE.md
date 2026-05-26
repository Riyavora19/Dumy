# Quotation Format Visual Guide

Quick reference for all 6 quotation formats.

---

## Format 1: MRP + YOUR PRICE
**Use Case:** Custom pricing without showing discount percentage

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬────────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │ YOUR PRICE │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼────────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │  ₹9,000    │ ₹18,000  │
└────┴──────┴───────┴──────────┴─────┴──────────┴────────────┴──────────┘
                                                   SUBTOTAL: ₹18,000.00
```

**Features:**
- Shows original MRP
- Shows custom "Your Price"
- Client sees final price but not discount %
- Good for negotiated pricing

---

## Format 2: MRP + DISCOUNT%
**Use Case:** Showing discount offers to clients

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬──────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │ DISCOUNT │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼──────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │  10.0%   │ ₹18,000  │
└────┴──────┴───────┴──────────┴─────┴──────────┴──────────┴──────────┘
                                                   SUBTOTAL: ₹18,000.00
```

**Features:**
- Shows original MRP
- Shows discount percentage
- Client calculates final price mentally
- Good for promotional offers

---

## Format 3: MRP + DISC% + FINAL PRICE
**Use Case:** Maximum transparency - show everything

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬───────┬─────────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │ DISC% │ FINAL PRICE │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼───────┼─────────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │ 10.0% │   ₹9,000    │ ₹18,000  │
└────┴──────┴───────┴──────────┴─────┴──────────┴───────┴─────────────┴──────────┘
                                                            SUBTOTAL: ₹18,000.00
```

**Features:**
- Shows original MRP
- Shows discount percentage
- Shows final discounted price
- Most transparent format
- Client sees exact savings

---

## Format 4: MRP (with GST breakdown)
**Use Case:** Clean product listing with tax details at bottom

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │ ₹20,000  │
│ 2  │Basin │ [img] │ Product  │  1  │ ₹5,000   │ ₹5,000   │
└────┴──────┴───────┴──────────┴─────┴──────────┴──────────┘
                                        SUBTOTAL: ₹25,000.00
                                  Taxable Amount: ₹21,186.44
                                       GST @18%: ₹3,813.56
```

**Features:**
- Clean, simple product listing
- MRP includes GST (reverse calculation)
- GST breakdown shown in subtotal
- Professional appearance
- Good for B2B clients who need tax details

**GST Calculation:**
```
MRP (including GST) = ₹25,000
Taxable Amount = (25,000 ÷ 118) × 100 = ₹21,186.44
GST @18% = 25,000 - 21,186.44 = ₹3,813.56
```

---

## Format 5: MRP + YOUR PRICE (with GST breakdown)
**Use Case:** Custom pricing with tax transparency

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬────────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │ YOUR PRICE │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼────────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │  ₹9,000    │ ₹18,000  │
│ 2  │Basin │ [img] │ Product  │  1  │ ₹5,000   │  ₹4,500    │ ₹4,500   │
└────┴──────┴───────┴──────────┴─────┴──────────┴────────────┴──────────┘
                                                   SUBTOTAL: ₹22,500.00
                                             Taxable Amount: ₹19,067.80
                                                  GST @18%: ₹3,432.20
```

**Features:**
- Shows original MRP
- Shows custom "Your Price"
- GST breakdown in subtotal
- Combines Format 1 with tax transparency
- Good for negotiated pricing with tax details

---

## Format 6: COMPLETE (MRP + DISC% + YOUR PRICE + GST)
**Use Case:** Maximum transparency - everything visible

```
┌────┬──────┬───────┬──────────┬─────┬──────────┬───────┬────────────┬──────────┐
│ SR │ AREA │ IMAGE │   ITEM   │ QTY │   MRP    │ DISC% │ YOUR PRICE │  TOTAL   │
├────┼──────┼───────┼──────────┼─────┼──────────┼───────┼────────────┼──────────┤
│ 1  │Shower│ [img] │ Product  │  2  │ ₹10,000  │ 10.0% │  ₹9,000    │ ₹18,000  │
│ 2  │Basin │ [img] │ Product  │  1  │ ₹5,000   │ 10.0% │  ₹4,500    │ ₹4,500   │
└────┴──────┴───────┴──────────┴─────┴──────────┴───────┴────────────┴──────────┘
                                                            SUBTOTAL: ₹22,500.00
                                                      Taxable Amount: ₹19,067.80
                                                           GST @18%: ₹3,432.20
```

**Features:**
- Shows original MRP
- Shows discount percentage
- Shows final "Your Price"
- GST breakdown in subtotal
- Most comprehensive format
- Client sees everything: original price, discount, final price, and tax

---

## Quick Comparison

| Feature | F1 | F2 | F3 | F4 | F5 | F6 |
|---------|----|----|----|----|----|----|
| MRP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Discount % | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Your Price | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Final Price | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| GST Breakdown | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Columns | 8 | 8 | 9 | 7 | 8 | 9 |
| Best For | Custom pricing | Offers | Transparency | Clean + Tax | Custom + Tax | Complete |

---

## When to Use Each Format

### **Format 1** - Custom Pricing
- ✅ Negotiated deals
- ✅ VIP clients
- ✅ Don't want to show discount %
- ✅ Simple, clean look

### **Format 2** - Discount Offers
- ✅ Promotional campaigns
- ✅ Seasonal sales
- ✅ Show savings percentage
- ✅ Marketing-focused

### **Format 3** - Maximum Transparency
- ✅ Government tenders
- ✅ Corporate clients
- ✅ Show everything clearly
- ✅ Build trust

### **Format 4** - Clean with Tax
- ✅ B2B clients
- ✅ GST compliance needed
- ✅ Professional appearance
- ✅ Simple product listing

### **Format 5** - Custom Pricing with Tax
- ✅ Negotiated deals + tax
- ✅ B2B VIP clients
- ✅ Custom pricing transparency
- ✅ GST compliance

### **Format 6** - Complete Breakdown
- ✅ Maximum transparency
- ✅ Government contracts
- ✅ Audit requirements
- ✅ Show everything

---

## GST Breakdown Explanation

**For Formats 4, 5, 6:**

The GST breakdown appears in the subtotal section:

```
SUBTOTAL: ₹25,000.00
Taxable Amount: ₹21,186.44
GST @18%: ₹3,813.56
```

**What this means:**
- **SUBTOTAL**: Total amount including GST (what client pays)
- **Taxable Amount**: Base amount before GST
- **GST @18%**: Tax amount (18% of taxable amount)

**Formula:**
```
Taxable Amount = (SUBTOTAL ÷ 118) × 100
GST Amount = SUBTOTAL - Taxable Amount
```

**Why reverse calculation?**
- MRP already includes GST
- We extract the GST component
- Shows tax transparency
- Helps with GST filing

---

## Tips for Choosing Format

1. **For retail clients** → Format 1 or 2
2. **For corporate clients** → Format 4 or 5
3. **For government tenders** → Format 6
4. **For promotional offers** → Format 2 or 3
5. **For GST compliance** → Format 4, 5, or 6
6. **For maximum trust** → Format 3 or 6

---

**All formats support:**
- ✅ Price editing
- ✅ Discount editing
- ✅ PDF generation
- ✅ Multi-room quotations
- ✅ Product images
- ✅ Company logos
