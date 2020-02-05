const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const User = require("./models/user");
const cors = require("cors");

const mongoose = require("mongoose");
//here
const Schema = mongoose.Schema;
//User
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  exercises: []
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", function(req, res) {
  let username = req.body.username;
  User.findOne({ username }, function(err, user) {
    if (err) {
      return console.log(err);
    }
    if (user === null) {
      let u = new User({ username });
      u.save(function(err, user) {
        if (err) {
          console.log(err);
        }
        res.json({ username: user.username, id: user._id });
      });
    } else {
      console.log(user);
    }
  });
});

app.post("/api/exercise/add", function(req, res) {
  let { userId, description, duration, date } = req.body;
  date = date !== "" ? new Date(date) : new Date();
  User.findOne({ _id: userId }, function(err, user) {
    if (err) {
      console.log(err);
    }
    if (user === null) {
      res.json({ message: "user not found" });
    } else {
      if (description == "" || duration == "") {
        res.redirect("back");
      } else {
        let exercise = { description, duration, date };
        user.exercises.push(exercise);
        user.save(function(err, user) {
          if (err) {
            console.log(err);
          } else {
            user;
            res.json({ _userId: userId, description, duration, date });
          }
        });
      }
    }
  });
});

app.get("/api/exercise/log", function(req, res) {
  let { userId, from, to, limit } = req.query;
  limit = typeof limit === "string" ? limit : 0;
  User.findOne({ _id: userId }).exec(function(err, data) {
    if (err) {
      console.log(err);
    }
    if (from == undefined && to == undefined) {
      if (limit == 0) {
        limit = data.exercises.length;
        let exercises = data.exercises.slice(0, limit);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      } else {
        let exercises = data.exercises.slice(0, limit);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      }
    } else if (from != undefined && to != undefined) {
      let exercisesFilter = data.exercises.filter(function(exer) {
        return exer.date >= new Date(from) && exer.date <= new Date(to);
      });
      if (limit == 0) {
        let exercises = exercisesFilter.slice(0, exercisesFilter.length);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      } else {
        let exercises = exercisesFilter.slice(0, limit);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      }
    } else if (from != undefined && to == undefined) {
      let exercisesFilter = data.exercises.filter(function(exer) {
        return exer.date >= new Date(from);
      });
      if (limit == 0) {
        let exercises = exercisesFilter.slice(0, exercisesFilter.length);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      } else {
        let exercises = exercisesFilter.slice(0, limit);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      }
    } else if (from == undefined && to != undefined) {
      let exercisesFilter = data.exercises.filter(function(exer) {
        return exer.date <= new Date(to);
      });
      if (limit == 0) {
        let exercises = exercisesFilter.slice(0, exercisesFilter.length);

        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      } else {
        let exercises = exercisesFilter.slice(0, limit);
        res.json({
          _id: userId,
          exercises,
          numerOfExercises: exercises.length
        });
      }
    }
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
