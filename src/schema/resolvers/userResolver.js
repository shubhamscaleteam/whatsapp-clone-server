import Register from "../../models/registerModel.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { PubSub } from "graphql-subscriptions";
import { errorHandle } from "./errorHandler.js";
import { sendMail } from "../../services/sendMail.js";
import { imageUpload } from "../../services/imageUpload.js";

// *** dynemic url

const domain_url = process.env.DOMAIN_URL;

const secret_key = process.env.SECRET_KEY;

const port = process.env.PORT;

const pubsub = new PubSub();

export default {
  Query: {
    //*** query for find userBy email */

    user: async (_, { email }) => {
      const user = await Register.findOne({ email: email });

      if (!user) {
        return errorHandle("user not exist with such email..!!", 404);
      }

      return user;
    },

    //*** query for find userById */

    userById: async (_, { id }) => {
      const findUser = await Register.findById(id);

      if (!findUser) {
        return errorHandle("user not exist with such email..!!", 404);
      }

      return findUser;
    },

    //*** query for find all user

    allUser: async () => {
      const findUser = await Register.find();

      return findUser;
    },
  },

  Mutation: {
    // ***mutation for register user

    registerUser: async (_, { input }) => {
      const findUserName = await Register.findOne({ userName: input.userName });

      if (findUserName) {
        return errorHandle("Username already exist..!!", 403);
      }

      const findEmail = await Register.findOne({ email: input.email });

      if (findEmail) {
        return errorHandle("User already exist with this email..!!", 403);
      }

      const userProfileImage = await input.profilePicture;

      //*** create regex for base64 so we get (data:image/png;base64) */

      const matches = userProfileImage.match(/^data:image\/([a-z]+);base64,/);

      if (!matches) {
        return errorHandle("Enter valid image..!!", 403);
      }

      // *** find extension

      const fileExtension = matches[1];

      // *** createunique name of image

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

      // *** image name with extension

      const newFileName = uniqueSuffix + "." + fileExtension;

      imageUpload(input.profilePicture, fileExtension, newFileName);

      const hashpw = await bcrypt.hash(input.password, 12);

      const newUser = new Register({
        ...input,
        password: hashpw,
        profilePicture: `${domain_url}${port}/uploads/` + newFileName,
      });

      const User = await newUser.save();
      return User;
    },

    //***login user

    loginUser: async (_, { input }) => {
      //*** Incase in future we use OTP  */

      // const findUser = await Register.findOne({ phoneno: input });

      // if (!findUser) {
      // return errorHandle("User not exist with such mobile number..!!", 404);
      // }

      const findUser = await Register.findOne({ email: input.email });

      if (!findUser) {
        return errorHandle("user not exist with such email..!!", 404);
      }

      const verifyPassword = await bcrypt.compare(
        input.password,
        findUser.password
      );

      if (!verifyPassword) {
        return errorHandle("email or password wrong..!!", 404);
      }

      const payload = {
        id: findUser._id,
        email: findUser.email,
      };

      const token = await jwt.sign(payload, secret_key, {
        expiresIn: "24h",
      });

      return { token };
    },

    //*** mutation for forgot password */

    forgetPassword: async (_, { email }) => {
      const findUser = await Register.findOne({ email: email });

      if (!findUser) {
        return errorHandle("user not exist with such email..!!", 404);
      }

      const userId = await findUser.id;

      sendMail(userId, findUser.email);

      return findUser;
    },

    //*** mutation for new password */

    newPassword: async (_, { input, token }) => {
      const decode = await jwt.decode(token, secret_key);

      if (!decode) {
        return errorHandle("Invalid token", 401);
      }

      const { id } = decode;

      const user = await Register.findById(id);

      const cnfPassword = input.newPassword === input.confirmPassword;

      if (!cnfPassword) {
        return errorHandle(
          "Your password and confirmation password do not match",
          401
        );
      }

      const bcryptPassword = await bcrypt.hash(input.newPassword, 12);

      user.id = user.id;
      user.userName = user.userName;
      user.phoneno = user.phoneno;
      user.email = user.email;
      user.password = bcryptPassword;

      const updatedPassword = await user.save();

      return updatedPassword;
    },

    //*** mutation for new updateuser profile */

    updateUserProfile: async (_, { input }) => {
      const findUser = await Register.findById(input.id);

      if (!findUser) {
        return errorHandle("Invalid user", 401);
      }

      if (input.userName) {
        findUser.userName = input.userName;
      }
      if (input.profilePicture) {
        const userProfileImage = await input.profilePicture;

        //*** create regex for base64 so we get (data:image/png;base64) */

        const matches = userProfileImage.match(/^data:image\/([a-z]+);base64,/);

        if (!matches) {
          return errorHandle("Enter valid image..!!", 403);
        }

        // *** find extension

        const fileExtension = matches[1];

        // *** createunique name of image

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        // *** image name with extension

        const newFileName = uniqueSuffix + "." + fileExtension;

        imageUpload(input.profilePicture, fileExtension, newFileName);

        findUser.profilePicture = `${domain_url}${port}/uploads/` + newFileName;
      }

      const newUser = await findUser.save();

      pubsub.publish("UPDATE_USERPROFILE", {
        updateUserProfile: newUser,
      });

      return newUser;
    },
  },

  //*** subscripation */

  Subscription: {
    updateUserProfile: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator("UPDATE_USERPROFILE");

        return pubsubSubscripation;
      },
    },
  },
};
