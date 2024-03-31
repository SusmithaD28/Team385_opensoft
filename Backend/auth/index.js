const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const userRouter = require("./routes/user");
const searchRouter = require("./routes/search");
const paymentRouter = require("./routes/payment");
const cors = require('cors')
// Middleware for parsing request bodies
app.use(cors());
app.use(bodyParser.json());
app.use("/user", userRouter)
app.use("/search", searchRouter)
app.use("/api", paymentRouter)
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
