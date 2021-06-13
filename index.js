const express = require('express')
const app = express();
const cors=require('cors');
const server = require('http').createServer(app)
const socketio =require('socket.io');
const io =socketio(server,{
    cors:{
        origin:'*',
    }
})
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
app.use(cors());
app.use(bodyParser.urlencoded({
    extended : true
  }))
app.use(bodyParser.json())


var buserSchema = mongoose.Schema({

    email: {
      type: String,
      require: true
    },
    City: {
        type: String,
        require: true
      },
      BranchName: {
        type: String,
        require: true
      },
      Address: {
        type: String,
        require: true
      },
      BranchIncharge: {
        type: String,
        require: true
      },
      ContactNumber: {
        type: String,
        require: true
      },
      PincodeCovered: {
        type: String,
        require: true
      },   
    password:{
      type: String,
      require: true
    },
    pincodes: {
        type: Array,
      },
    alerts: {
      type: Array,
    },
    admin:{
        type: Boolean

    }
  
  });
const Buser = mongoose.model("buser", buserSchema);
// var alertSchema = mongoose.Schema({

//     time: {
//       type: String,
//       require: true
//     },
//     pincodes: {
//         type: Array,
//       },
  
//   });
// const Alert = mongoose.model("alert", alertSchema);

app.post('/checkEmail',(req,res)=>{
    const {email} =req.body;
    Buser.findOne({email:email},(err,user)=>{
        if(!user){
           res.json({email:false})
        }else(res.json({email:true}))
    })
})
app.post('/checkPassword',(req,res)=>{
    const {email, password} = req.body;
Buser.findOne({email:email},(err,user)=>{
        if(user.password!=password){
            res.json({password:false})
        }else{
            res.json({password:true})
        }
    })

})
 
app.post('/signIn',(req,res)=>{
    const {email} = req.body;
    Buser.findOne({email:email},(err,user)=>{
        if(user){
            const payload = {user};
                jwt.sign(payload, 'secret', {
                    expiresIn: 3600
                }, (err, token) => {
                     if(err) console.error('There is some error in token', err);
                     else {
                         res.json({
                             type:'success',
                             token: `Bearer ${token}`,
                             msg:'Login Succes'
                         });
                     }
                });
            }
        
    })

})
 
app.post('/adduser',(req,res)=>{
    const data =req.body;
    const user = new Buser(data)
    user.save(err=>{
        if(err){
            console.log(err)
        }else res.json({msg:'ohk'})
    })
})
app.get('/userlist',(req,res)=>{

    Buser.find({},(err,users)=>{
        if(users){
            res.json({users})
        }else res.json({msg:'no user'})
    })
})
app.post('/alertlist',(req,res)=>{
    const {email} =req.body
    Buser.findOne({email:email},(err,user)=>{
        if(user){
            res.json(user.alerts)
            // res.json({users})
        }else res.json({msg:'no user'})
    })
})
app.post('/user',(req,res)=>{
    let data = req.body
    Buser.findOneAndUpdate(data,{$set:{alerts:[]}},(err,user)=>{
        if(err)console.log(err)
       
    })
})
app.post('/deletelist',(req,res)=>{
    let data = req.body
    Buser.findOneAndUpdate(data,{$set:{alerts:[]}},(err,user)=>{
        if(err)console.log(err)
       
    })
})
// app.get('/updatePincodes',(req,res)=>{
//     Buser.find({},(err,users)=>{
//     if(err)res.json({msg:'user not found'})
//     else{
//         users.forEach(user=>{
//             const spincodes = user.PincodeCovered;
//             const nspincodes=spincodes.split(" ").join("");
//             const Array = nspincodes.split(",")
//             Buser.findOneAndUpdate({_id:user._id},{$set:{pincodes:Array}},(err,u)=>{
//                 if(err)console.log(err)
//                 else{console.log('y')}
//             })
//         })
        
       
//     }
//     })
// })
app.post('/servicelist',(req,res)=>{
    const {pincode} = req.body
    Buser.find({pincodes:pincode},(err,users)=>{
        if(err)console.log(err)
        else{
           res.json(users)
      
        }
    })
})
app.get('/adminlist',(req,res)=>{
    Buser.find({},(err,users)=>{
        if(err)console.log(err)
        else(res.json(users))
    })
})

io.on('connection', socket =>{
    // console.log('connection made successfully')
    socket.on('message',payload => {
        // console.log('Message received on server: ', payload)
        io.emit('message',payload)
        const {pincode ,time}=payload
        Buser.updateMany({pincodes:pincode},{$push:{alerts:time}},{"multi":true},(err,user)=>{
            if(err)console.log(err)
        })
        Buser.findOneAndUpdate({admin:true},{$push:{alerts:payload}},(err,user)=>{
            if(err)console.log(err)
            
        })
    })
})



const port = process.env.PORT || 4000;


server.listen(port, () => {
    console.log(`Server is running at ${port}`)
})
mongoose.connect('mongodb+srv://dps:dps@cluster0.harcc.mongodb.net/Cluster0?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useCreateIndex :true
})