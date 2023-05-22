import mongoose, { mongo } from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    message: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    },
    reciverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("message", messageSchema);
export default Message;
