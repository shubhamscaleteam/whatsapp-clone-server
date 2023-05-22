import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    userName  : {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
    },
    member: [{ type: mongoose.Schema.Types.ObjectId, ref: "register" }],
  },
  {
    timestamps: true, 
  }
);

const Group = mongoose.model("group", groupSchema);
export default Group;
