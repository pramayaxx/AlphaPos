const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const recipesStockReduction = `
      // Process recipes for raw materials
      for (const item of items) {
        const productRecipes = await sql\`SELECT * FROM recipes WHERE product_id = \${item.product.id}\`;
        for (const recipe of productRecipes) {
          const qtyToReduce = recipe.quantity_needed * item.quantity;
          await sql\`UPDATE products SET stock_quantity = stock_quantity - \${qtyToReduce} WHERE id = \${recipe.raw_material_product_id}\`;
        }
      }
`;

if (!code.includes('SELECT * FROM recipes WHERE product_id')) {
  // Find where we loop through items to update stock_quantity
  // currently we have: for (const item of items) { await sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.product.id}`; }
  
  code = code.replace(/for \(const item of items\) \{\s*await sql\`UPDATE products SET stock_quantity = stock_quantity - \$\\{item\.quantity\\} WHERE id = \$\\{item\.product\.id\\}\`;\s*\}/, match => {
    return match + "\n" + recipesStockReduction;
  });

  fs.writeFileSync('server.ts', code);
  console.log("Patched backend for recipes stock reduction.");
}
