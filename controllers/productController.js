const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary").v2;

// Create new product => /api/v1/admin/product/new
// only access by admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user._id;
  const images = req.files.images;
  const imagesLinks = [];

  if (!images) {
    return next(new ErrorHander("Please upload an image", 400));
  }

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(
      images[i].tempFilePath,
      {
        folder: "winkeat/products",
        transformation: { width: 300, height: 300, crop: "limit" },
      },
      (err, result) => {
        if (err) {
          return next(
            new ErrorHander("Something went wrong while uploading image", 500)
          );
        }
      }
    );

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

// Adjust the path as necessary

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const per_page = parseInt(req.query.per_page) || 10; // Ensure base 10 for parsing
  const currentPage = Math.max(parseInt(req.query.page) || 1, 1); // Ensure currentPage is at least 1

  try {
    const productCount = await Product.countDocuments({});

    const apiFeature = ApiFeatures(Product.find(), req.query)
      .pagination(per_page, currentPage)
      .search();
    const products = await apiFeature.query;

    res.status(200).json({
      success: true,
      products,
      productCount,
      totalPages: Math.ceil(productCount / per_page), // Optional: Include total pages
      currentPage, // Optional: Include current page
    });
  } catch (err) {
    next(new ErrorHander(err.message, err.status || 500));
  }
});

exports.getProductsByVendor = catchAsyncErrors(async (req, res, next) => {
  const { vendorId } = req.params; // Extract vendor ID from request params

  const productCount = await Product.countDocuments({ user: vendorId });

  const apifeature = ApiFeatures(
    Product.find({ user: vendorId }).populate("user", "name email"),
    req.query
  )
    .search()
    .filter();

  const products = await apifeature.query;
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

// update product

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHander("Product not Found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// delete product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new ErrorHander("Product not Found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});

// get single product details
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.indById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!product) {
    return next(new ErrorHander("Product not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// create new review and update

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(req.body.rating),
    comment: req.body.comment,
  };

  const product = await Product.findById(req.body.productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        review.comment = req.body.comment;
        review.rating = req.body.rating;
      }
    });
  }

  if (!isReviewed) {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// get product reviews

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new ErrorHander("Product not Found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// delete product reviews

exports.deleteProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById({
    _id: req.query.productId,
  });

  if (!product) {
    return next(new ErrorHander("Product not Found", 404));
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// get all products (admin)

exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
  });
});
