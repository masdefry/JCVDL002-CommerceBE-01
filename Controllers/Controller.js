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