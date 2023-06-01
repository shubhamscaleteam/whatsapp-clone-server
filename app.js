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
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import path from "path";

// *** imported files...!!

import typeDefs from "./src/schema/typeDefs/indexTypedef.js";
import resolvers from "./src/schema/resolvers/indexResolver.js";

const port = process.env.PORT || 4000;
const app = express();
const httpServer = http.createServer(app)
const secret_key = process.env.SECRET_KEY;
const schema = makeExecutableSchema({ typeDefs, resolvers });

// app.use(express.static(path.join("public")));
app.use(express.json({ limit: "50mb" }));
app.use(express.json());

// *** websoket server

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

// ***setup apollo-server...!!

const server = new ApolloServer({
  schema,
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
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
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
