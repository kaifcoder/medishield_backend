const { zohoBookApi } = require("./utils/zohoapi");
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const zohoAuthData = {
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    grant_type: 'refresh_token'
};

const org = process.env.ZOHO_ORG_ID


const main = async () => {
    console.log(zohoAuthData)
    const zohoAuthResponse = await axios.post(`
    https://accounts.zoho.in/oauth/v2/token?refresh_token=${zohoAuthData.refresh_token}&client_id=${zohoAuthData.client_id}&client_secret=${zohoAuthData.client_secret}&grant_type=${zohoAuthData.grant_type}
    ` );
    console.log(zohoAuthResponse.data.access_token);
    const accessToken = zohoAuthResponse.data.access_token;
    const sku = 'test2'
    const customerId = '1811101000000024050'
    // create customer 

    console.log(customer.data);

    // const item = await zohoBookApi.get(`/items?organization_id=${org}&sku=${sku}`,
    //     {
    //         headers: {
    //             authorization: `Zoho-oauthtoken ${accessToken}`
    //         }
    //     }
    // );
    // console.log(item.data);
    // if (item.data.items.length > 0) {
    //     const itemid = item.data.items[0].item_id;
    //     const inStock = item.data.items[0].available_stock;
    //     const requriedStock = 10;
    //     if (inStock >= requriedStock) {
    //         console.log('Item is in stock');
    //         console.log('Item ID:', itemid);
    //         // create invoice
    //         const invoicePayload = {
    //             customer_id: customerId,
    //             line_items: [
    //                 {
    //                     item_id: itemid,
    //                     quantity: requriedStock,
    //                 }
    //             ]
    //         };
    //         const invoice = await zohoBookApi.post(`/invoices?organization_id=${org}`, invoicePayload,
    //             {
    //                 headers: {
    //                     authorization: `Zoho-oauthtoken ${accessToken}`
    //                 }
    //             });
    //         console.log(invoice.data.invoice.invoice_id);
    //         // invoice payment by customer
    //         const invoiceId = invoice.data.invoice.invoice_id;
    //         const total = invoice.data.invoice.total;
    //         const date = invoice.data.invoice.date;
    //         const paymentPayload = {
    //             customer_id: customerId,
    //             payment_mode: "banktransfer",
    //             amount: total,
    //             date: date,
    //             invoice_id: invoiceId,
    //             amount_applied: total,
    //             invoices: [
    //                 {
    //                     invoice_id: invoiceId,
    //                     amount_applied: total
    //                 }
    //             ]
    //         };

    //         const payment = await zohoBookApi.post(`/customerpayments?organization_id=${org}`, paymentPayload,
    //             {
    //                 headers: {
    //                     authorization: `Zoho-oauthtoken ${accessToken}`
    //                 }
    //             });
    //         console.log(payment.data);


    //     } else {
    //         console.log('Item is out of stock');
    //         console.log('Available stock:', inStock);
    //     }
    // } else {
    //     console.log('Item not found');
    // }

}

main();