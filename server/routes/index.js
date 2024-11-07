var express = require('express');
var router = express.Router();

function v3app (req, res, next) {
  res.render('v3app', { title: 'Express', layout: 'body' });
}
function dashboard (req, res, next) {
  res.render('dashboard', { title: 'Express', layout: 'body' });
}

/* GET home page. */
router.get('/', dashboard);
router.get('/app/login', v3app);
router.get('/app/', dashboard);
router.get('/app/accounts/**', dashboard);

module.exports = router;
