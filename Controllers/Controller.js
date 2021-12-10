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

const nodemailer = require('nodemailer');
const randtoken = require('rand-token');

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
            fullname: data.fullname ? data.fullname : "",
            email: data.email,
            password: data.password,
            dob: data.dob ? data.dob : "",
            gender: data.gender ? data.gender : "",
            profile_picture_url: data.profile_picture_url ? data.profile_picture_url : "",
            status: "deactive",
            created_at : new Date().toISOString().slice(0, 19).replace('T', ' ')
        }

        const insertData = await query(query2, dataToSend)
        .catch((error) => {
            throw error
        })

        const getDataUser = await query(query3, insertData.insertId)
        .catch((error) => {
            throw error
        })

        let token = jwtSign({ id: getDataUser[0].id, status: getDataUser[0].status })
        
        // Step7. Commit Transaction
        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Register Success',
            detail: 'Register Berhasil Dilakukan!',
            data: {
                id: getDataUser[0].id,
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
        
        let token = jwtSign({ id: getDataUser[0].id, status: getDataUser[0].status })
        
        await query('Commit')

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

const getUserProfile = async (req, res) => {
    const data = req.dataToken

    let query1 = 'SELECT * FROM users WHERE id = ?'
    try {
        await query('Start Transaction')
        const getDataUser = await query(query1, data.id)
        .catch((error) => {
            throw error
        })
        
        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Get Data User Success',
            detail: 'Data User',
            data: {
                id: getDataUser[0].id,
                fullname: getDataUser[0].fullname,
                email: getDataUser[0].email, 
                fullname: getDataUser[0].fullname, 
                dob: getDataUser[0].dob,
                gender: getDataUser[0].gender,
                status: getDataUser[0].status
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

const changePassword = async (req, res) => {
    const data = req.dataToken
    const dataBody = req.body

    let query1 = 'SELECT * FROM users WHERE id = ?'
    let query3 = 'SELECT * FROM users WHERE email = ?'
    let query2 = 'UPDATE users SET password = ? WHERE id = ?'

    try {
        await query('Start Transaction')
        let paramGetUser = dataBody.email ? dataBody.email : data.id;
        let queryUser = dataBody.email ? query3 : query1;
        console.log("BEWE queryUser : " + queryUser)
        const getDataUser = await query(queryUser, paramGetUser)
        .catch((error) => {
            throw error
        })

        const updatePasswordUser = await query(query2, [dataBody.newPassword, getDataUser[0].id, ])
        .catch((error) => {
            throw error
        })

        let token = jwtSign({ id: getDataUser[0].id, status: getDataUser[0].status })

        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Change Password Success',
            detail: 'Ubah Password Dilakukan!',
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

    } catch (error) {
        if(error.status){
            res.status(error.status).send({
                error: true,
                message: error.message,
                detail: error.detail
            })
        }else{
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }

}

const sendEmailLink = async (req, res) => {
    const email = req.body.email

    let queryGetUser = 'SELECT * FROM users WHERE email = ?';
    let queryMagicLink = 'INSERT INTO magiclink SET ?';
    try {
        await query('Start Transaction')
        const getDataUser = await query(queryGetUser, email)
        .catch((error) => {
            throw error;
        })

        if(getDataUser[0].status == "deactive"){
            let token = randtoken.generate(20);
            const transporter = await nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 587 ,
                auth: {
                    user: 'hsbwarehouse29@gmail.com', // Email Sender
                    pass: 'wucdohrqncunyojy' // Password Windows Computer
                },
                tls: {
                    rejectUnauthorized: false
                  }
            })
        
            transporter.sendMail({
                from: 'hsbwarehouse29@gmail.com', // Sender Address
                to: email, // Email User
                subject: 'Email verification - warehouse.com',
                html: '<p>You requested for email verification, kindly use this <a href="http://localhost:5000/verifyEmail?token=' + token + '">link</a> to verify your email address</p>'
            })
            .then((response) => {
                if(response){
                    let today = new Date();
                    today.setMinutes(today.getMinutes() + 10);
                    let tokenObj = {
                        hash : token,
                        id : getDataUser[0].id,
                        expire_on: today.toISOString().slice(0, 19).replace('T', ' ')
                    }
                    query(queryMagicLink, tokenObj)
                    .catch((error) => {
                        throw error
                    })
                }
            })
            .catch((error) => {
                throw error
            })
            
        }else{
            error.status = 500;
            error.message = "User's already verified.";
            throw error;
        }

        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Email verification is sent.',
            detail: 'Email verification is sent.',
            data: {
                id: getDataUser[0].id,
                fullname: getDataUser[0].fullname,
                email: getDataUser[0].email, 
                fullname: getDataUser[0].fullname, 
                dob: getDataUser[0].dob,
                gender: getDataUser[0].gender,
                status: getDataUser[0].status
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

const verifyEmail = async (req, res) =>{
    const token = req.query.token;
    let queryActivate = "UPDATE users SET status = 'active' WHERE id = ?";
    let queryGetMagicLink = 'SELECT * FROM magiclink WHERE hash = ?';
    try{
        await query('Start Transaction')

        const getMagicLink = await query(queryGetMagicLink, token)
        .catch((error) => {
            throw error;
        })

        const activateUser = await query(queryActivate, getMagicLink[0].id)
        .catch((error) => {
            throw error;
        })

        await query('Commit')

        res.status(200).send({
            error: false, 
            message: 'Email is verified.',
            detail: 'Email is verified.',
        })
    }catch(error){
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
    login,
    changePassword,
    getUserProfile,
    sendEmailLink,
    verifyEmail
}