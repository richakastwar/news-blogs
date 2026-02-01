const express = require('express');
const router = express.Router();

const {
  login,
  adminlogin,
  Logout,
  allUsers,
  addUserPage,
  addUser,
  updateUserPage,
  updateUser,
  deleteUser,
  dashboard,
  settings,
  saveSettings
} = require('../controllers/userControllers');

const {
  allCategories,
  addCategoryPage,
  addCategory,
  updateCategoryPage,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryControllers');

const {
  allArticles,
  addArticlePage,
  addArticle,
  updateArticlePage,
  updateArticle,
  deleteArticle
} = require('../controllers/articleControllers');

const {
  allComments,
  commentUpdateStatus,
  deleteComment

} = require('../controllers/commentsControllers');

const isLogin = require('../middleware/isLogin');
const isAdmin = require('../middleware/isAdmin');
const upload = require('../middleware/multer');
const isValid = require('../middleware/validation');
const imageValidation = require('../middleware/imageValidation');

/* =======================
   AUTH ROUTES
======================= */
router.get('/', login);
router.post('/index', isValid.loginValidation, adminlogin);
router.get('/logout', Logout);

/* =======================
   DASHBOARD & SETTINGS
======================= */
router.get('/dashboard', isLogin, dashboard);
router.get('/settings', isLogin, isAdmin, settings);
router.post(
  '/save-settings',
  isLogin,
  isAdmin,
  upload.single('siteLogo'),
  saveSettings
);

/* =======================
   USER CRUD
======================= */
router.get('/users', isLogin, isAdmin, allUsers);
router.get('/add-user', isLogin, isAdmin, addUserPage);
router.post('/add-user', isLogin, isAdmin, isValid.userValidation,addUser);
router.get('/update-user/:id', isLogin, isAdmin, updateUserPage);
router.post('/update-user/:id', isLogin, isAdmin, isValid.userUpdateValidation,updateUser);
router.delete('/delete-user/:id', isLogin, isAdmin, deleteUser);

/* =======================
   CATEGORY CRUD
======================= */
router.get('/categories', isLogin, isAdmin, allCategories);
router.get('/add-category', isLogin, isAdmin, addCategoryPage);
router.post('/add-category', isLogin, isAdmin,isValid.categoryValidation, addCategory);
router.get('/update-category/:id', isLogin, isAdmin, updateCategoryPage);
router.post('/update-category/:id', isLogin, isAdmin, isValid.categoryValidation,updateCategory);
router.delete('/delete-category/:id', isLogin, isAdmin, deleteCategory);

/* =======================
   ARTICLE CRUD
======================= */
router.get('/articles', isLogin, allArticles);
router.get('/add-article', isLogin, addArticlePage);
router.post(
  '/add-article',
  isLogin,                    // 1️⃣ user login check
  upload.single('image'),     // 2️⃣ image upload
  isValid.articleValidation,  // 3️⃣ title, content, category check
  imageValidation,            // 4️⃣ image hai ya nahi check
  addArticle                  // 5️⃣ controller
);
router.get('/update-article/:id', isLogin, updateArticlePage);
router.post(
  '/updated-article/:id',
  isLogin,
  upload.single('image'),        // image optional
  isValid.articleValidation,     // title, content, category
  updateArticle
);

router.delete('/delete-article/:id', isLogin, deleteArticle);

/* =======================
   COMMENTS CRUD
======================= */
router.get('/comments', isLogin, allComments);
router.put('/comment-update-status/:id', isLogin, commentUpdateStatus);
router.delete('/delete-comment/:id', isLogin, deleteComment);

/* =======================
   404 HANDLER (LAST ROUTE)
======================= */
router.use((req, res) => {
  if (res.headersSent) return;

  res.status(404).render('admin/404', {
    title: '404 Not Found',
    role: req.role
  });
});

/* =======================
   500 ERROR HANDLER
======================= */
router.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Invalid Mongo ObjectId
  if (err.name === 'CastError') {
    err.status = 404;
    err.message = 'Resource not found';
  }

  const status = err.status || 500;
  let view;

  switch (status) {
    case 401:
      view = 'admin/401';
      break;
    case 404:
      view = 'admin/404';
      break;
    default:
      view = 'admin/500';
  }

  res.status(status).render(view, {
    title: err.message || 'Something went wrong',
    role: req.role
  });
});

module.exports = router;
