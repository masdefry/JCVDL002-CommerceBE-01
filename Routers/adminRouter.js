const express = require("express");
const routers = express.Router();

const adminController = require("../Controllers/adminController");

routers.get("/get", adminController.getData);
routers.post("/add-product", adminController.addData);
routers.patch("/edit-product/:id", adminController.editData);
routers.delete("/delete-product/:id", adminController.deleteData);

module.exports = routers;
