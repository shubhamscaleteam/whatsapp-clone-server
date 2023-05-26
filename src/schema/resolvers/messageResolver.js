import Message from "../../models/messageModel.js";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export default {
  Query: {
    userMessage: async (_, { filter }) => {
      const allMessage = await Message.find({
        $and: [
          { deletedBy: { $ne: filter.userId } },
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
        { $set: { deleted: true }, $push: { deletedBy: input.deletedBy } }
      );

      pubsub.publish("DELETE_MESSAGE", {
        deleteMessage: "message deleted",
      });

      return {
        info: "message has been deleted",
      };
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
