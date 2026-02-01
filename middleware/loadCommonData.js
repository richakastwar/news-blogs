const categoryModel = require("../models/Category");
const newsModel = require("../models/News");
const settingModel = require("../models/settings");
const NodeCache = require("node-cache");

const cache = new NodeCache();
const loadCommonData = async (req, res, next) => {
  try {
    var settings = cache.get("settingsCache");
    var lastedNews = cache.get("lastedNewsCache");
    var categories = cache.get("categoriesCache");

    if (!settings && !lastedNews && !categories) {
      settings = await settingModel.findOne().lean()

      lastedNews = await newsModel
        .find()
        .populate("category", { name: 1, slug: 1 })
        .populate("author", "fullname")
        .sort({ createdAt: -1 })
        .limit(5).lean()

      const categoriesInUse = await newsModel.distinct("category");
      categories = await categoryModel.find({ _id: { $in: categoriesInUse },}).lean()

      cache.set('lastedNewsCache',lastedNews,3600);
      cache.set('settingsCache', settings,3600 );
      cache.set('categoriesCache',categories,3600);
    }

    res.locals.settings = settings;
    res.locals.lastedNews = lastedNews;
    res.locals.categories = categories;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = loadCommonData;
