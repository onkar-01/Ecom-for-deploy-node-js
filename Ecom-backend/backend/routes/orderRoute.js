const express = require("express");
const {
  isAuthenticatedUser,
  isAuthenticatedRoles,
} = require("../middleware/auth");
const {
  newOrder,
  getSingleOrder,
  getOrders,
} = require("../controllers/orderController");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, getOrders);

module.exports = router;
