import Register from "../../models/registerModel.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const secret_key = process.env.SECRET_KEY;

const admin_email = process.env.ADMIN_EMAIL;

const admin_password = process.env.ADMIN_PASSWORD;

const client_port = 3000;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: admin_email, // generated ethereal user
    pass: admin_password, // generated ethereal password
  },
});

export default {
  Query: {
    user: async (_, { email }) => {
      const user = await Register.findOne({ email: email });

      if (!user) {
        throw new GraphQLError("user not exist with such email..!!", {
          extensions: {
            code: 404,
          },
        });
      }

      return user;
    },

    userById: async (_, { id }) => {
      const findUser = await Register.findById(id);

      if (!findUser) {
        throw new GraphQLError("user not exist with such email..!!", {
          extensions: {
            code: 404,
          },
        });
      }

      return findUser;
    },

    allUser: async () => {
      const findUser = await Register.find();

      return findUser;
    },
  },

  Mutation: {
    // ***register user

    registerUser: async (_, { input }) => {
      const findUserName = await Register.findOne({ userName: input.userName });

      if (findUserName) {
        throw new GraphQLError("Username already exist..!!", {
          extensions: {
            code: 403,
          },
        });
      }

      const findEmail = await Register.findOne({ email: input.email });

      if (findEmail) {
        throw new GraphQLError("User already exist with this email..!!", {
          extensions: {
            code: 403,
          },
        });
      }

      // const uploadPath = path.join( "../../public/uploads");

      // if (!fs.existsSync(uploadPath)) {
      //   fs.mkdirSync(uploadPath);
      // }
      // const userProfileImage = await input.profilePicture;

      // const base64Data = userProfileImage.replace(
      //   /^data:image\/\w+;base64,/,
      //   ""
      // );

      // const buffer = Buffer.from(base64Data, "base64");

      // fs.writeFileSync(uploadPath, buffer, "base64");

      // const hashpw = await bcrypt.hash(input.password, 12);

      const newUser = new Register({
        ...input,
        password: hashpw,
      });

      const User = await newUser.save();
      return User;
    },

    //***login user

    loginUser: async (_, { input }) => {
      //*** Incase in future we use OTP  */

      // const findUser = await Register.findOne({ phoneno: input });

      // if (!findUser) {
      //   throw new GraphQLError("User not exist with such mobile number..!!", {
      //     extensions: {
      //       code: 404,
      //     },
      //   });
      // }

      const findUser = await Register.findOne({ email: input.email });

      if (!findUser) {
        throw new GraphQLError("user not exist with such email..!!", {
          extensions: {
            code: 404,
          },
        });
      }

      const verifyPassword = await bcrypt.compare(
        input.password,
        findUser.password
      );

      if (!verifyPassword) {
        throw new GraphQLError("email or password wrong..!!", {
          extensions: {
            code: 404,
          },
        });
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

    forgetPassword: async (_, { email }) => {
      const findUser = await Register.findOne({ email: email });

      if (!findUser) {
        throw new GraphQLError("user not exist with such email..!!", {
          extensions: {
            code: 404,
          },
        });
      }

      const userId = await findUser.id;

      const payload = {
        id: userId,
        email: findUser.email,
      };

      const token = await jwt.sign(payload, secret_key, {
        expiresIn: "24h",
      });

      const info = transporter.sendMail({
        from: admin_email, // sender address
        to: findUser.email, // list of receivers
        subject: "new password...!!", // Subject line
        html: `<a href="http://192.168.0.164:${client_port}/newpassword?token=${token}">Click here to reset-password</a>`,
      });

      return findUser;
    },

    newPassword: async (_, { input, token }) => {
      const decode = await jwt.decode(token, secret_key);

      if (!decode) {
        throw new GraphQLError("Invalid token", {
          extensions: {
            code: 404,
          },
        });
      }

      const { id } = decode;

      const user = await Register.findById(id);

      const cnfPassword = input.newPassword === input.confirmPassword;

      if (!cnfPassword) {
        throw new GraphQLError(
          "Your password and confirmation password do not match",
          {
            extensions: {
              code: 401,
            },
          }
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

    updateUserProfile: async (_, { input }) => {
      const findUser = await Register.findById(input.id);

      if (!findUser) {
        throw new GraphQLError("invalid...", {
          extensions: {
            code: 404,
          },
        });
      }

      findUser.id = findUser.id;
      findUser.userName = findUser.userName;
      findUser.phoneno = findUser.phoneno;
      findUser.email = findUser.email;
      findUser.password = findUser.password;
      findUser.profilePicture = findUser.profilePicture;

      if (input.userName) {
        findUser.userName = input.userName;
      }
      if (input.profilePicture) {
        findUser.profilePicture = input.profilePicture;
      }
      
      const newUser = await findUser.save();

      return newUser;
    },
  },
};
