const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');
let adminVerify=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET home page. */
router.get('/',adminVerify, function(req, res, next) {
  productHelper.getAllProducts().then((product)=>{
    res.render('admin/view-products', { admin:true,product });
  })
});

router.get('/add-products',(req,res)=>{
  res.render('admin/add-products',{admin:true})
});

router.post('/add-products',(req,res)=>{
  productHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image;
    image.mv('./public/images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-products');
      }else{
        console.log(err);
      }
    });
  });
});

router.get('/delete-products/:id',(req,res)=>{
  let proId=req.params.id;
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  });
});

router.get('/edit-products/:id',adminVerify,async(req,res)=>{
  let products=await productHelper.getProductDetails(req.params.id);
  res.render('admin/edit-products',{products,admin:true})
});

router.post('/edit-products/:id',(req,res)=>{
  let id=req.params.id;
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin');

    if(req.files.Image){
      let image=req.files.Image;
      image.mv('./public/images/'+id+'.jpg')
    };
  });
});

router.get('/login',(req,res)=>{
  res.render('admin/login',{logErr:req.session.logErr});
  req.session.logErr=false;
});

router.post('/login',(req,res)=>{
  productHelper.adminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.myData;
      req.session.loggedIn=true;
      res.redirect('/admin');
    }else{
      req.session.logErr="Invalid username or password"
      res.redirect('/admin/login')
    };
  });
});

router.get('/logout',(req,res)=>{
  req.session.admin=null;
  res.redirect('/admin/login')
});

router.get('/product-specification/:id',adminVerify,async(req,res)=>{
  let products=await productHelper.getProductDetails(req.params.id);
  res.render('admin/product-specification',{admin:req.session.admin,products,admin:true})
});

router.get('/view-users',adminVerify,(req,res)=>{
  productHelper.getAllUser().then((users)=>{
    res.render('admin/view-users',{users,admin:req.session.admin})
  });
});

router.get('/view-orders',adminVerify,(req,res)=>{
  productHelper.getAllOrders().then((orders)=>{
    res.render('admin/view-orders',{admin:req.session.admin,orders})
  });
});

router.get('/order-products/:id',adminVerify,async(req,res)=>{
  let products=await userHelper.getOrderProduct(req.params.id);
  res.render('admin/order-products',{admin:req.session.admin,products})
})

module.exports = router;
