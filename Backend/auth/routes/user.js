const { Router, request } = require("express");
const userMiddleware = require("../middleware/user");
const { User, Movies, embeddedMovies, videos } = require("../db");
const { JWT_SECRET, saltRounds } = require("../config");
const router = Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ConnectionStates } = require("mongoose");
const adminMiddleware = require("../middleware/admin");
require('dotenv').config({ path: "./.env" });
const { config, uploader } = require('../config/cloudinaryconfig');
const multerUploads = require('../middleware/multeruploads');
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
// singup
router.post('/signup', async (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const email = req.body.email;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const auth = await bcrypt.compare(password, hashedPassword);
    if (!auth) {
        console.log("noMatch");
    }
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    // Create the user
    try {
        await User.create({
            firstname,
            lastname,
            password: hashedPassword,
            email
        });
        res.json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// signin
router.post('/signin', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        email
    })
    if (!user) {
        return res.status(400).json({ msg: "User doesn't exist" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
        return res.status(400).json({ msg: 'Incorrect password' });
    }
    const subscribedAt = user.subscribedAt;
    const date = Date.now();
    if (user.role != "admin" && subscribedAt != null) {
        if (date - subscribedAt > 2592000000) {
            user.subscription = null;
            await user.save();
        }
    }
    const token = jwt.sign({
        email,
        iat: Math.floor(Date.now() / 1000)
    }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, firstname: user.firstname, role: user.role, subscription: user.subscription, subscribedAt: user.subscribedAt })
});

// signout

// delete account
router.delete('/delete', userMiddleware, async (req, res) => {
    const email = req.email;
    const response = await User.deleteOne({ email });
    res.json({
        msg: "Account deleted successfully"
    })
});

// get all movies
router.get('/movies', userMiddleware, async (req, res) => {
    const response = await Movies.find({});
    res.json({
        movies: response
    })
});

// get a movie

router.get("/moviesgrid", userMiddleware, async (req, res) => {
  try {
    let response = await Movies.find({ poster: { $exists: true } }).limit(12);
 
    res.json({
      movies: response,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/movies/:movieId', userMiddleware, async (req, res) => {
    const movieId = req.params.movieId;
    try {
        const response = await Movies.findOne({ "_id": movieId });
        if (!response) {
            const response_ = await embeddedMovies.findOne({ "_id": movieId });
            if (!response_)
                return res.status(404).json({ message: 'Movie not found' });
            return res.status(200).json({ movies: response_ });
        }
        res.json({ movies: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// add a sub
router.post('/subscription', userMiddleware, async (req, res) => {
    const sub = req.body.subscription;
    const role = req.role;
    const date = Date.now();
    if (role == "admin") {
        return res.json({ message: "You are admin" });
    }
    const email = req.email;
    try {
        const user = await User.findOne({ email });
        if (user) {
            user.subscription = sub;
            user.subscribedAt = date;
            await user.save();
            res.json({ message: "Subscription updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// get sub
router.get('/subscription', userMiddleware, async (req, res) => {
    const subscription = req.subscription;
    const email = req.email;
    if (subscription == null) {
        res.json({
            message: "Not subscribed"
        })
    }
    else {
        const user = await User.findOne({ email });
        res.json({
            subscription: user.subscription, subscribedAt: user.subscribedAt
        });
    }
});
router.post('/changeRes', multerUploads, async (req, res) => {
    const inputBuffer = req.file.buffer;
    //save buffer to file
    const inputFileExtension = path.extname(req.file.originalname);

    const inputFile = `input${inputFileExtension}`;
    fs.writeFileSync(inputFile, inputBuffer);
    outputBuffer = ''
    await ffmpeg(inputFile).output('output.mp4').videoCodec('libx264').audioCodec('aac').outputOptions(['-vf scale=640:144']).on('end', async() => {
        console.log('conversion ended');
        outputBuffer =  fs.readFileSync('output.mp4');
        console.log(outputBuffer);
            parser.format(path.extname(req.file.originalname).toString(), outputBuffer);
        url = ''
        await uploader.upload(parser.content, { resource_type: "video" })
            .then((result) => {
                console.log(result);
                url = result.url;
                return res.status(200).json({ message: 'conversion ended' });
            })
            .catch((err) => {
                console.log(err)
                return res.status(500).json({
                    msg: "Internal server error"
                });
            });

        
    }).on('error' ,() => {
        console.log('error');
        return res.status(500).json({
            msg: "Internal server error"
        });
    }).run();
//    if (outputBuffer == '')
//         return res.status(500).json({"msg":"Internal server error"});
//     parser.format(path.extname(req.file.originalname).toString(), outputBuffer);
//         url = ''
//         await uploader.upload(parser.content, { resource_type: "video" })
//             .then((result) => {
//                 console.log(result);
//                 url = result.url;
//             })
//             .catch((err) => {
//                 console.log(err)
//                 return res.status(500).json({
//                     msg: "Internal server error"
//                 });
//             });

    
   

});
router.post('/upload', userMiddleware, adminMiddleware, multerUploads, async (req, res) => {
    parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);
    console.log(req.file);
    url = ''
    await uploader.upload(parser.content, { resource_type: "video" })
        .then((result) => {
            console.log(result);
            url = result.url;
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).json({
                msg: "Internal server error"
            });
        });
    if (url != '') {
        const newvideo = await videos.create({
            title: req.file.originalname,
            url: url,
            resolution: "144p"

        });
        return res.json({
            "msg": "uploaded",
            "response": newvideo
        });
    }
    else {
        return res.status(400).json({
            "msg": "not uploaded"
        });
    }
});
// watch a movie fetch from videos database
router.get('/movies/:movieId/watch', userMiddleware, (req, res) => {
    const movieId = req.params.movieId;
    const subscription = req.subscription;
    // show if subscribed
    if (subscription == null) {
        res.json({
            msg: "Please subscribe to watch"
        })
    }
    else {
        res.json({
            msg: "Here's the movie"
        })
    }
});

// get user (me)
router.get('/me', userMiddleware, async (req, res) => {
    const email = req.email;
    const user = await User.findOne({
        email
    })
    if (user) {
        res.json({
            user
        })
    } else {
        res.status(411).json({
            message: "user not found"
        })
    }
});

router.post('/movies', userMiddleware, adminMiddleware, async (req, res) => {
    const title = req.body.title;
    const plot = req.body.plot;
    const genres = req.body.genres;
    const runtime = req.body.runtime;
    const newmovie = await Movies.create({
        title,
        plot,
        genres,
        runtime
    })

    res.json({
        message: 'movie added successfully', movieId: newmovie._id
    })
});

// get movies
router.get('/movies', userMiddleware, adminMiddleware, async (req, res) => {
    const response = await Movies.find({});
    res.json({
        movies: response
    })

});



// get a movie
router.get('/movies/:movieId', userMiddleware, adminMiddleware, async (req, res) => {
    const movieId = req.params.movieId;
    const response = await Movies.find({ "_id": movieId });
    res.json({
        movies: response
    })
});

// delete movie
router.delete('/movies/delete/:movieId', userMiddleware, adminMiddleware, async (req, res) => {
    const movieId = req.params.movieId;
    await Movies.deleteOne({ "_id": movieId })
    res.json({
        message: 'movie deleted successfully'
    })
});

// get all users
router.get('/users', userMiddleware, adminMiddleware, async (req, res) => {
    const response = await User.find({});
    res.json({
        users: response
    })
});

// get a user
router.get('/users/:userId', userMiddleware, adminMiddleware, async (req, res) => {
    const userId = req.params.userId;
    const response = await User.find({ "_id": userId });
    res.json({
        user: response
    })
});

//update a movie
router.put('/movies/:movieId', userMiddleware, adminMiddleware, async (req, res) => {
    const movieId = req.params.movieId;
    const { title, plot, genres, runtime } = req.body;
 
    try {
        // Check if the movie exists
        const existingMovie = await Movies.findById(movieId);
        if (!existingMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
 
        // Update the movie fields
        existingMovie.title = title;
        existingMovie.plot = plot;
        existingMovie.genres = genres;
        existingMovie.runtime = runtime;
 
        // Save the updated movie
        await existingMovie.save();
 
        res.json({ message: 'Movie updated successfully', movieId: existingMovie._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// get users search
router.get('/find', userMiddleware, adminMiddleware, async (req, res) => {
    const username = req.query.username; // Access username from query parameter
    console.log(username);
    const response = await User.find({
    $or: [
        { firstname: username },
        { lastname: username }
    ]
    });
    console.log(response);
    res.json({
        users: response
    });
});

// delete user
router.delete('/users/delete/:userId', userMiddleware, adminMiddleware, async (req, res) => {
    const userId = req.params.userId;

    const response = await User.deleteOne({ "_id": userId });
    res.json({
        msg: "user deleted successfully"
    })
});

router.get('/videos', userMiddleware, adminMiddleware, async (req, res) => {

});
module.exports = router