import passport from "passport";
import bcrypt from "bcryptjs";
import { GraphQLLocalStrategy } from "graphql-passport";
import User from "../models/userSchema.js";

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    console.log("serializeUser func");
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("deserializeUser - func");
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("Invalid username or password");
      }
      done(null, user);
    } catch (err) {
      console.log(err);
      done(err);
    }
  });
  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid username or password");
        }
        const validPassword = bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error("Invalid username or password");
        }
        return done(null, user);
      } catch (err) {
        console.log(err);
        return done(err);
      }
    })
  );
};
