const mongoose = require("mongoose");

const connectionDB = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log(`database is connected`);
    })
    .catch((error) => {
      console.log("error in db connection", error);
    });
};
module.exports = {connectionDB}