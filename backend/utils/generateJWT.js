const jwt = require('jsonwebtoken');

module.exports = async(payload) => {
    const token = await jwt.sign(payload, process.env.JWT_SCREET, {expiresIn:'120m'});
    return token; 
};