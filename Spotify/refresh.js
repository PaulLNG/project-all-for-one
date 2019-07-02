const spotifyEndpoint = 'https://accounts.spotify.com/api/token';

var utils = require('./utils');

module.exports = async (req, res) => {
	try {
		// ensure refresh token parameter
		if (!req.body.refresh_token) {
			res.status(400).json({error: 'Refresh token is missing from body'});
			return;
		}

		// decrypt token
		const refreshToken = utils.decrypt(req.body.refresh_token);
		// build request data
		const reqData = {
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		};
		// get new token from Spotify API
		const { response, result } = await utils.postRequest(spotifyEndpoint, reqData);

		// encrypt refresh_token
		if (result.refresh_token) {
			result.refresh_token = utils.encrypt(result.refresh_token);
		}

		// send response
		res.status(response.statusCode).json(result);
	}
	catch(error) {
		if(error.response) {
			res.status(error.response.statusCode);
		}
		else {
			res.status(500);
		}
		if(error.data) {
			res.send(error.data);
		}
		else {
			res.send("");
		}
    }
};