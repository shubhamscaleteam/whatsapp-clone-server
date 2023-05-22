import mongoose from "mongoose";

const Schema = mongoose.Schema;

const registerSchema = new Schema(
  {
    userName: {
      type: String,
    },
    gender: {
      type: String,
    },
    phoneno: {
      type: Number,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Register = mongoose.model("register", registerSchema);
export default Register;
