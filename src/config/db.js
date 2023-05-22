import mongoose from "mongoose";

const mongo_url = process.env.MONGO_URL;

mongoose
  .connect(mongo_url)
  .then(() => {
    console.log("Database connected successfully..!!");
  })
  .catch((error) => {
    console.log(error.message);
  });
