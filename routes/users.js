const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/',async function (req, res, next) {
  let user=req.session.user;
  let cartCount=null;
  if(req.session.user){
    cartCount=await userHelper.getCartCount(req.session.user._id);
  };
  productHelper.getAllProducts().then((products) => {
      res.render('users/view-products', { products,user,cartCount })
  })
});

router.get('/product-specs', (req, res) => {
  productHelper.getAllProducts().then((products) => {
    res.render('users/product-specs', { products,user:req.session.user })
  })
});

router.get('/login', (req, res) => {
  if(req.session.loggedIn){
    res.redirect('/');
  }else{
    res.render('users/login',{logErr:req.session.userLogErr})
    req.session.userLogErr=false
  }
});

router.get('/signup', (req, res) => {
  res.render('users/signup')
});

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    req.session.user=response;
    req.session.loggedIn=true;

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
      req.session.userLogErr="Invalid username or password";
      res.redirect('/login');
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.user=null;
  req.session.loggedIn=false;
  res.redirect('/')
});

router.get('/product-specs/:id',async(req,res)=>{
  let products=await productHelper.getProductDetails(req.params.id);
  res.render('users/product-specs',{products,user:req.session.user})
});

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProduct(req.session.user._id);
  let total=0
  if(products.length>0){
    total=await userHelper.getTotalAmount(req.session.user._id);
  }
  let cartCount=await userHelper.getCartCount(req.session.user._id);
  res.render('users/cart',{user:req.session.user,products,cartCount,total})
});

router.get('/remove-cart-product/:id',(req,res)=>{
  
  let proId=req.params.id;
  userHelper.removeCartProduct(proId).then((response)=>{
    res.redirect('/cart');
  })
})

router.get('/addCart/:id',(req,res)=>{
  console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true});
  });
});

router.post('/change-product-quantity',(req,res)=>{
  userHelper.changeProductQuantity(req.body).then((response)=>{
    res.json(response);
  });
});

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id);
  total=parseInt(total)
  let email=req.session.user.Email;
  res.render('users/place-order',{user:req.session.user,total,email});
});

router.post('/place-order',async(req,res)=>{
  req.body.userId=req.session.user._id
  let products=await userHelper.getCartProductList(req.body.userId);
  let totalPrice=await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeorder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response);
      })
    }
  });  
});

router.get('/order-success',async(req,res)=>{
  let email=req.session.user.Email;
  res.render('users/order-success',{user:req.session.user,email});
});

router.get('/my-orders',async(req,res)=>{
  let orders=await userHelper.getUserOrder(req.session.user._id);
  res.render('users/my-orders',{user:req.session.user,orders});
});

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelper.getOrderProduct(req.params.id);
  res.render('users/view-order-products',{user:req.session.user,products})
});

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment success");
      res.json({status:true});
    });
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:""});
  });
});

module.exports = router;
