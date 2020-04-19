const request = require('request');

class utils {
    static request(options) {
        return(request(options, function (error, response, body) {
            if (error) {
                console.error('error:', error);
            } else {
                console.log('Response: StatusCode:', response && response.statusCode);
                console.log('Response: Body: Length: %d. Is buffer: %s', body.length, (body instanceof Buffer));
                console.log(body);
                return body;
            }
        }));
    }
}

module.exports = utils;