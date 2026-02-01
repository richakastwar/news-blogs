const mongoose = require('mongoose');
const newsModel = require('../models/News');
const userModel = require('../models/User');
const{validationResult} = require('express-validator');
const categoryModel = require('../models/Category');
const fs = require('fs');
const path = require('path');
const createErrorMessage = require('../utils/error-message');

const allArticles = async (req, res,next) => {
  try {
    let articles;

    if (req.role === 'admin') {
      articles = await newsModel
        .find()
        .populate('author', 'fullname')
        .populate('category', 'name');
    } else {
      articles = await newsModel
        .find({ author: req.id })   
        .populate('author', 'fullname')
        .populate('category', 'name');
    }

    res.render('admin/articles', {
      role: req.role,
      articles
    });

  } catch (error) {
    // console.error("Error fetching articles:", error);
    // res.status(500).send("Internal Server Error");
      next(error);
  }
};


const addArticlePage = async (req, res,next) => {
    const Categories = await categoryModel.find();
    res.render('admin/articles/create',{role: req.role,Categories,errors:0});
}


 const addArticle = async (req, res, next) => {
const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path); 
    }

    const Categories = await categoryModel.find();   
    return res.render('admin/articles/create', {
      Categories,
      role: req.role,
      errors: errors.array()
    });
  }

  try {
    const { title, content, category } = req.body;

    const newArticle = new newsModel({
      title,
      content,
      category,
      author: req.id,
      image: req.file?.filename
    });

    await newArticle.save();
    res.redirect('/admin/articles');

  } catch (error) {
    next(error);
  }
  };

const updateArticlePage = async (req, res, next) => {
  const { id } = req.params;

  // 🔹 Invalid ObjectId → 404
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Article not found');
    error.status = 404;
    return next(error);
  }

  try {
    const article = await newsModel
      .findById(id)
      .populate('category', 'name')
      .populate('author', 'fullname');

    if (!article) {
      // const error = new Error('Article not found');
      // error.status = 404;
      // return next(error);
      return next(createErrorMessage('Article not Found',404));
    }

    if (req.role !== 'admin' && article.author._id.toString() !== req.id) {
      return res.status(403).send("Forbidden: You don't have permission to edit this article");
    }

    const categories = await categoryModel.find();

    res.render('admin/articles/update', {
      role: req.role,
      article,
      categories,
      errors:0
    });

  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  const id = req.params.id;

  // 🔹 Validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    // delete uploaded image if validation fails
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error(err);
      });
    }

    // safe session usage
    if (req.session) {
      req.session.errors = errors.array();
      req.session.article = req.body;
    }

    return res.redirect(`/admin/update-article/${id}`);
  }

  try {
    const { title, content, category } = req.body;

    const article = await newsModel
      .findById(id)
      .populate('author');

    if (!article) {
      return res.status(404).send('Article not found');
    }

    // 🔐 Authorization check
    if (
      req.role === 'author' &&
      req.id.toString() !== article.author._id.toString()
    ) {
      return res.status(403).send("Forbidden: You don't have permission");
    }

    // 🔹 Update fields
    article.title = title;
    article.content = content;
    article.category = category;

    // 🔹 Update image if new uploaded
    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        '../public/uploads',
        article.image
      );

      if (article.image && fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, err => {
          if (err) console.error(err);
        });
      }

      article.image = req.file.filename;
    }

    await article.save();
    return res.redirect('/admin/articles');

  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};


const deleteArticle = async (req, res,next) => {
    const id = req.params.id;
    try {
        const article =  await newsModel.findById(id);
        if (!article) {
            // return res.status(404).send("Article not found");
             return next(createErrorMessage('Article not Found',404));
        }
        if (req.role !== 'admin' && article.author._id.toString() !== req.id) {
      return res.status(403).send("Forbidden: You don't have permission to edit this article");
    }

    try{
       const oldImagePath = path.join(__dirname, '../public/uploads', article.image);
      fs.unlinkSync(oldImagePath);
    }catch(err){
        console.error("Error deleting image file:", err);
    }
    await article.deleteOne();
       res.json({ success: true, message: "Article deleted successfully" });
    } catch (error) {
        // console.error("Error deleting article:", error);
        // res.status(500).send("Internal Server Error");
        next(error);
    }
}

module.exports = {
    allArticles,
    addArticlePage,
    addArticle,
    updateArticlePage,
    updateArticle,
    deleteArticle
};










    
