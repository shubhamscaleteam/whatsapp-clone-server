import Register from "../../models/registerModel.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const secret_key = process.env.SECRET_KEY;

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

      const hashpw = await bcrypt.hash(input.password, 12);

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
    },

    createGroupOfUser: async (_, { input }) => {
      const groupData = await Group.create(input);

      await groupData.populate("creator")

      await groupData.populate("member")

      return groupData;
    },
  },
};
