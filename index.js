const express = require('express')
const app = express()
const cors = require('cors')
const { User, Exercise } = require('./model');

const bodyParser = require('body-parser');
const userRouter = express.Router();

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', userRouter)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

userRouter.route('/users').get((req, res)=>{
  User.find((err, users)=>{
    return res.json(users);
  });
}).post((req, res)=>{
  const { username } = req.body;
  if (!username) {
    return res.json({ error: "Username is required" });
  }
  User.findOne({username: username}, (err, user)=>{
    if(err){
      console.error(err);
      return res.json({error: "Find user error! "});
    }
    if(!user){
      const newUser = new User({username});
      newUser.save((err, nuser)=>{
        if(err){
          console.error(err);
          return res.json({error: "Create user error! " + err});
        }
        return res.json(nuser);
      });
    }else{
      console.log('User exists: ' + username);
    }
  });
});

userRouter.post('/users/:uid/exercises', (req, res)=>{
    let {description, duration, date} = req.body;
    let uid = req.params?.uid;
    if(!uid){
      return res.json({ error: "User id is required" });
    }
    if(!description){
      return res.json({ error: "description id is required" });
    }
    if(!duration){
      return res.json({ error: "duration id is required" });
    }
    if(!date){
      date = new Date();
    }else{
      date = new Date(date);
    }
    User.findById(uid, (err, user)=>{
      if(err){
        console.error(err);
        return res.json({error: "Not found user id: " + uid});
      }
      const newExercice = new Exercise({
        username: user.username,
        description: description,
        duration: parseInt(duration),
        date: date,
      });
      newExercice.save((err, exercise)=>{
        if(err){
          console.error(err);
          return res.json({error: "Create exercise error"});
        }
        return res.json(exercise);
      });
    });
});

userRouter.get('/users/:uid/logs', (req, res)=>{
  let { uid } = req.params;
  let {from, to, limit} = req.query;
  if(!uid){
    return res.json({ error: "User id is required" });
  }
  User.findOne({_id: uid}, (err, user)=>{
    if(err){
      console.error(err);
      return res.json({error: "Not found user id: " + uid});
    }
    if(!user){
      return res.json({error: "User not found user id: " + uid});
    }
    let filter = {username: user.username};
    if(from && to){
      filter = {
        ...filter,
        date: { $gte: new Date(from), $lte: new Date(to) }
      }
    }
    console.log('filter', filter);
    let query = Exercise.find(filter);
    Exercise.countDocuments(filter, (err, count)=>{
      if(err){
        console.error(err);
        return res.json({error: "Count exercise error: "});
      }
      if(limit){
        query.limit(parseInt(limit));
      }
      query.exec((err, exercises)=>{
        if(err){
          console.error(err);
          return res.json({error: "Get exercises error"});
        }
        let logs = [];
        for(let item of exercises){
          logs.push({
            description: item.description,
            duration: item.duration,
            date: new Date(item.date).toDateString(),
          })
        }
        const data = {
          username: user.username,
          count: count,
          _id: uid,
          log: logs
        }
        return res.json(data);
      })
    });
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
