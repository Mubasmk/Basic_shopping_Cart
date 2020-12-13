const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');

/* GET users listing. */
router.get('/', function (req, res, next) {
  let user=req.session.user;
  productHelper.getAllProducts().then((products) => {
    res.render('users/view-products', { products,user })
  })
});

router.get('/product-specs', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('users/product-specs', { products })
  })
});

router.get('/login', (req, res) => {
  if(req.session.user){
    res.redirect('/');
  }else{
    res.render('users/login',{logErr:req.session.logErr})
  }
});

router.get('/signup', (req, res) => {
  console.log('signup');
  res.render('users/signup')
});

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    req.session.user=response;
    req.session.loggedIn=false;

    let id=req.session.user._id;
    let image=req.files.Image;
    image.mv('./public/images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect('/login');
      }else{
        console.log(err);
      }
    })

  });
});

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.loggedIn = true;
      res.redirect('/');
    }else{
      req.session.logErr="Invalid username or password";
      res.redirect('/login');
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.user=null;
  res.redirect('/')
})

module.exports = router;
