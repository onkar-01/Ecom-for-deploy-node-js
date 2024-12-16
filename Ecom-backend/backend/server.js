const dotenv = require("dotenv");
const app = require("./app");
const { connectDB, photoCloud } = require("./config/database");

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

//config
dotenv.config({ path: "backend/config/config.env" });

// call database connection
connectDB();
// call the cloudinary connection
photoCloud();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Unhandled Error

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
