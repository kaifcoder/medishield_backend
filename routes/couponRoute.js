const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();
const {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    getallCoupon,
    getCouponByCode
} = require("../controller/couponCtrl");

router.post("/", authMiddleware, isAdmin, createCoupon);
router.put("/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);
router.get("/:id", getCoupon);
router.get("/", getallCoupon);
router.post("/getCouponByCode", getCouponByCode);

module.exports = router;