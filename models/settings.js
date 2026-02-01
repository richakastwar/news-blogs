const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({
    siteTitle: {
        type: String,
        required: true
    },
    siteDescription: {
        type: String,
        required: true
    },
    siteKeywords: {
        type: String,
        // required: true
    },
    siteLogo: {
        type: String,
        
    }
});

module.exports = mongoose.model('Settings', settingsSchema);