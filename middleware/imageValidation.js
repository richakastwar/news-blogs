const imageValidation = (req, res, next) => {
  if (!req.file) {
    return res.status(422).json({
      success: false,
      message: 'Image is required'
    });
  }
  next();
};

module.exports = imageValidation;
