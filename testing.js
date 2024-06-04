const { zohoBookApi } = require("./utils/zohoapi");
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const zohoAuthData = {
    client_id: process.env.MEDISHIELD_ZOHO_CLIENT_ID,
    client_secret: process.env.MEDISHIELD_ZOHO_CLIENT_SECRET,
    refresh_token: process.env.MEDISHIELD_ZOHO_REFRESH_TOKEN,
    grant_type: 'refresh_token'
};

const org = process.env.MEDISHIELD_ZOHO_ORG_ID