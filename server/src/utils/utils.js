let counter = 0

const roundRobin = (clients) => {
    console.log(clients, counter);
    let client = clients[counter % clients.length];
    if (client === undefined) {
        return undefined;
    }
    counter = (counter + 1) % clients.length;
    console.log(`Client chosen ${client}`);
    return client;
}


module.exports = { roundRobin };