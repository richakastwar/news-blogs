const moogoose = require('mongoose');

const categoryModel = require('../models/Category');
const CommentModel = require('../models/Comment');
const newsModel = require('../models/News');
const userModel = require('../models/User');
const settingModel = require('../models/settings');
const paginate = require('../utils/pagination');
const { createErrorMessage } = require('../utils/error-message');

const { name } = require('ejs');

const index = async (req, res) => {
    const news = await newsModel.find()
    const paginateNews = await paginate(
        newsModel,
        {},
        req.query,
        {
            populate: [
                { path: 'category', select: 'name slug' },
                { path: 'author', select: 'fullname' }
            ],
            sort: 'createdAt'
        }
    )
    res.render("index", {news, paginateNews,query:req.query});
  
};

const articleByCategories = async (req, res,next) => {
    const category = await categoryModel.findOne({slug: req.params.name});
    if(!category){
        return next(createErrorMessage('Category not Found',404));
    }
    const news = await newsModel.find({category:category._id}).populate('category',{'name':1,slug:1}).populate('author','fullname')
    
    .sort({createdAt:-1})

      const paginateNews = await paginate(
        newsModel,
        {category:category._id},
        req.query,
        {
            populate: [
                { path: 'category', select: 'name slug' },
                { path: 'author', select: 'fullname' }
            ],
            sort: 'createdAt'
        }
    )

    const categoriesInUse = await newsModel.distinct('category');
    const categories = await categoryModel.find({'_id':{$in:categoriesInUse}})
    res.render("category",{news,categories,category,paginateNews,query:req.query });
}
const singleArticle = async (req, res,next) => {
    const singleNews = await newsModel.findById(req.params.id).
    populate('category',{'name':1,slug:1}).populate('author','fullname').sort({createdAt:-1})

    if(!singleNews){
    return next(createErrorMessage('Article not Found',404));
    }

// Get All Comments for this Article
const Comments = await CommentModel.find({article: req.params.id, status: 'approved'})
    .sort('-createdAt')
    // res.json({singleNews,Comments});
    res.render("single",{singleNews,Comments});
}
const search = async (req, res) => {
    const searchQuery = (req.query.search || '').trim();

    // If search is empty, avoid regex query
    if (!searchQuery) {
        return res.render("search", {
            news: [],
            searchQuery: '',
            paginateNews: null
        });
    }

    const searchCondition = {
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { content: { $regex: searchQuery, $options: 'i' } }
        ]
    };

    const news = await newsModel
        .find(searchCondition)
        .populate('category', 'name slug')
        .populate('author', 'fullname')
        .sort({ createdAt: -1 });

    const paginateNews = await paginate(
        newsModel,
        searchCondition,
        req.query,
        {
            populate: [
                { path: 'category', select: 'name slug' },
                { path: 'author', select: 'fullname' }
            ],
            sort: { createdAt: -1 }
        }
    );

    res.render("search", { news, searchQuery, paginateNews ,query:req.query});
};

const author = async (req, res,next) => {
    const author = await userModel.findOne({_id:req.params.name})
    if(!author){
        return next(createErrorMessage('Author not Found',404));
    }
    const news = await newsModel.find({author:req.params.name})
    .populate('category',{'name':1,slug:1})
    .populate('author','fullname')
    
    .sort({createdAt:-1})

     const paginateNews = await paginate(
        newsModel,
        {author:req.params.name},
        req.query,
        {
            populate: [
                { path: 'category', select: 'name slug' },
                { path: 'author', select: 'fullname' }
            ],
            sort: 'createdAt'
        }
    
    )
  res.render("author",{news,author,paginateNews,query:req.query });
}
const addcomment = async (req, res,next) => {
   try {
    const { name, email, content } = req.body;

    const comment = new CommentModel({
        name,
        email,
        content,
        article: req.params.id
    });

    await comment.save();
    res.redirect(`/single/${req.params.id}`);

} catch (error) {
    console.error("Error saving comment:", error);
   return next(createErrorMessage('Something went wrong while submitting the comment',500));

}

}


module.exports ={
    index,
    articleByCategories,
    singleArticle,
    search,
    author,
    addcomment,
   
};









