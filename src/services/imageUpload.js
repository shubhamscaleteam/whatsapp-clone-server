import path from "path";
import fs from "fs";
import Register from "../models/registerModel.js";

export const imageUpload = async (
  userProfileImage,
  fileExtension,
  newFileName
) => {
  // *** find file type

  const fileType = userProfileImage.substring(
    "data:".length,
    userProfileImage.indexOf("/")
  );

  const regex = new RegExp(`^data:${fileType}\/${fileExtension};base64,`, "gi");

  // *** replace regex with empty string

  const base64Data = userProfileImage.replace(regex, "");

  // *** create path for upload image

  const uploadPath = path.join(process.cwd(), "/public/uploads/");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  fs.writeFileSync(uploadPath + newFileName, base64Data, "base64");
};
