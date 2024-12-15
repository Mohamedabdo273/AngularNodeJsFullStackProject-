const restaurants = require("../controllers/restaurant.controller");
var router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const userRoles = require("../utils/userRoles");
const appError = require("../utils/appError");
const multer = require('multer');
/////////////////////////////////////////////////////////////////////////////////////////////
// Multer setup for file uploads
const diskStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName =`restaurant-${Date.now()}.${ext}`; 
        cb(null, fileName);
    }
});
const fileFilter = (req, file, cb) => {
    const imageType = file.mimetype.split('/')[0];
    if (imageType === 'image') {
        return cb(null, true);
    } else {
        return cb(appError.create('The file must be an image', 400), false);
    }
};
const upload = multer({ 
    storage: diskStorage,
    fileFilter
});
/////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management API
 */

/**
 * @swagger
 * /api/restaurants/viewAll:
 *   get:
 *     summary: View all restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurants
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.route("/viewAll").get(verifyToken, allowedTo(userRoles.admin, userRoles.customer), restaurants.viewAllRestaurants);
router.route("/add").post(verifyToken, allowedTo(userRoles.vendor),upload.single('image'), restaurants.addRestaurant);
router.route("/update/:id").put(verifyToken,allowedTo(userRoles.vendor),upload.single('image'),restaurants.updateRestaurant);
router.route("/delete/:id").delete(verifyToken,allowedTo(userRoles.vendor),restaurants.deleteresturant);  
/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management API
 */

/**
 * @swagger
 * /api/restaurants/viewVendor'sRestaurants:
 *   get:
 *     summary: View vendor's restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the vendor's restaurants
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.route("/viewVendor'sRestaurants").get(verifyToken, allowedTo(userRoles.vendor),restaurants.viewVendorRestaurants);
router.route("/searchByName").get(verifyToken,allowedTo(userRoles.vendor,userRoles.admin,userRoles.customer),restaurants.searchRestaurantByName);             
router.route("/searchByCategory").get(verifyToken,allowedTo(userRoles.customer),restaurants.searchRestaurantByCategory);             
router.route("/searchByLocation").get(verifyToken,allowedTo(userRoles.customer),restaurants.searchRestaurantByLocation);             
router.route("/getOne/:id").get(verifyToken, allowedTo(userRoles.customer,userRoles.vendor),restaurants.getRestaurantByID);
/////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;