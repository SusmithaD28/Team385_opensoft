# Backend of the Movie Database Website

The backend API is built using Node.js, Express.js, and Mongoose. It handles requests from the frontend UI and interacts with the database to retrieve or update data. The backend API provides a set of RESTful endpoints that define the functionality of the application.
This project will hold the server application. First, run npm install from the root. After this, you will run npm run-script install-all from the root. From now on run this command anytime you want to install all modules again. This is a script we have defined in package.json.

## Manual Installation

Clone the repo:

```bash
git clone <repository link>
cd backend-node-express
```

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env
# open .env and modify the environment variables
```


## Commands

Running in development:

```bash
Nodemon index.js
```

## Environment Variables

The environment variables can be found and modified in the `.env` file.

```bash
# App name
APP_NAME = # default App Name

PORT = 4000
# URL of the Mongo DB

# URL frontend
FRONTEND_URL = # default http://localhost:3000

# URL of PayPal ID
PAYPAL_CLIENT_ID = 
"AUoQ_vz_gwA2-cqyyQD2CHvGILhFIzFKMzRReOyi4C9h5J58ZhqcsgsaqFKvuLwlGGHgqCIQ7kqj2ScO",

## Project Structure

|--config                  #Configures Cloudinary settings using environment variables.
|--database                #Defines Mongoose schemas and models for users and movies.
|--middleware              #Middleware for restricting access to admin-only routes.
                           #Configures multer for uploading video files.
                           #Middleware for user authentication and authorization using JWT.
|--routes                  #Express router for handling PayPal checkout requests.
                           #Express router for semantic and autocomplete movie search.
                           #Express router for user authentication, movie management, and video handling.


#Model 
Models define the structure and behavior of the data stored in the MongoDB database. This includes the defining schema for 

user data,
movie data


## Featured Technologies
* [Node.js](https://nodejs.org/): An open-source JavaScript run-time environment for executing server-side JavaScript code.
* [Express.js](https://expressjs.com/): Express.js: It is a popular Node.js framework that provides a set of tools and libraries for building web applications. Express.js is used to create RESTful APIs for the MERN project.
* [MongoDB](https://www.mongodb.com/): It is a NoSQL document database that stores data in JSON-like documents. MongoDB is used to store the data for the MERN project.
* [Mongoose](https://mongoosejs.com/): It is an Object Data Modeling (ODM) library for MongoDB and Node.js. Mongoose is used to create models, and schemas, and handle data validation for the MongoDB database. The databases defined for this are the User database, Bank database and Payment database.

