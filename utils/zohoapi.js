const axios = require('axios');


const zohoBookApi = axios.create({
    baseURL: 'https://www.zohoapis.in/books/v3'
});

module.exports = { zohoBookApi };