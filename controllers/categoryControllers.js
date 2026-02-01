const categoryModel = require('../models/Category');
const newsModel = require('../models/News');
const { createErrorMessage } = require('../utils/error-message');
const{validationResult} = require('express-validator');

const allCategories =  async(req,res) => {
   const categories = await categoryModel.find();
    res.render('admin/categories',{ categories, role: req.role })
}
const addCategoryPage = async(req,res) => {
    res.render('admin/categories/create',{role: req.role,errors:0})
}


const addCategory = async (req, res) => {

  const errors = validationResult(req);
      if(!errors.isEmpty()){
      return res.render('admin/categories/create', {
              role: req.role,
              errors : errors.array()
      })
      }
  try{
    const { name, description } = req.body;

    const newCategory = new categoryModel({
      name,
      description
    });
    await newCategory.save();
    res.redirect('/admin/categories');
  }catch(error){
    console.log("ERROR:", error);
    res.status(400).send(error);
  }
};



const updateCategoryPage = async (req, res,next) => {
  const id = req.params.id;
try {
    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render('admin/categories/update', {
      category,
      role: req.role,
      errors:0
    });

  } catch (error) {
    // console.log("ERROR:", error);
    // return res.status(500).send("Server Error");
    next(error);
  }
};

const updateCategory = async(req,res,next) => {
  const id = req.params.id; const errors = validationResult(req);
      if(!errors.isEmpty()){
      const category = await categoryModel.findById(id); 
      return res.render('admin/categories/update', {
            category,
            role: req.role,
            errors : errors.array()
      })
      }


  // const { name, description } = req.body;

  try {
    const Category = await categoryModel.findById(id);
      

    if (!Category) {
      // return res.status(404).send("Category not found");
      return next(createErrorMessage('Category not found',404));
    }
    Category.name = req.body.name;
    Category.description = req.body.description;
    await Category.save();

    res.redirect('/admin/categories');
  } catch (error) {
    // console.log("ERROR:", error);
    // return res.status(500).send("Server Error");
    next(error);
  }
}


const deleteCategory = async (req, res, next) => {
  const id = req.params.id;

  try {
    // Check if category exists
    const category = await categoryModel.findById(id);

    if (!category) {
      return next(createErrorMessage('Category not found', 404));
    }

    // Check if category is used in articles
    const article = await newsModel.findOne({ category: id });

    if (article) {
      return res.status(400).json({
        success: false,
        message: 'Category is associated with an article'
      });
    }

    // Delete category
    await categoryModel.deleteOne({ _id: id });

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
    allCategories,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
};













