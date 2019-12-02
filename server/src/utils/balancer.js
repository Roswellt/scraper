const { updateRRCount, getRRCount } = require("../mongo-setup");

const BATTERY_COEFFICIENT = 1
const TOTAL_MEMORY_COEFFICIENT = 0.4

const roundRobin = async (clients) => {
    let result = await getRRCount();
    let counter = result.value;

    console.log(clients, counter);
    let client = clients[counter % clients.length];
    if (!clients.length) {
        return null;
    }
    counter = isNaN(counter) ? 0 : (counter + 1) % clients.length;
    updateRRCount(counter);
    console.log(`Client chosen ${client}`);
    return client;
}


const customAlgo = (clients) => {
    let weightedSum = Infinity;
    let allocated = null
    let vmSum = null
    clients.forEach(elem => {
        if (!elem.powerState.length) {
            vmSum = elem.totalMem * TOTAL_MEMORY_COEFFICIENT
            console.log(vmSum);
        } else {
            vmSum = (elem.powerState.batteryLevel * BATTERY_COEFFICIENT) + (elem.totalMem * TOTAL_MEMORY_COEFFICIENT)
        }
        if (vmSum < weightedSum) {
            weightedSum = vmSum;
            allocated = elem;
        }
    })
    console.log(`Client chosen ${allocated}`);
    return allocated;
}


module.exports = { roundRobin, customAlgo };