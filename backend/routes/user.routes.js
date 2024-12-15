
const users = require("../controllers/user.controller");
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const appError = require("../utils/appError");
// Create a new Tutorial
router.route('/')
        .get(verifyToken,users.getAllUsers);
router.route('/getAllVendors')
        .get(verifyToken,allowedTo(userRoles.admin),users.getAllVendors);
router.route('/register')
        .post(users.register);
router.route('/addVendor')
        .post(verifyToken,allowedTo(userRoles.admin),users.addVendor);
router.route('/login')
        .post(users.login);
router.route('/updateVendor')
        .put(verifyToken,allowedTo(userRoles.vendor),users.updateVendor);
router.route('/deleteVendor/:id')
        .delete(verifyToken,allowedTo(userRoles.admin),users.deleteVendor);        
router.route('/getVendor')
        .get(verifyToken,allowedTo(userRoles.vendor),users.getVendorById);
module.exports =router;            