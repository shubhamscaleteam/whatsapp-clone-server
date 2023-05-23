import Message from "../../models/messageModel.js";

export default {
  Query: {
    userMessage: async (_, { filter }) => {
      const allMessage = await Message.find({
        $and: [
          { deleted: false },
          {
            $or: [
              { userId: filter.userId, reciverId: filter.reciverId },
              { userId: filter.reciverId, reciverId: filter.userId },
            ],
          },
        ],
      })
        .populate("userId")
        .populate("reciverId");

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

      return messagebyUser;
    },

    deleteMessage: async (_, { input }) => {
      //  await Message.findByIdAndDelete(input.messageId) // single message delete

      await Message.updateMany({
        _id: { $in: input.messageId },
      },
      {deleted:true}
      );

      return {
        info: "message has been deleted",
      };
    },
  },
};
