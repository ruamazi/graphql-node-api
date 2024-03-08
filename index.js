import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildContext } from "graphql-passport";
import { mergedResolvers } from "./resolvers/index.js";
import { mergedTypeDefs } from "./typeDefs/index.js";
import connectDB from "./db/connectDB.js";
import { configurePassport } from "./passport/passportConfig.js";

const port = process.env.PORT || 3030;
const app = express();
const httpServer = http.createServer(app);
configurePassport();

const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
store.on("error", (error) => console.log(error));

app.use(
  session({
    secret: process.env.SEC,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store: store,
  }),
  passport.initialize(),
  passport.session()
);

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  "/graphql",
  cors({
    credentials: true,
    origin: process.env.FRONT_URL,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

app.use("/", (req, res) => {
  res.json({
    message: `Welcome to graphql api, server is on http://localhost:${port}/graphql`,
  });
});

httpServer.listen(port, () => {
  connectDB();
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
