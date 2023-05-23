import GroupMessage from "../../models/groupMessageModel.js";
import Group from "../../models/groupModel.js";

export default {
  Query: {
    userAllGroup: async (_, { userId }) => {
      const allGroups = await Group.find({ member: userId })
        .populate("creator")
        .populate("member");

      return allGroups;
    },

    groupbyId: async (_, { groupId }) => {
      const groupById = await Group.findById(groupId)
        .populate("creator")
        .populate("member");

      return groupById;
    },

    groupAllMessage: async (_, { groupId }) => {
      const groupAllMessage = await GroupMessage.find({
        $and: [{ groupId }, { deleted: false }],
      })
        .populate("userId")
        .populate({
          path: "groupId",
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
    createGroupOfUser: async (_, { input }) => {
      const groupData = await Group.create(input);

      await groupData.populate("creator");

      await groupData.populate("member");

      return groupData;
    },

    createGroupMessage: async (_, { input }) => {
      const groupMessage = await GroupMessage.create(input);

      return groupMessage;
    },

    deleteGroupMessage: async (_, { input }) => {
      await GroupMessage.updateMany(
        {
          _id: { $in: input.messageId },
        },
        { deleted: true }
      );

      return {
        info: "message has been deleted",
      };
    },
  },
};
