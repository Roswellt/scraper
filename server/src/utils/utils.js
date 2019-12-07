let mongo = require("../mongo-setup");

const BATTERY_COEFFICIENT = 0.6;
const TOTAL_MEMORY_COEFFICIENT = 0.4;
const BATTERY_POWER_REQUIRED = 0.025;

const _estimatePowerUse = (job, client) => {
    return Math.random() * 0.02;
}

const roundRobin = (clients, counter) => {
    console.log(clients, counter);
    let client = clients[counter % clients.length];
    if (client === undefined) {
        return undefined;
    }
    counter = (counter + 1) % clients.length;
    mongo.updateRRCount(counter);
    console.log(`Client chosen ${client}`);
    return client;
}


const customAlgo = (clients) => {
    let weightedSum = Number.NEGATIVE_INFINITY;
    let allocated = null
    let vmSum = null
    clients.forEach(elem => {
        if (!elem.powerState.length) {
            vmSum = elem.totalMem * TOTAL_MEMORY_COEFFICIENT
            console.log(vmSum);
        } else {
            vmSum = (elem.powerState.batteryLevel * BATTERY_COEFFICIENT) + (elem.totalMem * TOTAL_MEMORY_COEFFICIENT)
        }
        if (vmSum > weightedSum) {
            weightedSum = vmSum;
            allocated = elem;
        }
    })
    console.log(`Client chosen ${allocated}`);
    return allocated;
}

const pabfd = (job, clients) => {
    let minPower = Number.MAX_VALUE;
    let allocated = null;
    // decreasing utilization aka power
    clients.sort((c1, c2) => {
        if (!c1.powerState) c1.powerState = {batteryLevel: 0}
        if (!c2.powerState) c2.powerState = {batteryLevel: 0}
        return c2.powerState.batteryLevel - c1.powerState.batteryLevel
    })
    clients.forEach(client => {
        if (client.powerState.batteryLevel > BATTERY_POWER_REQUIRED) {
            let power = _estimatePowerUse(job, client);
            if (power < minPower) {
                minPower = power;
                allocated = client;
            }
        }
    })
    return allocated
}

module.exports = { roundRobin, pabfd, customAlgo };