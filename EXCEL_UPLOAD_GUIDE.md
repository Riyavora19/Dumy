# Excel Upload Guide for Products

## How to Use Excel Upload Feature

The Excel upload feature allows you to bulk upload products by providing an Excel file with product data.

### Supported File Formats
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Comma-separated values)

### Required Columns

Your Excel file should have the following columns (column names are case-insensitive):

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| name | ✅ Yes | Product name | "Ceramic Toilet Seat" |
| price | ✅ Yes | Product price | 150.00 |
| description | ❌ No | Product description | "Premium ceramic with soft close" |
| company | ❌ No | Company/Brand name | "Kohler" |
| stock | ❌ No | Stock quantity | 50 |
| sku | ❌ No | Stock keeping unit | "SKU-001" |
| variant | ❌ No | Product variant/model | "White Ceramic" |

### Alternative Column Names

The system recognizes these alternative column names:

- **Product Name**: `name`, `Name`, `Product`, `product`
- **Price**: `price`, `Price`
- **Company**: `company`, `Company`, `Brand`, `brand`
- **Stock**: `stock`, `Stock`
- **SKU**: `sku`, `SKU`
- **Variant**: `variant`, `Variant`

### Step-by-Step Instructions

1. **Prepare Your Excel File**
   - Create a spreadsheet with product data
   - Include at least the `name` and `price` columns
   - Add other optional columns as needed

2. **Click "Bulk Upload (Form)" Button**
   - In the Products Management page, click the blue "Bulk Upload (Form)" button

3. **Select Excel File**
   - In the modal that opens, click the Excel upload area
   - Choose your Excel file from your computer

4. **Review and Edit**
   - The system will parse your file and show a preview
   - You can edit any product details in the preview table
   - Select a category for all products (required)

5. **Upload**
   - Click "Upload [X] Products" to create all products
   - Products will be created with the selected category
   - You can edit individual products later if needed

### Example Excel File

Here's what your Excel file should look like:

```
| name                    | price | company | stock | sku      | variant        |
|-------------------------|-------|---------|-------|----------|----------------|
| Ceramic Toilet Seat     | 150   | Kohler  | 50    | SKU-001  | White Ceramic  |
| Chrome Faucet           | 85    | Moen    | 30    | SKU-002  | Chrome Finish  |
| Bathroom Mirror         | 120   | Vanity  | 25    | SKU-003  | 36x24 inches   |
| Shower Head             | 45    | Delta   | 100   | SKU-004  | Rainfall       |
```

### Tips

- **Keep it simple**: Start with just name and price, add other details later
- **Consistent formatting**: Use consistent data types (numbers for price/stock)
- **No special characters**: Avoid special characters in product names
- **Category selection**: You must select a category before uploading
- **Batch size**: You can upload hundreds of products at once
- **Edit after upload**: You can edit individual products after they're created

### Troubleshooting

**"Excel file is empty"**
- Make sure your file has data in the first sheet
- Check that you have at least one row of product data

**"Error parsing Excel file"**
- Verify your file format is .xlsx, .xls, or .csv
- Check that column headers are in the first row
- Ensure the file is not corrupted

**"Please select a category"**
- You must select a category for all products before uploading
- All products will be assigned to the selected category

**Products not created**
- Check the error messages in the notification
- Verify that product names and prices are filled in
- Try uploading a smaller batch to identify problematic rows
