import GroupMessage from "../../models/groupMessageModel.js";
import Message from "../../models/messageModel.js";
import { PubSub } from "graphql-subscriptions";
import Register from "../../models/registerModel.js";

const pubsub = new PubSub();

export default {
  Query: {
    userMessage: async (_, { filter }) => {
      const allMessage = await Message.find({
        $and: [
          {
            deletedBy: { $ne: filter.userId },
            deletedFrom: { $ne: filter.reciverId },
          },

          {
            $or: [
              { userId: filter.userId, reciverId: filter.reciverId },
              { userId: filter.reciverId, reciverId: filter.userId },
            ],
          },
        ],
      })
        .populate("userId")
        .populate("reciverId")
        .populate("deletedBy");

      await Message.updateMany(
        {
          $and: [
            { deleted: false },

            { userId: filter.reciverId, reciverId: filter.userId },
          ],
        },
        { isread: true }
      );

      pubsub.publish("ALL_MESSAGE", {
        readMessage: allMessage,
      });

      return allMessage;
    },

    singleMessage: async (_, { id }) => {
      const message = await Message.findById(id)
        .populate("userId")
        .populate("reciverId");

      if (message === null) {
        const message = await GroupMessage.findById(id)
          .populate("userId")
          .populate("reciverId");

        return message;
      }

      return message;
    },
  },

  Mutation: {
    createMessage: async (_, { input }, { id }) => {
      // if (!id) {
      //     throw new GraphQLError("Unauthorize...!!", {
      //       extensions: {
      //         code: 401,
      //       },
      //     });
      //   }

      const messagebyUser = await Message.create(input);

      await messagebyUser.populate("userId");

      await messagebyUser.populate("reciverId");

      pubsub.publish("MESSAGE_CREATED", {
        messageCreated: messagebyUser,
      });

      return messagebyUser;
    },

    deleteMessage: async (_, { input }) => {
      //  await Message.findByIdAndDelete(input.messageId) // single message delete

      await Message.updateMany(
        {
          _id: { $in: input.messageId },
        },
        {
          $set: { deleted: true },
          $addToSet: {
            deletedBy: input.deletedBy,
            deletedFrom: input.deletedFrom,
          },
          // $pull: { reciverId: input.deletedFrom },
        }
      );

      pubsub.publish("DELETE_MESSAGE", {
        deleteMessage: "message deleted",
      });

      return {
        info: "message has been deleted",
      };
    },

    forwardMessage: async (_, { input }) => {
      const userMessage = new Object({
        message: input.message,
        userId: input.userId,
        reciverId: input.reciverId,
        isForward: true,
      });

      const groupMessage = new Object({
        message: input.message,
        userId: input.userId,
        reciverId: input.groupId,
        isForward: true,
      });

      if (userMessage.reciverId.length !== 0) {
        await Message.create(userMessage);
      }

      if (groupMessage.reciverId.length !== 0) {
        await GroupMessage.create(groupMessage);
      }

      pubsub.publish("FORWARD_MESSAGE", {
        info: "forward",
      });

      return { info: "message forwared" };
    },
  },

  Subscription: {
    readMessage: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator("ALL_MESSAGE");

        return pubsubSubscripation;
      },
    },
    messageCreated: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator("MESSAGE_CREATED");

        return pubsubSubscripation;
      },
    },
    deleteMessage: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator("DELETE_MESSAGE");

        return pubsubSubscripation;
      },
    },
  },
};
