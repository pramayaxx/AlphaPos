const req = {
  body: {
    name: 'Test Product',
    price: 100,
    stock_quantity: 10
  }
};
console.log(req.body.item_number === undefined);
