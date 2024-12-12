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
    console.info(config);
    const dashboard = await config.json();
    res.render('v3app', {
      installation_name: dashboard.global_config.INSTALLATION_NAME,
      global_config: dashboard.global_config,
      app_config: dashboard.app_config,
      browser_config: dashboard.browser_config,
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
    console.info(config);
    const dashboard = await config.json();
    res.render('dashboard', {
      installation_name: dashboard.global_config.INSTALLATION_NAME,
      global_config: dashboard.global_config,
      app_config: dashboard.app_config,
      browser_config: dashboard.browser_config,
      csrf_token: randomUUID(),
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function widgetApp(req, res, next) {
  try {
    console.info(req.headers)
    const response = await fetch(backend_url + req.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers['cookie'],
        'User-Agent': req.headers['user-agent'],
        'X-Forwarded-For': req.ip,
      },
      credentials: 'include',
    });
    const widget = await response.json();
    // console.info(response, widget);
    widget.account.features.disable_branding = false;
    widget.web_widget.hide_header = false;
    res
      .cookie('cw_conversation', response.cookie('cw_conversation'))
      .render('widget', {
        installation_name: widget.global_config.INSTALLATION_NAME,
        inbox: widget.inbox,
        contact: widget.contact,
        contact_inbox: widget.contact_inbox,
        account: widget.account,
        web_widget: widget.web_widget,
        agent_bot: widget.agent_bot,
        languages: widget.languages,
        auth_token: widget.conversation_token,
        pubsub_token: widget.contact_inbox.pubsub_token,
        global_config: widget.global_config,
        web_channel: widget.web_channel,
        csrf_token: randomUUID(),
        layout: false,
      });
  } catch (error) {
    next(error);
  }
}

async function ekbookingApp(req, res, next) {
  try {
    console.info(req.headers)
    const response = await fetch(backend_url + req.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers['cookie'],
        'User-Agent': req.headers['user-agent'],
        'X-Forwarded-For': req.ip,
      },
      credentials: 'include',
    });
    const widget = await response.json();
    // console.info(response, widget);
    widget.account.features.disable_branding = true;
    widget.web_widget.hide_header = true;
    res
      .cookie('cw_conversation', widget.conversation_token, {
        expire: 1000 * 60 * 60 * 24 * 30 + Date.now(),
      })
      .render('widget', {
        installation_name: widget.global_config.INSTALLATION_NAME,
        inbox: widget.inbox,
        contact: widget.contact,
        contact_inbox: widget.contact_inbox,
        account: widget.account,
        web_widget: widget.web_widget,
        agent_bot: widget.agent_bot,
        languages: widget.languages,
        auth_token: widget.conversation_token,
        pubsub_token: widget.contact_inbox.pubsub_token,
        global_config: widget.global_config,
        web_channel: widget.web_channel,
        csrf_token: randomUUID(),
        layout: false,
      });
  } catch (error) {
    next(error);
  }
}

/* GET home page. */
router.get('/', dashboardApp);
router.get('/app/', dashboardApp);
router.get('/app/accounts/**', dashboardApp);
router.get('/app/login', v3App);
router.get('/auth', v3App);
router.get('/widget', widgetApp);
router.get('/ekbooking', ekbookingApp);

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

const hbs = require('hbs');
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
app.engine('html', hbs.__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../', 'public')));
app.use(express.static(path.join(__dirname, '../', 'dist')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('500');
});

module.exports = app;
