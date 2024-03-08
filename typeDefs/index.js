import { mergeTypeDefs } from "@graphql-tools/merge";
import { userTypeDef } from "./userTypeDef.js";
import { transactionTypeDef } from "./transactionTypeDef.js";

export const mergedTypeDefs = mergeTypeDefs([userTypeDef, transactionTypeDef]);
