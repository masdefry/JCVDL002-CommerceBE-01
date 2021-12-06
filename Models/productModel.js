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
    let { page } = params;
    if (page == undefined) page = 1;

    let products_per_page = 6;

    let offset = (page - 1) * products_per_page;
    let query = `SELECT idproducts, name, price, url FROM products 
        JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
        WHERE picture_by_product.is_main = true
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
    let query = `SELECT idproducts, name, description, url, size 
            FROM products 
            JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
            JOIN package ON products.idpackage = package.idpackage
            WHERE idproduct=${id}`;

    db.query(query, (err, result) => {
      if (err) callback({ err: true, message: "query error" });

      let product = {
        idproducts: result[0].idproducts,
        name: result[0].name,
        description: result[0].description,
        size: result[0].size,
        urls: result.map((data) => data.url),
      };

      callback({
        err: false,
        data: product,
      });
    });
  }
}

module.exports = Product;
