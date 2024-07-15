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


const main = async () => {
    console.log(zohoAuthData)
    const zohoAuthResponse = await axios.post(`
    https://accounts.zoho.in/oauth/v2/token?refresh_token=${zohoAuthData.refresh_token}&client_id=${zohoAuthData.client_id}&client_secret=${zohoAuthData.client_secret}&grant_type=${zohoAuthData.grant_type}
    ` );
    console.log(zohoAuthResponse.data.access_token);
    const accessToken = zohoAuthResponse.data.access_token;

    // const productPayload = {
    //     name: 'Test Product',
    //     rate: 1,
    //     sku: 'MSTEST0001',
    //     description: 'Test Product',
    //     account_id: "1785281000000000486",
    //     account_name: "Sales",
    //     item_type: "inventory",
    //     product_type: "goods",
    //     initial_stock: 20,
    //     initial_stock_rate: 1
    // }

    // const product = await zohoBookApi.post(`/items?organization_id=${org}`,

    //     productPayload,
    //     {
    //         headers: {
    //             authorization: `Zoho-oauthtoken ${accessToken}`
    //         },

    //     }
    // );
    // const zohoInvoicePayload = {
    //     customer_id: "1785281000001452001",
    //     salesperson_name: 'APP',
    //     is_inclusive_tax: true,
    //     discount: "10",
    //     is_discount_before_tax: false,
    //     discount_type: "entity_level",
    //     line_items: [
    //         {
    //             item_id: '1785281000001450001',
    //             quantity: 1,
    //         }
    //     ],
    //     shipping_charge: 100,
    // };

    // const invoice = await zohoBookApi.post(`/invoices?organization_id=${org}`, zohoInvoicePayload,
    //     {
    //         headers: {
    //             authorization: `Zoho-oauthtoken ${accessToken}`
    //         }
    //     });
    // console.log(invoice.data);
    // console.log(invoice.data.invoice.invoice_id);

    const invoicedownload = await zohoBookApi.get(`/invoices/1785281000002462001?organization_id=${org}`,
        {
            headers: {
                authorization: `Zoho-oauthtoken ${accessToken}`
            }
        });

    console.log(invoicedownload);
    // console.log(accessToken);


}

main();