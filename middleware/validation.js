const { body } = require('express-validator');

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^\S+$/)
    .withMessage('Username must not contain spaces')
    .isLength({ min: 5, max: 15 })
    .withMessage('Username must be between 5 and 15 characters long'),

    body('password')
    .trim()
    .notEmpty()
    .withMessage('Password  is required')
    .isLength({ min: 5, max: 12 })
    .withMessage('Password must be between 5 and 12 characters long')
];

const userValidation = [
  body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('Username must be between 5 and 20 characters long'),
    
    
     body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^\S+$/)
    .withMessage('Username must not contain spaces')
    .isLength({ min: 5, max: 12 })
    .withMessage('Username must be between 5 and 12 characters long'),


    body('password')
    .trim()
    .notEmpty()
    .withMessage('Password  is required')
    .isLength({ min: 5, max: 12 })
    .withMessage('Password must be between 5 and 12 characters long'),


    body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is Required')
    .isIn(['author','admin'])
    .withMessage('ROle must be Admin aur Author'),


];

const userUpdateValidation = [
   body('fullname')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('Username must be between 5 and 20 characters long'),
    
    
     body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^\S+$/)
    .withMessage('Username must not contain spaces')
    .isLength({ min: 5, max: 12 })
    .withMessage('Username must be between 5 and 12 characters long'),


    body('password')
    .optional({checkFalsy : true})
    .isLength({ min: 5, max: 12 })
    .withMessage('Password must be between 5 and 12 characters long'),


    body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is Required')
    .isIn(['author','admin'])
    .withMessage('ROle must be Admin aur Author'),
]

const categoryValidation = [
   body('name')
    .trim()
    .notEmpty()
    .withMessage('Category Name is required')
    .isLength({ min: 3, max: 12 })
    .withMessage('Category Name must be between 3 and 12 characters long'),

     body('description')
     .isLength({max: 100 })
     .withMessage('Description must be at most 100 characters long'),
];



const articleValidation = [

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters long'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be between 50 and 100 characters long'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
];

module.exports = { articleValidation };


module.exports = { articleValidation };



module.exports = {
  loginValidation,
  userValidation,
  userUpdateValidation,
  categoryValidation,
  articleValidation 
};



