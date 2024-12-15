const {body} = require('express-validator');

const validationSchema =  ()=>{
    return   [body('title')
    .notEmpty()
    .withMessage("title is required")
    .isLength({min:2}).
    withMessage("at least two char"),
    body('price')
    .notEmpty()
    .withMessage("price is required")
    .isLength({min:2})
    .withMessage("at least two")
    ]
};

module.exports = {
    validationSchema
}