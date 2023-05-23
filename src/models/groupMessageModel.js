import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupMessageSchema = new Schema(
  {
    message: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const GroupMessage = mongoose.model("groupMessage", groupMessageSchema);
export default GroupMessage;
