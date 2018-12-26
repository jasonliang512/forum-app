import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import mongoose from 'mongoose';
import productController from './controllers/product.controller';
import userController from './controllers/user.controller';
import threadController from './controllers/thread.controller';
import replyController from './controllers/reply.controller';
import indexRoute from './routes/index.route';
import { resource } from './routes/utils';

const dbURL =
  process.env.MONGODB_URI ||
  'mongodb://root:password1@ds243254.mlab.com:43254/forum';

mongoose.connect(
  dbURL,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
  },
);
mongoose.Promise = Promise;

const db = mongoose.connection;
// eslint-disable-next-line no-console
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

// default middleware generated by express
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// track logins by using sessions
app.use(
  session({
    secret: process.env.SECRET || 'no u',
    resave: true,
    saveUninitialized: false,
  }),
);

// route middleware
app.use('/', indexRoute);
resource(app, '/products', productController);
resource(app, '/threads', threadController);
resource(app, '/replies', replyController);

app.post('/users/auth', userController.authenticate);
resource(app, '/users', userController);

// 404
app.get('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch all error handler
app.use((err, req, res, next) => {
  // doesn't seem to work. hmmm....
  if (err.kind === 'ObjectId') {
    err.status = 404; // eslint-disable-line no-param-reassign
  }

  res.status(err.status || 500);
  next(err);
});

module.exports = app;
