const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const toCamel = \(o\) => \{[\s\S]*?res\.json\(\{\s*bill: \{\s*\.\.\.camelBill,\s*items: camelItems\s*\},\s*settings: camelSettings\s*\}\);/m;

const replacement = `
    const mappedBill = {
      ...bill,
      dateTime: bill.date_time,
      discountType: bill.discount_type,
      discountValue: Number(bill.discount_value),
      subtotal: Number(bill.subtotal),
      discount: Number(bill.discount),
      grandTotal: Number(bill.grand_total),
      isPrinted: bill.is_printed,
      taxAmount: Number(bill.tax_amount) || 0,
      taxRate: Number(bill.tax_rate) || 0,
      customerId: bill.customer_id,
      paymentMethod: bill.payment_method || 'cash',
      status: bill.status || 'paid',
      items: items.map((i) => ({
        ...i,
        price: Number(i.price)
      }))
    };
    
    let mappedSettings = null;
    if (shop) {
      mappedSettings = {
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        receiptHeader: shop.receipt_header,
        receiptFooter: shop.receipt_footer,
        receiptFontSize: shop.receipt_font_size,
        receiptWidth: shop.receipt_width,
        receiptPaperSize: shop.receipt_paper_size,
        showStoreName: shop.show_store_name,
        showStoreDetails: shop.show_store_details,
        showAddress: shop.show_address,
        showPhone: shop.show_phone,
        showInvoiceNumber: shop.show_invoice_number,
        showDateTime: shop.show_date_time,
        taxRate: shop.tax_rate,
        taxName: shop.tax_name
      };
    } else {
      mappedSettings = {
        name: 'Alpha Store',
        address: '123 Main St, City',
        phone: '555-0123',
        receiptHeader: 'Welcome to Alpha Store',
        receiptFooter: 'Thank you for shopping with us!',
        receiptFontSize: 14,
        receiptWidth: 58,
        receiptPaperSize: '58mm',
        showStoreName: true,
        showStoreDetails: true,
        showAddress: true,
        showPhone: true,
        showInvoiceNumber: true,
        showDateTime: true,
        taxRate: 0,
        taxName: 'Tax'
      };
    }

    res.json({
      bill: mappedBill,
      settings: mappedSettings
    });
`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
console.log("Fixed explicit mapping");
