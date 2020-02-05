const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//User
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  exercises: []
});
//Exercise

const User = mongoose.model("User", userSchema);
module.exports = User;
