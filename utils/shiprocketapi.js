const axios = require('axios');

const ShiprocketAPI = require('../models/shiprocketapi');
const dotenv = require('dotenv');
dotenv.config();


// Function to create Shiprocket shipment
async function createShipment(shipmentData, access_key) {
    try {
        let data = JSON.stringify(shipmentData);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/shipments/create/forward-shipment',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_key}`
            },
            data: data
        };

        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

// Function to login to Shiprocket
async function shiprocketLogin() {
    try {
        let data = JSON.stringify({
            "email": process.env.SHIPROCKET_EMAIL, // Using environment variable for email
            "password": process.env.SHIPROCKET_PASSWORD // Using environment variable for password
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/auth/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);
        console.log(response.data.token);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 10);
        const shiprocketAPI = new ShiprocketAPI({
            key: response.data.token,
            expirationDate: expirationDate
        });
        await shiprocketAPI.save();

        return response.data.token;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { createShipment, shiprocketLogin };
