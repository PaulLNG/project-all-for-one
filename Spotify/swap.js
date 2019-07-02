const spClientCallback = process.env.SPOTIFY_CLIENT_CALLBACK;
const spotifyEndpoint = 'https://accounts.spotify.com/api/token';

var utils = require('./utils');

module.exports = async (req, res) => {
	try {
		// build request data
		const reqData = {
			grant_type: 'authorization_code',
			redirect_uri: spClientCallback,
			code: req.body.code
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
		console.log(error);
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