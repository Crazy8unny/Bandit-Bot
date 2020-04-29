const req = require('request');

class utils {
     static request(options) {
        return(req(options, function (error, response, body) {
            if (error) {
                console.error('error:', error);
            } else {
                return response;
            }
        }));
    }
}

module.exports = utils;