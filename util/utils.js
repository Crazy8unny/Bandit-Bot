export function getImage(url) {
    let options = {
        url: url,
        method: "get",
        encoding: null
    };
    return (request(options, function (error, response, body) {
        if (error) {
            console.error('error:', error);
        }
        else {
            console.log('Response: StatusCode:', response && response.statusCode);
            console.log('Response: Body: Length: %d. Is buffer: %s', body.length, (body instanceof Buffer));
            return body;
        }
    }));
}