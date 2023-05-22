import "dotenv/config";
import "./src/config/db.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

// *** imported files...!!

import typeDefs from "./src/schema/typeDefs/indexTypedef.js";
import resolvers from "./src/schema/resolvers/indexResolver.js";

const port = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app);
const secret_key = process.env.SECRET_KEY;

app.use(express.json());

//*** create context to receive headers..!!

// const context = async ({ req }) => {

//   const  token  = req.headers.authorization;

//   if (token) {

//     const decode = await jwt.verify(token, secret_key);

//     const { id } = decode;

//     return { id };
//   }
// };

// ***setup apollo-server...!!

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (formattedError, error) => {
    // Return a different error message

    if (formattedError.extensions.code === "BAD_USER_INPUT") {
      return {
        ...formattedError,
        message: "Fields can't be empty..",
      };
    }
    if (
      formattedError.message.startsWith(
        "Context creation failed: invalid token"
      )
    ) {
      return {
        ...formattedError,
        message: "You can not enter without login..",
      };
    }
    return formattedError;
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// ***separating nodejs and graphql path...!!

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization;

      if (token) {
        const decode = await jwt.verify(token, secret_key);

        const { id } = decode;

        return { id };
      }
    },
  })
);

// ***starting server...!!

await new Promise((resolve) => {
  httpServer.listen({ port: port }, resolve);
});

console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
