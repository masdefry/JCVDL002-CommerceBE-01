// Import Library Untuk Rollback
const { throws } = require('assert')
const util = require('util')

// Import Connection
const db = require('./../Database/Connection')
const query = util.promisify(db.query).bind(db) // Untuk Melakukan Rollback

// Import Hashing Password
const hashPassword = require('./../Helpers/HashPassword')

// Import JWTSign
const jwtSign = require('./../Helpers/JWTSign')

const register = async(req, res) => {
    // Step0. Kita ambil semua datanya yang dikirim oleh client
    /**
     * {
            "fullname": "Budi Wahyu Herlen Adita",
            "email": "budiwahyuherlenadita@gmail.com",
            "password": "password",
            "gender" : "f",
            "profile_picture" : "",
            "status" : "user"
        }
     */
    const data = req.body

    // Step1. Kita cek terlebih dahulu emailnya. Apakah sudah terdaftar atau belum. Kalau sudah, kita kirimkan pesan error ke user. Tapi kalau belum terdaftar, kita lanjut ke Step2.
    let query1 = 'SELECT * FROM users WHERE email = ?'
    // Step2. Kita insert data yang telah di submit oleh user
    let query2 = 'INSERT INTO users SET ?'
    // Step3. Kita select datanya, kita kirim ke user
    let query3 = 'SELECT * FROM users WHERE id = ?'
    try {
        // Step4. Validasi Data
        // if(!data.username || !data.email || !data.password) throw { status: 406, message: 'Data Null', detail: 'Data Tidak Lengkap!' }
        // if(data.username.length < 6) throw { status: 406, message: 'Data Invalid', detail: 'Username Minimal 6 Karakter!' }
        
        // Step5. Start Transaction Rollback
        await query('Start Transaction')

        const checkEmail = await query(query1, data.email)
        .catch((error) => {
            throw error
        })

        if(checkEmail.length > 0) throw { status: 406, message: 'Error Validation', detail: 'Email Sudah Terdaftar' } // Apabila data yang di dapat dari query1 lebih dari nol, maka kita anggap email sudah terdaftar

        // Step6. Hash Password nya
        let hashedPassword = hashPassword(data.password)

        /**
     * {
            "fullname": "Budi Wahyu Herlen Adita",
            "email": "budiwahyuherlenadita@gmail.com",
            "password": "password",
            "gender" : "f",
            "profile_picture" : "",
            "status" : "user"
        }
     */
        let dataToSend = {
            fullname: data.fullname,
            email: data.email,
            password: data.password,
            dob: data.dob,
            gender: data.gender,
            profile_picture_url: data.profile_picture_url,
            status: data.status,
            created_at : new Date().toISOString().slice(0, 19).replace('T', ' ')
        }

        console.log("BEWE dataToSend : " + JSON.stringify(dataToSend))

        const insertData = await query(query2, dataToSend)
        .catch((error) => {
            throw error
        })

        const getDataUser = await query(query3, insertData.insertId)
        .catch((error) => {
            throw error
        })

        let token = jwtSign({ uid: getDataUser[0].uid, role: getDataUser[0].role })
        
        // Step7. Commit Transaction
        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Register Success',
            detail: 'Register Berhasil Dilakukan!',
            data: {
                id: getDataUser[0].id,
                uid: getDataUser[0].uid,
                username: getDataUser[0].username,
                email: getDataUser[0].email, 
                token: token
            }
        })

    } catch (error) {
        if(error.status){
            // Kalau error status nya ada, berarti ini error yang kita buat
            res.status(error.status).send({
                error: true,
                message: error.message,
                detail: error.detail
            })
        }else{
            // Kalau error yang disebabkan oleh sistem
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }
}

const login = async (req, res) => {
    const data = req.body

    let query1 = 'SELECT * FROM users WHERE username = ?'
    let query2 = 'SELECT * FROM users WHERE email = ?'

    try {
        if((!data.username || !data.email) && !data.password) throw { status: 406, message: 'Data Null', detail: 'Data Tidak Lengkap!' }
        
        await query('Start Transaction')

        let getDataUser = null
        if(data.username){
            if(data.username.length < 6) throw { status: 406, message: 'Data Invalid', detail: 'Username Minimal 6 Karakter!' }
            getDataUser = await query(query1, data.username)
            .catch((error) => {
                throw error
            })
        }else if(data.email){
            getDataUser = await query(query2, data.email)
            .catch((error) => {
                throw error
            })
        }
        
        let token = jwtSign({ uid: getDataUser[0].uid, role: getDataUser[0].role })
        
        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Login Success',
            detail: 'Login Berhasil Dilakukan!',
            data: {
                id: getDataUser[0].id,
                uid: getDataUser[0].uid,
                username: getDataUser[0].username,
                email: getDataUser[0].email, 
                token: token
            }
        })

    } catch (error) {
        if(error.status){
            // Kalau error status nya ada, berarti ini error yang kita buat
            res.status(error.status).send({
                error: true,
                message: error.message,
                detail: error.detail
            })
        }else{
            // Kalau error yang disebabkan oleh sistem
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }

}
 
module.exports = {
    register,
    login
}