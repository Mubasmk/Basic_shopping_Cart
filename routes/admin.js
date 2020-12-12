var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/productHelper');


/* GET home page. */
router.get('/', function(req, res, next) {
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
        res.render('admin/add-products',{admin:true});
      }else{
        console.log(err);
      }
    })
  })  
})

module.exports = router;
