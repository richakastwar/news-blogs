const express = require('express');
const router = express.Router();

const siteController = require('../controllers/siteControllers');
const loadCommonData = require('../middleware/loadCommonData');

router.use(loadCommonData);

router.get('/',siteController.index);
router.get('/category/:name',siteController.articleByCategories);
router.get('/single/:id',siteController.singleArticle);
router.get('/serach',siteController.search);
router.get('/author/:name',siteController.author);
router.post('/single/:id/comment',siteController.addcomment);




/* =======================
   404 HANDLER (LAST ROUTE)
======================= */
router.use((req, res,next) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    
  });
});

//500 Error Handle
router.use((err, req, res, next) => {
    console.error(err);

    const status = err.status || 500;

    res.status(status).render('errors', {
        title: err.message || 'Something Went Wrong',
        status
    });
});

module.exports = router;
