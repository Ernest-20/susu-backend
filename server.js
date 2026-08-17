// This is the ACTUAL entry point running the app normally.
// It's separate from app.js so that tests can import app.js alone,
// without triggering a real .listen() call or a real database connection.

const config = requires("./config/config");
const connectDB = require("./database/connectDB");
const app = require("./app");

config.validateEnv();
connectDB();

app.listen(config.PORT, () => {
    console.log(`Server is listenig on port ${config.PORT}`);
});