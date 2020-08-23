var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var flash = require('connect-flash')

require('dotenv').config()

// MonogoDB Connected
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, (err) =>{
  if(!err){
    console.log("Connected to MongoDB.")
  }
}
)

var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// In memory storage of logged in user
let users = {}

passport.serializeUser((user, done)=>{
  users[user.profile.oid] = user
  done(null, user.profile.oid)
})

passport.deserializeUser((id, done)=>{
  done(null, users[id])
})

const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.OAUTH_APP_ID,
    secret: process.env.OAUTH_APP_PASSWORD
  },
  auth: {
    tokenHost: process.env.OAUTH_AUTHORITY,
    authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
    tokenPath: process.env.OAUTH_TOKEN_ENDPOINT
  }
});

// Callbak function when sign in is complete 
const signInComplete = async (iss, sub, profile, accessToken, refreshToken, params, done) => {
  if(!profile.oid){
    return done(new Error("No OID found in user profile."))
  }

  try{
    const user = await graph.getUserDetails(accessToken)

    if(user){
      profile['email'] = user.mail ? user.mail : user.principalName
    }
  } catch(err){
    return done(err)
  }

  let oauthToken = oauth2.accessToken.create(params)

  users[profile.oid] = { profile, oauthToken }

  return done(null, users[profile.oid])
}

passport.use(new OIDCStrategy(
  {
    identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
    clientID: process.env.OAUTH_APP_ID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: process.env.OAUTH_REDIRECT_URI,
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.OAUTH_APP_PASSWORD,
    validateIssuer: false,
    passReqToCallback: false,
    scope: process.env.OAUTH_SCOPES.split(' ')
  },
  signInComplete
))

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth')
const projectsRouter = require('./routes/projects')

const graph = require('./graph')

const app = express();

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.error = req.flash('error_msg')

  let err = req.flash('error')
  for (let i in err){
    res.locals.error.push({message: 'An error occured', debug: err[i]})
  }

  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize passport
app.use(passport.initialize())
app.use(passport.session())

// Add user data for template
app.use((req, res, next)=> {
  if(req.user) {
    res.locals.user = req.user.profile
  }
  next()
})

app.use('/', indexRouter);
app.use('/auth', authRouter)
app.use('/projects', projectsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
