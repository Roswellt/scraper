module.exports = function( app ) {

    const index = require('./index');
    const clients = require('./clients');
    const scraper = require('./scraper')

    app.use('/', index);
    app.use('/clients', clients)
    app.use('/scraper-job/', scraper)

}