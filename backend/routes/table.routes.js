const tables = require("../controllers/table.controller");
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");

router.route("/delete/:id")
    .delete(verifyToken, allowedTo(userRoles.vendor), tables.deleteTable);
router.route("/add")
.post(verifyToken, allowedTo(userRoles.vendor), tables.addTable);
module.exports =router;                