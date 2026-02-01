const CommentsModel = require('../models/Comment');
const newsModel = require('../models/News');
const { createErrorMessage } = require('../utils/error-message');
const { validationResult } = require('express-validator');

const allComments = async (req, res, next) => {
    try {
        let comments;

        if (req.role === "admin") {
            comments = await CommentsModel.find()
                .populate('article', 'title')
                .sort({ createdAt: -1 });
        } else {
            const news = await newsModel.find({ author: req.id });
            const newsId = news.map(n => n._id);

            comments = await CommentsModel.find({ article: { $in: newsId } })
                .populate('article', 'title')
                .sort({ createdAt: -1 });
        }

        res.render('admin/comments', {
            comments,
            role: req.role
        });

    } catch (error) {
        console.error(error);
        next(createErrorMessage('Error Fetching Comments', 500));
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const comment = await CommentsModel.findByIdAndDelete(req.params.id);

        if (!comment) {
            return next(createErrorMessage('Comment not found', 404));
        }

        res.json({ success: true });

    } catch (error) {
        next(createErrorMessage('Error Deleting Comment', 500));
    }
};

const commentUpdateStatus = async (req, res, next) => {
    try {
        const comment = await CommentsModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!comment) {
            return next(createErrorMessage('Comment not found', 404));
        }

        res.json({ success: true });

    } catch (error) {
        next(createErrorMessage('Error Updating Comment Status', 500));
    }
};

module.exports = {
    allComments,
    deleteComment,
    commentUpdateStatus
};
