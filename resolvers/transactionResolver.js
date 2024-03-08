import Transaction from "../models/transactionSchema.js";
import User from "../models/userSchema.js";

export const transactionResolver = {
  Query: {
    transactions: async (_, {}, context) => {
      if (!context.getUser()) throw new Error("Unauthorized");
      const userId = context.getUser()._id;
      try {
        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (err) {
        console.error("Error in transactions query:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
          throw new Error("Not found");
        }
        return transaction;
      } catch (err) {
        console.error("Error in transaction query:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    categoryStatistics: async (_, {}, context) => {
      if (!context.getUser()) {
        throw new Error("Unauthorized");
      }
      const userId = context.getUser()._id;
      try {
        const transactions = await Transaction.find({ userId });
        const catMap = {};
        transactions.forEach((each) => {
          if (!catMap[each.category]) {
            catMap[each.category] = 0;
          }
          catMap[each.category] += each.amount;
        });
        return Object.entries(catMap).map(([category, totalAmount]) => ({
          category,
          totalAmount,
        }));
      } catch (err) {
        console.error("Error in category statistics query:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
  Mutation: {
    createTransaction: async (parent, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (err) {
        console.error("Error updating transaction:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const transactionToDelete = await Transaction.findByIdAndDelete(
          transactionId
        );
        return transactionToDelete;
      } catch (err) {
        console.error("Error deleting transaction:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
  //relationship in graphql similar to populate methon in mongoose
  Transaction: {
    user: async (parent) => {
      const { userId } = parent;
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.log(err);
        throw new Error("Error getting user");
      }
    },
  },
};
