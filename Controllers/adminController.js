const db = require("../Database/Connection");
const { uploader } = require(`../Helpers/Uploader`);
const fs = require(`fs`);

module.exports = {
  // TEST
  getData: (req, res) => {
    let scriptQuery = `select * from products`;

    db.query(scriptQuery, (err, results) => {
      if (err) res.status(500).send(err);
      res.status(200).send(results);
    });
  },

  // ADD PRODUCT DATA
  addData: (req, res) => {
    console.log(req.body); // cek input
    let { name, description, price, idpackage, idcategory, url, is_main } =
      req.body;
    let insertQuery1 = `Insert into products values (null, ${db.escape(
      name
    )}, ${db.escape(description)}, ${db.escape(price)}, ${db.escape(
      idpackage
    )})`;

    db.query(insertQuery1, (err, results) => {
      // console.log(results.insertId); //buat cek retrieve insert ID
      if (err) res.status(500).send(err);

      let insertQuery2 = `Insert into product_by_category values (${db.escape(
        results.insertId
      )}, ${db.escape(idcategory)})`;

      db.query(insertQuery2, (err2, results2) => {
        if (err2) res.status(500).send(err2);

        try {
          //promise
          //path lokasi file
          let path = `/images`;
          const upload = uploader(path, `IMG`).fields([{ name: `file` }]);

          upload(req, res, (error) => {
            if (error) {
              console.log(error);
              res.status(500).send(error);
            }

            const file = req.files; //yg membawa file dari front end
            console.log(req.files);
            const filePath = file ? path + `/` + file[0].filename : null;

            //parsing dari data yg dikirimkan front end
            let data = JSON.parse(req.body.data);
            data.url = filePath;

            let sqlInsert = `Insert into picture_by_product values (null , ${db.escape(
              results.insertId
            )}, ${db.escape(filePath)}, ${db.escape(is_main)})`;
            db.query(sqlInsert, (err, results) => {
              if (err) {
                console.log(err);
                fs.unlinkSync(`./public` + filePath);
                res.status(500).send(err);
              }
              res.status(200).send({ message: `Upload Image Success` });
            });
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({ message: `Gagal Upload` });
        }

        // menampilkan data baru -> cek data input udah benar atau belum
        // db.query(
        //   `Select * from products where name = ${db.escape(name)}`,
        //   (err3, results3) => {
        //     if (err3) res.status(500).send(err3);
        //     res.status(200).send({
        //       message: "New Product Succesfully Added",
        //       data: results,
        //     });
        //   }
        // );
      });
    });
  },

  // EDITING DATA PRODUCT
  editData: (req, res) => {
    let dataUpdate = [];
    for (let prop in req.body) {
      dataUpdate.push(`${prop} = ${db.escape(req.body[prop])}`);
    }

    let updateQuery = `UPDATE products set ${dataUpdate} where idproducts = ${req.params.id}`;
    console.log(updateQuery); // cek edit data
    // catatan: ga perlu edit category, karena kalo ganti produk yg beda category mending sekalian add / delete aja

    db.query(updateQuery, (err, results) => {
      if (err) res.status(500).send(err);
      res
        .status(200)
        .send({ message: "Succesfully Edit Data Product", data: results });
    });
  },

  // DELETE PRODUCT
  deleteData: (req, res) => {
    let deleteQuery1 = `DELETE from product_by_category where idproduct = ${db.escape(
      req.params.id
    )}`;

    let deleteQuery2 = `DELETE from products where idproducts = ${db.escape(
      req.params.id
    )}`;

    db.query(deleteQuery1, (err, results) => {
      if (err) res.status(500).send(err);

      db.query(deleteQuery2, (err2, results2) => {
        if (err2) res.status(500).send(err2);
        res
          .status(200)
          .send({ message: "Succesfully Delete Product", data: results });
      });
    });
  },
};
