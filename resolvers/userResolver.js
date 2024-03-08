import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import { userPic } from "../utils/userPic.js";
import Transaction from "../models/transactionSchema.js";

export const userResolver = {
  Query: {
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (err) {
        console.log("Error in user query", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
    authUser: async (_, {}, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        console.log("Error in authUser", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
  },
  Mutation: {
    signUp: async (_, { input }, context) => {
      const { username, gender, name, password } = input;
      if (
        !username ||
        username.legth < 3 ||
        username.trim().length === 0 ||
        username.includes(" ")
      ) {
        throw new Error("All fields required");
      }
      try {
        const userExists = await User.findOne({ username });
        if (userExists) {
          throw new Error("User already exists");
        }
        if (!gender || !name || !password) {
          throw new Error("All fields required");
        }
        const salt = await bcrypt.genSalt(8);
        const hashedPsw = await bcrypt.hash(password, salt);

        const newUser = new User({
          username,
          name,
          gender,
          password: hashedPsw,
          profilePicture: userPic(gender, username),
        });
        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (err) {
        console.log("Error in signUp", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
    login: async (_, { input }, context) => {
      const { username, password } = input;
      if (!username || !password) throw new Error("All fields are required");
      try {
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });
        await context.login(user);
        return user;
      } catch (err) {
        console.log("Error in login", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
    logout: async (_, {}, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) {
            console.log(err);
          }
        });
        context.res.clearCookie("connect.sid");
        return { message: "Logged out successfully" };
      } catch (err) {
        console.log("Error in logout", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
  },
  //relashionship in graphql
  User: {
    transactions: async (parent) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (err) {
        console.log("Error in user transaction resolver", err);
        throw new Error(err.message || "Internal Server error");
      }
    },
  },
};
