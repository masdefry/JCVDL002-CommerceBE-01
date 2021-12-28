// Import Library Untuk Rollback
const { throws } = require('assert')
const util = require('util')

// Import Connection
const db = require('../Database/Connection')
const query = util.promisify(db.query).bind(db) // Untuk Melakukan Rollback

const getProducts = async (req, res) => {
    const data = req.body

    let query1 = "SELECT p.idproducts, p.name, p.price, pp.url, SUM(spw.qty) 'total_stock'" +
                    " FROM products p " +
                    " JOIN picture_by_product pp " +
                    " ON p.idproducts = pp.idproduct " +
                    " JOIN stock_product_by_warehouse spw " +
                    " ON spw.idproducts = p.idproducts " +
                    " GROUP BY p.idproducts ";

    try {
        await query('Start Transaction')

        let getDataProducts =  getDataUser = await query(query1, data.username)
        .catch((error) => {
            throw error
        })

        await query('Commit')

        if (getDataProducts[0].length <= 0) {
            res.status(401).send({
                error: false,
                message: 'Data product is empty',
                detail: 'Data product is empty',
                data: []
            })
        } else {
            res.status(200).send({
                error: true,
                message: 'Data Product',
                detail: 'Data Product',
                data: [...getDataProducts]
            })
        }


    } catch (error) {
        if (error.status) {
            // Kalau error status nya ada, berarti ini error yang kita buat
            res.status(error.status).send({
                error: true,
                message: error.message,
                detail: error.detail
            })
        } else {
            // Kalau error yang disebabkan oleh sistem
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }

}

module.exports = {
    getProducts
}