const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://movies:mongodb@cluster0.ona9uuw.mongodb.net/sample_mflix')

const UserSchema = new mongoose.Schema({
    // Schema definition here
    firstname: {type:String, required:true},
    lastname: {type:String, required:true},
    password: String,
    email: String,
    subscription: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: "user"
    },
    subscribedAt: {
        type: Date,
        default: null
    
    }
});

const MovieSchema = new mongoose.Schema({
    // Schema definition here
    title: String,
    plot: String,
    genres: [String],
    runtime: Number,
    // cast: [String],
    // poster: String,
    // fullplot: String,
    // languages: [String],
    // released: String,
    // directors: [String],
    // rated: String,
    // awards: Object,
    // lastupdated: String,
    // year: Number,
    // imdb: Object,
    // countries: [String],
    // type: String,
    // tomatoes: Object,
    // num_mflix_comments: Number
});
const VideoSchema = new mongoose.Schema({
    title: String,
    url: String,
    resolution: String,
});
const User = mongoose.model('User', UserSchema);
const Movies = mongoose.model('Movies', MovieSchema);
const embeddedMovies = mongoose.model('embedded_movies', MovieSchema);
const videos = mongoose.model('videos', VideoSchema);
module.exports = {
    User,
    Movies,
    embeddedMovies, 
    videos
}
