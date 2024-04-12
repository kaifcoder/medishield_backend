const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const shiprocketAuthData = {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
};

const main = async () => {
    console.log(shiprocketAuthData)
    const shiprocketAuthResponse = await axios.post(`
    https://apiv2.shiprocket.in/v1/external/auth/login
    `, shiprocketAuthData);
    console.log(shiprocketAuthResponse.data.token);
    const accessToken = shiprocketAuthResponse.data.token;
    const orderId = '123456'

    var data = JSON.stringify({
        "order_id": orderId,
        "order_date": "2019-07-24 11:11",
        "pickup_location": "Jammu",
        "channel_id": "",
        "comment": "Reseller: M/s Goku",
        "billing_customer_name": "Naruto",
        "billing_last_name": "Uzumaki",
        "billing_address": "House 221B, Leaf Village",
        "billing_address_2": "Near Hokage House",
        "billing_city": "New Delhi",
        "billing_pincode": "110002",
        "billing_state": "Delhi",
        "billing_country": "India",
        "billing_email": "naruto@uzumaki.com",
        "billing_phone": "9876543210",
        "shipping_is_billing": true,
        "shipping_customer_name": "",
        "shipping_last_name": "",
        "shipping_address": "",
        "shipping_address_2": "",
        "shipping_city": "",
        "shipping_pincode": "",
        "shipping_country": "",
        "shipping_state": "",
        "shipping_email": "",
        "shipping_phone": "",
        "order_items": [
            {
                "name": "Kunai",
                "sku": "chakra123",
                "units": 10,
                "selling_price": "900",
                "discount": "",
                "tax": "",
                "hsn": 441122
            }
        ],
        "payment_method": "Prepaid",
        "shipping_charges": 0,
        "giftwrap_charges": 0,
        "transaction_charges": 0,
        "total_discount": 0,
        "sub_total": 9000,
        "length": 10,
        "breadth": 15,
        "height": 20,
        "weight": 2.5
    });

    const orderPayload = {
        order_id: orderId,
        order_date: '2021-07-01',
        pickup_location: 'Pune',
        channel_id: 1,
        comment: 'Test order',
        billing_customer_name: 'John Doe',
        billing_last_name: 'Doe',
        billing_address: 'Address',
        billing_city: 'Pune',
        billing_state: 'MH',
        billing_zip: '411001',
        billing_country: 'India',
        billing_email: '',
        billing_phone: '9999999999',
        shipping_is_billing: true,
        shipping_customer_name: 'John Doe',
        shipping_last_name: 'Doe',
        shipping_address: 'Address',
        shipping_city: 'Pune',
        shipping_state: 'MH',
        shipping_zip: '411001',
        shipping_country: 'India',
        shipping_email: '',
        shipping_phone: '9999999999',
        order_items: [
            {
                name: 'Test Product',
                sku: 'test',
                units: 1,
                selling_price: 100,
                discount: 0,
                tax: 0,
                hsn: 1234,
                warehouse: 'WH1'
            }
        ]
    };
    const order = await axios.post(`https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`, orderPayload,
        {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
    console.log(order.data);
    // tracking
    const courierName = 'Delhivery';
    const courierAWB = '123456';
    const trackingPayload = {
        courier_name: courierName,
        awb_code: courierAWB
    };
    const tracking = await axios.post(`https://apiv2.shiprocket.in/v1/external/courier/track`, trackingPayload,
        {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });

    console.log(tracking.data);

    // mark order as shipped
    const shippedPayload = {
        order_id: orderId,
        courier_name: courierName,
        awb_code: courierAWB
    };
    const shipped = await axios.post(`https://apiv2.shiprocket.in/v1/external/orders/ship`, shippedPayload,
        {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
    console.log(shipped.data);

    // cancel order
    const cancelPayload = {
        order_id: orderId,
        reason: 'Test'
    };
    const cancel = await axios.post(`https://apiv2.shiprocket.in/v1/external/orders/cancel`, cancelPayload,
        {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
    console.log(cancel.data);

    // get shipping rates
    const shippingRatesPayload = {
        pickup_postcode: '411001',
        delivery_postcode: '411001',
        weight: 1,
        cod: 0,
        order_amount: 100
    };
    const shippingRates = await axios.post(`https://apiv2.shiprocket.in/v1/external/courier/serviceability`, shippingRatesPayload,
        {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });
    console.log(shippingRates.data);
}

main();
