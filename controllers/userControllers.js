const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const{validationResult} = require('express-validator');
const userModel = require('../models/User');
const newsModel = require('../models/News');
const CategoryModel = require('../models/Category');
const SettingsModel = require('../models/settings');
const { createErrorMessage } = require('../utils/error-message');
const fs = require('fs');
dotenv.config();

const login = async (req, res) => {
    res.render('admin/login', {
        layout: false,
        errors : 0
    });
};
const adminlogin = async (req, res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        // return res.status(400).json({errors :errors.array() })
      return res.render('admin/login', {
            layout: false,
            errors : errors.array()
    })
    }
    const { username, password } = req.body;

    try {
        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // return res.status(401).send('Invalid username or password');
            return next(createErrorMessage('Invalid username or password',401))
        }

        const jwtData = { id: user._id,  fullname : user.fullname ,role: user.role };
        const token = jwt.sign(jwtData, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true , maxAge: 60 * 60 * 1000 });
        res.redirect('/admin/dashboard');
     } catch (error) {
        // return res.status(500).send('Server Error');
        next(error);
    
    }
   
};

const Logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/');
};

const dashboard = async (req, res,next) => {
    try{
        let newsCount;
        if(req.role == 'author'){
            newsCount = await newsModel.countDocuments({author : req.id});
        }

        else{
          newsCount=  await newsModel.countDocuments();
        }
        const userCount = await userModel.countDocuments();
       
        const categoryCount = await CategoryModel.countDocuments();
        res.render('admin/dashboard',{role : req.role, fullname : req.fullname, userCount, newsCount, categoryCount});
    }
    catch(error){
        // console.error(error);
        // res.status(500).render('admin/dashboard',{role : req.role, fullname : req.fullname});
        next(error);
    }
};


const settings = async (req, res,next) => {
     try {
        const settings = await SettingsModel.findOne();

        res.render('admin/settings', {
            role: req.role,
            settings
        });
    } catch (error) {
        // console.error("Get Settings Error:", error);
        // res.status(500).send("Server Error");
        next(error);
    }
};

const saveSettings = async (req, res, next) => {
    const { siteDescription, siteTitle } = req.body;
    const siteLogo = req.file ? req.file.filename : null;

    try {
        let setting = await SettingsModel.findOne();
        if (!setting) {
            setting = new SettingsModel();
        }

        setting.siteTitle = siteTitle;
        setting.siteDescription = siteDescription;

        if (siteLogo) {
            // delete old logo
            if (setting.siteLogo) {
                const logopath = `./public/uploads/${setting.siteLogo}`;
                if (fs.existsSync(logopath)) {
                    fs.unlinkSync(logopath);
                }
            }
            setting.siteLogo = siteLogo;
        }

        await setting.save(); // ✅ REQUIRED

        res.redirect('/admin/settings');
    } catch (error) {
        next(error);
    }
};


const allUsers = async (req, res) => {
    const users = await userModel.find();
    res.render('admin/users', { users ,role:req.role});
};

const addUserPage = async (req, res) => {
    res.render('admin/users/create',{role: req.role,errors:0});
};

const addUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
    return res.render('admin/users/create', {
            role: req.role,
            errors : errors.array()
    })
    }
    await userModel.create(req.body);
    res.redirect('/admin/users');
};

const updateUserPage = async (req, res,next) => {
    try {
        const id = req.params.id;

        const user = await userModel.findById(id);

        if (!user) {
            // return res.status(404).send('User not found');
            // OR: res.redirect('/admin/users');
            return next(createErrorMessage('User not found',404));
        }

        res.render('admin/users/update', { user , role : req.role,errors:0});

    } catch (error) {
        // console.error(error);
        // res.status(500).send('Server Error');
        next(error);
    }
};

const updateUser = async (req, res,next) => {
     const id = req.params.id

     const errors = validationResult(req);
    if(!errors.isEmpty()){
    return res.render('admin/users/update', {
            user : req.body,
            role: req.role,
            errors : errors.array()
    })
    }
     const { fullname, password, role } = req.body;
     try{
        const user = await userModel.findById(id);
        if(!user){
            // return res.status(404).send('User not found');
            return next(createErrorMessage('User not found',404));
        }

        user.fullname = fullname || user.fullname;
        if(password) {user.password = password;
        }
        user.role = role || user.role;
        await user.save();
        
        res.redirect('/admin/users');
    } catch (error) {
        
        // res.status(500).send('Server Error');
        next(error);
    }
};

const deleteUser = async (req, res,next) => {
    const id = req.params.id;
   try{
    const user = await userModel.findById(id);
    if(!user){
        // return res.status(404).send('User not found');
        return next(createErrorMessage('User not found',404));
    }
    const article  = await newsModel.findOne({author :id});
    if(article){
        return res.status(400).json({success : false,message : 'User is associated with  an article'});
    }

    await user.deleteOne()
    res.json({success:true})
   } catch (error) {
    // return res.status(500).send('Server Error');
    next(error);
   }
}
module.exports = {
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
};
