// Import Library Untuk Rollback
const { throws } = require('assert')
const util = require('util')

// Import Connection
const db = require('../Database/Connection')
const query = util.promisify(db.query).bind(db) // Untuk Melakukan Rollback

// Import Hashing Password
const hashPassword = require('../Helpers/HashPassword')

// Import JWTSign
const jwtSign = require('../Helpers/JWTSign')

const nodemailer = require('nodemailer');
const randtoken = require('rand-token');

const login = async (req, res) => {
    console.log("Ini login product")
    const data = req.body

    let query1 = 'SELECT * FROM users WHERE username = ?'
    let query2 = 'SELECT * FROM users WHERE email = ?'

    try {
        if ((!data.username || !data.email) && !data.password) throw { status: 406, message: 'Data Null', detail: 'Data Tidak Lengkap!' }

        await query('Start Transaction')

        let getDataUser = null
        if (data.username) {
            if (data.username.length < 6) throw { status: 406, message: 'Data Invalid', detail: 'Username Minimal 6 Karakter!' }
            getDataUser = await query(query1, data.username)
                .catch((error) => {
                    throw error
                })
        } else if (data.email) {
            getDataUser = await query(query2, data.email)
                .catch((error) => {
                    throw error
                })
        }

        let token = "";
        let hashedPassword = hashPassword(data.password);
        token = jwtSign({ id: getDataUser[0].id, status: getDataUser[0].status })


        await query('Commit')

        if (getDataUser[0].password == hashedPassword) {
            res.status(200).send({
                error: false,
                message: 'Login Success',
                detail: 'Login Berhasil Dilakukan!',
                data: {
                    id: getDataUser[0].id,
                    email: getDataUser[0].email,
                    fullname: getDataUser[0].fullname,
                    dob: getDataUser[0].dob,
                    gender: getDataUser[0].gender,
                    status: getDataUser[0].status,
                    token: token
                }
            })
        } else {
            res.status(401).send({
                error: true,
                message: 'Email/password not matched.',
                detail: 'Password not matched!',
                data: {
                    id: getDataUser[0].id,
                    email: getDataUser[0].email,
                    fullname: getDataUser[0].fullname,
                    dob: getDataUser[0].dob,
                    gender: getDataUser[0].gender,
                    status: getDataUser[0].status
                }
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
    login
}