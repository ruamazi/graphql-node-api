import { mergeResolvers } from "@graphql-tools/merge";
import { userResolver } from "./userResolver.js";
import { transactionResolver } from "./transactionResolver.js";

export const mergedResolvers = mergeResolvers([
  userResolver,
  transactionResolver,
]);
