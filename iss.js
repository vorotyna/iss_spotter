/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

const fetchMyIP = function(callback) {

  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      callback(`There was an error: ${error}`, null);
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    } else {
      const ipAddress = JSON.parse(body).ip;
      callback(null, ipAddress);
    }

  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    if (error) {
      callback(`There was an error: ${error}`, null);
      return;
    }

    const p = JSON.parse(body);

    if (!p.success) {
      const message = `Success status was ${p.success}. Server message says: ${p.message} when fetching for IP ${p.ip}`;
      callback(Error(message), null);
      return;
    }


    const { latitude, longitude } = p;

    callback(null, { latitude, longitude });

  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(`There was an error: ${error}`, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const p = JSON.parse(body);

    if (p.message !== 'success') {
      const message = `Message status was ${p.message}.`;
      callback(Error(message), null);
      return;
    }

    callback(null, p.response);

  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

const mynameisliso = function(liso) {
  return liso;
};
module.exports = { fetchCoordsByIP, fetchISSFlyOverTimes, fetchMyIP, nextISSTimesForMyLocation };

