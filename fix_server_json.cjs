const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /res\.json\(\{\s*bill: \{\s*\.\.\.bill,\s*dateTime: bill\.date_time,\s*grandTotal: bill\.grand_total,\s*items: items\s*\},/m;

const camelCaseObject = `
    const toCamel = (o) => {
      var newO, origKey, newKey, value
      if (o instanceof Array) {
        return o.map(function(value) {
            if (typeof value === "object") {
              value = toCamel(value)
            }
            return value
        })
      } else {
        newO = {}
        for (origKey in o) {
          if (o.hasOwnProperty(origKey)) {
            newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).replace(/_([a-z])/g, function(g) { return g[1].toUpperCase(); })
            value = o[origKey]
            if (value instanceof Array || (value !== null && value.constructor === Object)) {
              value = toCamel(value)
            }
            newO[newKey] = value
          }
        }
      }
      return newO
    }

    const camelBill = toCamel(bill);
    const camelItems = toCamel(items);
    const camelSettings = toCamel(shop);

    res.json({
      bill: {
        ...camelBill,
        items: camelItems
      },
      settings: camelSettings
    });
`;

code = code.replace(/res\.json\(\{[\s\S]*?settings: shop\s*\}\);/, camelCaseObject);

fs.writeFileSync('server.ts', code);
console.log("Patched server response");
