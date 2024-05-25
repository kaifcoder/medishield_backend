const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCoupon = asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
        const existingCoupon = await Coupon.findOne({ couponCode: req.body.couponCode });
        if (existingCoupon) {
            res.status(400);
            throw new Error("Coupon already exists");
        }
        const newCoupon = await Coupon.create({
            couponCode: req.body.couponCode,
            discount: req.body.discount,
            type: req.body.type,
            minimumCartValue: req.body.minimumCartValue,
            minimumMedishieldCoins: req.body.minimumMedishieldCoins,
            expiryDate: req.body.expiryDate,
            status: req.body.status,
        });

        res.json(newCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate
            (id, req.body, {
                new: true,
            });
        res.json(updatedCoupon);
    } catch (error) {
        throw new Error(error);
    }
}
);

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error(error);
    }
}
);

const getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getaCoupon = await Coupon.findById(id);
        res.json(getaCoupon);
    } catch (error) {
        throw new Error(error);
    }
}
);

const getallCoupon = asyncHandler(async (req, res) => {
    try {
        let getallCoupon = await Coupon.find().sort({
            couponCode: 1
        });
        // sort by name in ascending order

        res.json(getallCoupon);
    } catch (error) {
        throw new Error(error);
    }
}
);

const getCouponByCode = asyncHandler(async (req, res) => {
    try {
        const { couponCode } = req.body;
        const coupon = await
            Coupon
                .findOne({ couponCode: couponCode });
        if (!coupon) {
            res.status(404);
            throw new Error("Coupon not found");
        }
        res.json(coupon);
    } catch (error) {
        throw new Error(error);
    }
}
);

module.exports = {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    getallCoupon,
    getCouponByCode
};


