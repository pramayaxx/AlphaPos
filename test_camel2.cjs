const bill = {
  id: "some_id",
  date_time: new Date(),
  grand_total: 100,
  tax_amount: 10
}
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

console.log(toCamel(bill))
