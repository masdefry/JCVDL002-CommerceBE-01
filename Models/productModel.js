const { db } = require("../Database/Connection");

class Product {
  constructor(name, description, price, idpackage, id = Null) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.idpackage = idpackage;
    this.id = id;
  }

  static getProducts(params, callback) {
    let { page, sort_by, order_by } = params;
    if (sort_by == undefined) sort_by = "idproducts";
    if (order_by == undefined) order_by = "ASC";
    if (page == undefined) page = 1;

    let products_per_page = 6;

    let offset = (page - 1) * products_per_page;
    let query = `SELECT idproducts, name, price, url FROM products 
        JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
        WHERE picture_by_product.is_main = true
        ORDER BY ${sort_by} ${order_by}
        LIMIT ${offset},${products_per_page};`;

    db.query(query, (err, result) => {
      if (err) callback({ err: true, message: "query error" });
      callback({
        err: false,
        data: result,
      });
    });
  }

  static getProduct(id, params, callback) {
    let escaped_id = db.escape(id);

    let query = `SELECT idproducts, name, price, description, size 
            FROM products 
            JOIN package ON products.idpackage = package.idpackage
            WHERE idproducts=${escaped_id}; 
            SELECT url FROM picture_by_product WHERE idproduct=${escaped_id}; 
            SELECT SUM(qty) as 'all_stock' FROM stock_product_by_warehouse WHERE idproducts=${escaped_id};
            SELECT name FROM category
            JOIN product_by_category ON product_by_category.idcategory = category.idcategory
            WHERE product_by_category.idproduct = ${escaped_id}`;

    db.query(query, [1, 2, 3, 4], (err, results) => {
      if (err) callback({ err: true, message: "query error" });
      let product = {
        idproducts: results[0][0].idproducts,
        name: results[0][0].name,
        price: results[0][0].price,
        description: results[0][0].description,
        size: results[0][0].size,
        stock: results[2][0].all_stock,
        categories: results[3].map((data) => data.name),
        urls: results[1].map((data) => data.url),
      };

      callback({
        err: false,
        data: product,
      });
    });
  }
}

module.exports = Product;
