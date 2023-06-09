import GroupMessage from "../../models/groupMessageModel.js";
import Group from "../../models/groupModel.js";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export default {
  Query: {
    // *** user who is login all group

    userAllGroup: async (_, { userId }) => {
      const allGroups = await Group.find({ member: userId })
        .populate("creator")
        .populate("member");

      return allGroups;
    },

    // *** group by id

    groupbyId: async (_, { reciverId }) => {
      const groupById = await Group.findById(reciverId)
        .populate("creator")
        .populate("member");

      return groupById;
    },

    // *** group all message

    groupAllMessage: async (_, { reciverId, userId }) => {
      const groupAllMessage = await GroupMessage.find({
        $and: [{ deletedBy: { $ne: userId } }, { reciverId }],
      })
        .populate("userId")
        .populate({
          path: "reciverId",
          populate: [
            {
              path: "member",
            },
          ],
        });
      return groupAllMessage;
    },
  },

  Mutation: {
    // *** create group

    createGroupOfUser: async (_, { input }) => {
      const groupData = await Group.create(input);

      await groupData.populate("creator");

      await groupData.populate("member");

      return groupData;
    },

    // *** create group message

    createGroupMessage: async (_, { input }) => {
      const groupMessage = await GroupMessage.create(input);

      pubsub.publish("GROUP_MESSAGE", {
        groupMessageCreated: groupMessage,
      });

      return groupMessage;
    },

    // *** delete group message

    deleteGroupMessage: async (_, { input }) => {
      await GroupMessage.updateMany(
        {
          _id: { $in: input.messageId },
        },
        { $set: { deleted: true }, $push: { deletedBy: input.deletedBy } }
      );

      pubsub.publish("DELETE_GROUP_MESSAGE");

      return {
        info: "message has been deleted",
      };
    },
  },

  // *** subscripation

  Subscription: {
    groupMessageCreated: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator("GROUP_MESSAGE");

        return pubsubSubscripation;
      },
    },
    groupDeleteMessage: {
      subscribe: () => {
        const pubsubSubscripation = pubsub.asyncIterator(
          "DELETE_GROUP_MESSAGE"
        );

        return pubsubSubscripation;
      },
    },
  },
};
