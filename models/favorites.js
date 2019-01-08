// Week 4 assignment. Define a new mongoose model for user's favorite dishes
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoritesSchema = new Schema({
    // Leverage mongoose population to pull in user data
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Leverage mongoose population to pull in dish data
    dishes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorites', favoritesSchema);

module.exports = Favorites;
