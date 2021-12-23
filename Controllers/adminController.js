const singleUpload = require("./../helpers/singleUpload")();
const db = require("../Database/Connection");

// Multer Needed
const util = require("util");
const query = util.promisify(db.query).bind(db);

const getData = (req, res) => {
  const limit = 6;
  const page = req.query.page;
  let offset = (page - 1) * limit;
  if (Number.isNaN(offset)) {
    offset = 0;
  }
  let scriptQuery = `SELECT * FROM products
  JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
  JOIN product_by_category ON products.idproducts = product_by_category.idproduct
  LIMIT ${db.escape(offset)},${db.escape(limit)}`;

  let scriptQuery2 = `SELECT CEIL(COUNT(*)/6) as maxPage FROM products JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
  JOIN product_by_category ON products.idproducts = product_by_category.idproduct`;

  db.query(scriptQuery, (err, results) => {
    if (err) res.status(500).send(err);

    db.query(scriptQuery2, (err2, results2) => {
      if (err2) res.status(500).send(err);

      var info = {
        maxPage: results2,
        page: page,
        products: results,
      };

      res.status(200).send(info);
    });
  });
};

const getDetail = async (req, res) => {
  const idDetail = db.escape(req.params.id);
  let getQuery = `SELECT * FROM products JOIN picture_by_product ON products.idproducts = picture_by_product.idproduct
  WHERE idproducts = ${idDetail}`;

  db.query(getQuery, (err, results) => {
    if (err) res.status(500).send(err);
    res.status(200).send(results);
  });
};

const addData = async (req, res) => {
  try {
    const singleUploadAwait = util.promisify(singleUpload).bind(singleUpload);

    await singleUploadAwait(req, res);
    if (req.files.length === 0 || req.files === undefined)
      throw { message: "File Not Found, Try Again" };

    console.log(req.files);
    let file = req.files;
    console.log(`Check Image Path` + file[0].path + ` ✔ Found`);
    let filePath = file[0].path.slice(7);
    console.log(filePath);

    console.log(req.body.data);

    let { name, description, price, idpackage, idcategory, is_main } =
      JSON.parse(req.body.data); //The JSON.parse() method parses a JSON string, constructing the JavaScript value or object described by the string.

    console.log(`Check Parsing Product's Name ` + name + ` ✔ Done`);

    let insertQuery1 = `Insert into products values (null, ${db.escape(
      name
    )}, ${db.escape(description)}, ${db.escape(price)}, ${db.escape(
      idpackage
    )})`;

    db.query(insertQuery1, (err, results) => {
      if (err) res.status(500).send(err);

      let insertQuery2 = `Insert into product_by_category values (${db.escape(
        results.insertId
      )}, ${db.escape(1)}), (${db.escape(results.insertId)}, ${db.escape(
        idcategory
      )})`;

      db.query(insertQuery2, (err2, results2) => {
        if (err2) res.status(500).send(err2);

        let insertquery3 = `Insert into picture_by_product values (null , ${db.escape(
          results.insertId
        )}, ${db.escape(filePath)}, ${db.escape(is_main)})`;

        db.query(insertquery3, (err3, results3) => {
          if (err3) res.status(500).send(err3);
          res
            .status(200)
            .send({ message: `Successfully Input ${db.escape(name)}.... ✔` });
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const editData = async (req, res) => {
  try {
    const singleUploadAwait = util.promisify(singleUpload).bind(singleUpload);
    await singleUploadAwait(req, res);
    if (req.files.length === 0 || req.files === undefined) {
      console.log(req.body.data);
      let dataUpdate = [];
      let dataObject = JSON.parse(req.body.data);
      // console.log(`Hasil perubahan` + dataObject); //hasil parsing

      for (let prop in dataObject) {
        dataUpdate.push(`${prop} = ${db.escape(dataObject[prop])}`);
      }
      // console.log(dataUpdate); //hasil push array data

      let updateQuery = `UPDATE products set ${dataUpdate} where idproducts = ${req.params.id}`;
      // console.log(updateQuery);

      db.query(updateQuery, (err, results) => {
        if (err) res.status(500).send(err);
        res.status(200).send({
          message: `Success Edit Data Only for Product no ${req.params.id}... ✔ `,
        });
      });
    } else {
      // IMAGE
      // console.log(req.files);
      let file = req.files;
      console.log(`Check Image Path` + file[0].path + ` ✔ Found`);
      let filePath = file[0].path.slice(7);

      //  DATA
      console.log(req.body.data);
      let dataUpdate = [];
      let dataObject = JSON.parse(req.body.data);
      // console.log(`Hasil perubahan` + dataObject); //hasil parsing

      for (let prop in dataObject) {
        dataUpdate.push(`${prop} = ${db.escape(dataObject[prop])}`);
      }
      // console.log(dataUpdate); //hasil push array data

      let updateQuery = `UPDATE products set ${dataUpdate} where idproducts = ${req.params.id}`;
      // console.log(updateQuery);

      db.query(updateQuery, (err, results) => {
        if (err) res.status(500).send(err);

        let updateQuery2 = `UPDATE picture_by_product set url = ${db.escape(
          filePath
        )} where idproduct = ${req.params.id}`;

        // console.log(updateQuery2);
        db.query(updateQuery2, (err2, results2) => {
          if (err2) res.status(500).send(err2);
          res.status(200).send({
            message: `Success Edit Data & Image for Product no ${req.params.id}... ✔ `,
          });
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// const editData = async (req, res) => {
//   try {
//     const singleUploadAwait = util.promisify(singleUpload).bind(singleUpload);
//     await singleUploadAwait(req, res);
//     if (req.files.length === 0 || req.files === undefined)
//       throw { message: "File Not Found, Try Again" };

//     // console.log(req.files);
//     let file = req.files;
//     console.log(`Check Image Path` + file[0].path + ` ✔ Found`);
//     let filePath = file[0].path.slice(7);
//     console.log(req.body.data);

//     let dataUpdate = [];
//     let dataObject = JSON.parse(req.body.data);
//     // console.log(`Hasil perubahan` + dataObject); //hasil parsing

//     for (let prop in dataObject) {
//       dataUpdate.push(`${prop} = ${db.escape(dataObject[prop])}`);
//     }
//     // console.log(dataUpdate); //hasil push array data

//     let updateQuery = `UPDATE products set ${dataUpdate} where idproducts = ${req.params.id}`;
//     // console.log(updateQuery);

//     db.query(updateQuery, (err, results) => {
//       if (err) res.status(500).send(err);

//       let updateQuery2 = `UPDATE picture_by_product set url = ${db.escape(
//         filePath
//       )} where idproduct = ${req.params.id}`;

//       // console.log(updateQuery2);
//       db.query(updateQuery2, (err2, results2) => {
//         if (err2) res.status(500).send(err2);
//         res.status(200).send({
//           message: `Success Edit Data Product no ${req.params.id}... ✔ `,
//         });
//       });
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

const deleteData = (req, res) => {
  let deleteQuery1 = `DELETE from picture_by_product where idproduct = ${db.escape(
    req.params.id
  )} `;

  let deleteQuery2 = `DELETE from product_by_category where idproduct = ${db.escape(
    req.params.id
  )}`;

  let deleteQuery3 = `DELETE from products where idproducts = ${db.escape(
    req.params.id
  )}`;

  db.query(deleteQuery1, (err, results) => {
    if (err) res.status(500).send(err);

    db.query(deleteQuery2, (err2, results2) => {
      if (err2) res.status(500).send(err2);

      db.query(deleteQuery3, (err3, results3) => {
        if (err3) res.status(500).send(err3);
        res
          .status(200)
          .send({ message: "Succesfully Delete Product", data: results });
      });
    });
  });
};

module.exports = { getData, getDetail, addData, editData, deleteData };
