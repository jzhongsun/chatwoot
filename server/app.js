var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var proxy = require('http-proxy-middleware');
const { randomUUID } = require('crypto');

var app = express();
var router = express.Router();

var env = process.env;
var backend_url = env.BACKEND_URL;
if (!backend_url) {
  backend_url = 'http://localhost:8080';
}

async function v3App(req, res, next) {
  try {
    const config = await fetch(backend_url + '/v3app', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const dashboard = await config.json();
    res.render('v3app', {
      installation_name: dashboard.global_config.INSTALLATION_NAME,
      global_config: JSON.stringify(dashboard.global_config),
      account_config: JSON.stringify(dashboard.account_config),
      browser_config: JSON.stringify(dashboard.browser_config),
      csrf_token: randomUUID(),
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function dashboardApp(req, res, next) {
  try {
    const config = await fetch(backend_url + '/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(config);
    const dashboard = await config.json();
    res.render('dashboard', {
      installation_name: dashboard.global_config.INSTALLATION_NAME,
      global_config: JSON.stringify(dashboard.global_config),
      account_config: JSON.stringify(dashboard.account_config),
      browser_config: JSON.stringify(dashboard.browser_config),
      csrf_token: randomUUID(),
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function widgetApp(req, res, next) {
  try {
    const config = await fetch(backend_url + '/widget', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const widget = await config.json();
    res.render('widget', {
      installation_name: widget.global_config.INSTALLATION_NAME,
      auth_token: widget.conversation_token,
      pubsub_token: widget.contact_inbox.pubsub_token,
      global_config: JSON.stringify(widget.global_config),
      web_channel: JSON.stringify(widget.web_channel),
      csrf_token: randomUUID(),
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

/* GET home page. */
router.get('/', dashboardApp);
router.get('/app/login', v3App);
router.get('/app/', dashboardApp);
router.get('/app/accounts/**', dashboardApp);
router.get('/widget', widgetApp);

/* HEALTH */
router.get('/health', (req, res) => res.send('OK'));

/** PROXY PART */
const apiProxy = proxy.createProxyMiddleware({
  target: backend_url,
  changeOrigin: true,
  pathFilter: ['/api/**', '/auth/**'],
});
const wsProxy = proxy.createProxyMiddleware({
  target: backend_url,
  ws: true,
  changeOrigin: true,
  pathFilter: ['/cable'],
});
app.use(apiProxy);
app.use(wsProxy);

// view engine setup
app.set('views', path.join(__dirname, 'dist'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../', 'public')));
app.use(express.static(path.join(__dirname, '../', 'dist')));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
