const Product = require("../../models/productModel");
const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');


const exportAllProducts = async () => {

    try {
        // connect to db
        mongoose.connect(workerData, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const products = await Product.find().select(
            '_id name sku barcode price max_sale_qty published manufacturer childProducts'
        ).sort({ name: 1 });
        // prepare csv content
        let productcsv = "sno,id, name, sku, barcode, price, stock, published, manufacturer\n";
        products.forEach(async (product, i) => {

            if (product.childProducts.length > 1) {
                product.childProducts.forEach(async (childProduct) => {

                    productcsv += `${i + 1},${product._id}, ${childProduct.name.replace(/,/g, ';')}, ${childProduct?.sku.replace(/,/g, ';')}, ${childProduct?.barcode}, ${childProduct.price.minimalPrice.amount.value},${product.max_sale_qty}, ${product.published}, ${childProduct.manufacturer}\n`;
                });
            } else {
                productcsv += `${i + 1},${product._id}, ${product.name.replace(/,/g, ';')}, ${product.sku.replace(/,/g, ';')}, ${product.barcode}, ${product.price.minimalPrice}, ${product.max_sale_qty}, ${product.published}, ${product.manufacturer}\n`;
            }

        });
        mongoose.disconnect();
        parentPort.postMessage(productcsv);
    } catch (error) {
        throw new Error(error);
    }
}
exportAllProducts();