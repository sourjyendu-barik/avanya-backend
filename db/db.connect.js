const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MongoUri = process.env.MONGODB;

const initializeDb = async () => {
  await mongoose
    .connect(MongoUri)
    .then(() => console.log("DB connected successfully"))
    .catch(() => console.log("error while connecting db."));
};

module.exports = initializeDb;
