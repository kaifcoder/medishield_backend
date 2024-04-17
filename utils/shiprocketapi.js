const axios = require('axios');


const dotenv = require('dotenv');
dotenv.config();

const shiprocketAuthData = {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
};

const shiprocketApi = axios.create({
    baseURL: 'https://apiv2.shiprocket.in/v1/external'
});



module.exports = { shiprocketApi };