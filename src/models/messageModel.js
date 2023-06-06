import mongoose from "mongoose";

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
      type: [mongoose.Schema.Types.ObjectId],
      ref: "register",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "register",
      default: null,
    },
    deletedFrom: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "register",
      default: null,
    },
    isForward: {
      type: Boolean,
      default: false,
    },
    isread: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("message", messageSchema);
export default Message;
