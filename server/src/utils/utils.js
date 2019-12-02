const { getJobCollection } = require('../mongo-setup')

const addJobToQueue = async (url, socket_id, user_id) => {
  let collection = getJobCollection();
  await collection.insertOne({
    url: url,
    socket_id: socket_id,
    user_id: user_id,
    processing: false,
    timestamp: (+ new Date()),
  });
}

const addJobInProcess = async (url, socket_id, user_id) => {
  let collection = getJobCollection();
  await collection.insertOne({
    url: url,
    socket_id: socket_id,
    user_id: user_id,
    processing: true,
    timestamp: (+ new Date()),
  });
}

const updateJobToInProgress = async (url, socket_id, user_id) => {
  let collection = getJobCollection();
  await collection.findOneAndUpdate({
    url: url,
    socket_id: socket_id,
    user_id: user_id,
    processing: false,
  }, {
    $set: {
      processing: true
    }
  });
}

// Remove job from collection once finished
const finishJob = async (socket_id) => {
  let collection = getJobCollection();
  let finished = await collection.findOneAndDelete({
    socket_id: socket_id,
    processing: true
  });
  console.log(`Removed finished job ${JSON.stringify(finished)}`);
}

const isSocketProcessing = async (socket_id) => {
  let collection = getJobCollection();
  let jobs = await collection.find({
    socket_id: socket_id,
    processing: true
  }).toArray();

  if (!jobs.length) {
    return false;
  }
  return true;
}

const getNextJob = async (socket_id) => {
  let collection = getJobCollection();
  let jobs = await collection.find({
    socket_id: socket_id,
    processing: false
  }).sort({
    timestamp: 1
  }).toArray();

  if (!jobs.length) {
    return null;
  }
  return jobs[0];
}

module.exports = { addJobToQueue, getNextJob, finishJob, addJobInProcess, isSocketProcessing, updateJobToInProgress }