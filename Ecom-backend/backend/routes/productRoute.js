const express = require("express");
const {
  getProducts,
  getProductsByVendor,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createProductReview,
  getProductReviews,
  deleteProductReviews,
} = require("../controllers/productController");
const {
  isAuthenticatedUser,
  isAuthenticatedRoles,
} = require("../middleware/auth");

const router = express.Router();

router.route("/:vendorId/products").get(getProductsByVendor);

router.route("/products").get(getProducts);


router
  .route("/product/new")
  .post(isAuthenticatedUser, isAuthenticatedRoles("admin"), createProduct);

router
  .route("/product/:id")
  .put(isAuthenticatedUser, isAuthenticatedRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, isAuthenticatedRoles("admin"), deleteProduct)
  .get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteProductReviews);

module.exports = router;
