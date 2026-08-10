const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const replacement = `
    if (b.paymentMethod === 'credit' && b.customerId) {
      await sql\`
        UPDATE customers
        SET total_debt = COALESCE(total_debt, 0) + \${b.grandTotal}
        WHERE id = \${b.customerId} AND user_id = \${req.user.tenantId}
      \`;
    }

    if (b.customerId && (b.pointsEarned || b.pointsRedeemed)) {
      const earned = b.pointsEarned || 0;
      const redeemed = b.pointsRedeemed || 0;
      await sql\`
        UPDATE customers
        SET loyalty_points = GREATEST(0, COALESCE(loyalty_points, 0) + \${earned} - \${redeemed})
        WHERE id = \${b.customerId} AND user_id = \${req.user.tenantId}
      \`;
    }
`;

code = code.replace(/if \(b\.paymentMethod === 'credit' && b\.customerId\) \{[\s\S]*?WHERE id = \$\{b\.customerId\} AND user_id = \$\{req\.user\.tenantId\}\n\s*`\s*;\s*\}/, replacement.trim());

fs.writeFileSync('server.ts', code);
console.log('Fixed loyalty points logic');
