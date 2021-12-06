const router = require("express").Router();
const Product = require("../Models/productModel");

const get_products = (req, res) => {
  Product.getProducts(req.query, (products_results) => {
    res.json({
      message: products_results,
    });
  });
};

const get_product = (req, res) => {
  Product.getProduct(req.params.id, null, (product_result) => {
    res.json({
      message: product_result,
    });
  });
};

router.get("/", get_products);
router.get("/:id", get_product);

module.exports = router;
