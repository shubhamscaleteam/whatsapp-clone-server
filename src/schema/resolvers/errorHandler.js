import { GraphQLError } from "graphql";

// *** global error handlar..

export const errorHandle = (message, code) => {
  throw new GraphQLError(message, {
    extensions: {
      code: code,
    },
  });
};
