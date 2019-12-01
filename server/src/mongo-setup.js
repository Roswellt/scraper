const dotenv = require('dotenv')
const MongoClient = require("mongodb").MongoClient;

const DATABASE_NAME = "scraper" 
const CLIENTS_COLLECTION = "clients"
const RRCOUNT_COLLECTION = "counter"

let database;

dotenv.config();
const setupConnection = () => {

  return new Promise((resolve, reject) => {
    const { DATABASE_URL } = process.env;

    MongoClient.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
      if(error) {
        console.log(error);
        throw error;
      }
      database = client.db(DATABASE_NAME);
      setupRRCount();
      console.log("Connected to `" + DATABASE_NAME + "`!");
      resolve();
    })
  });
}

const getClientCollection = () => {
  return database.collection(CLIENTS_COLLECTION);
}

const getRRCountCollection = () => {
  return database.collection(RRCOUNT_COLLECTION)
}

const getRRCount = async () => {
  let collection = getRRCountCollection();
  result = await collection.findOne({id: "counter"});
  console.log(result);
  return result;
}

const updateRRCount = async (counter) => {
  let collection = getRRCountCollection();
  collection.updateOne({
    id: "counter"
  }, { $set: {
    id: "counter",
    value: counter
  }})
}

const setupRRCount = async () => {
  let collection = getRRCountCollection()
  result = await collection.findOne({id: "counter"});
  if(result === null) {
    collection.insertOne({
      id: "counter",
      value: 0
    });
  }
}

module.exports = { setupConnection, getClientCollection, getRRCountCollection, getRRCount, updateRRCount };