const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const popup = require('node-popup');
const router = express.Router();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set("views",path.join(__dirname,"view"));
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, 'public')
))
const connection =require('./db/conncetion');
const { readdirSync } = require('fs');
const { render } = require('ejs');
const { Router } = require('express');

app.get('/',(req,res) =>{
    //res.sendFile(path.join(__dirname + './view/login.ejs'));
	res.render("home")
});
//login check
app.post('/auth', (req, res) => {
	var user_name = req.body.user_name;
	var user_psw = req.body.user_psw;
	if (user_name && user_psw) {
		connection.query('SELECT * FROM travelDb.loginUser WHERE user_name = ? AND user_psw = ?', [user_name,user_psw], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username =user_name;
				res.render('home');

			} else {
				res.send('<h3>Incorrect username and/or userpassword!<h3>');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});
app.get('/login',(req,res)=>{
	res.render('login')
})
//search city
app.get('/home',(req,res) => {
	res.render('home');
});
app.post('/search',(req,res) => {
	var str = {
        stringPart:req.body.searchfield
    }
	connection.query('SELECT * FROM travelDb.search WHERE city =?',+str.stringPart+'%"',function(err, rows, fields) {
		console.log('error',typeof rows)
        if (err) throw err;
        var data=[];
        for(i=0;i<rows.length;i++)
        {
            data.push(rows[i].city);
        }
        res.render('holiday',{data: rows});
		
	});
});

//holiday
app.get('/holiday',(req,res)=>{
	//res.render('holiday')
	res.render('holiday');
})
app.post('/searchPackage',(req,res) =>{
	var FromDate=req.body.FromDate;
	var CheckOut=req.body.CheckOut;
	var GuestNo=req.body.GuestNo;
	var Rooms=req.body.Rooms;
	res.write(req.body.FromDate+".\n")
	res.write(req.body.CheckOut+".\n")
	res.write(req.body.GuestNo+".\n")
	res.write(req.body.Rooms+".\n")
	var sql = "INSERT INTO travelDb.searchPackage (FromDate,CheckOut,GuestNo,Rooms) VALUES('"+FromDate+"','"+CheckOut+"','"+GuestNo+"','"+Rooms+"')";
	connection.query(sql, (err, result) =>{
    if (err) throw err;
    console.log("1 record inserted");
	
  })
  res.render('booking')

})
/* holidaypackages
app.get('/holidaypackages',(req,res)=>{
	res.render('holidaypackages');
})
app.post('/book',(req,res)=>{
	res.re('booking')
})*/
//aboutus
app.get('/aboutus',(req,res)=>{
	res.render('aboutus')
})
//contactus
app.get('/contactus',(req,res)=>{
	res.render('contactus')
})
app.post('/contactus',(req,res)=>{
	var fname = req.body.fname;
	var email = req.body.email;
	var message = req.body.message;
	res.write(req.body.fname+".\n")
	res.write(req.body.email+".\n")
	res.write(req.body.message+".\n")
	let sql = "INSERT INTO travelDb.contactus (fname,email,message)VALUES('"+fname+"','"+email+"','"+message+"')";
	 connection.query(sql, (err, result) =>{
    if (err){ throw err;
    console.log("1 record inserted");
	res.send('<h3>Thank You!!!</h3>')
	}
  })
})
//booking 
app.get('/booking',(req,res)=>{
	res.render('booking')
})
app.post('/bookings',(req,res)=>{
	var fname = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email;
	var mbl = req.body.mbl;
	var spl = req.body.spl;
	res.write(req.body.fname+".\n")
	res.write(req.body.lname+".\n")
	res.write(req.body.email+".\n")
	res.write(req.body.mbl+".\n")
	res.write(req.body.spl+".\n")
	var sql = "INSERT INTO travelDb.booking  (fname,lname, email,mbl,spl) VALUES ('"+fname+"', '"+lname+"','"+email+"','"+mbl+"','"+spl+"')";
    connection.query(sql, (err, result) =>{
    if (err){ throw err;
    console.log("1 record inserted");
	}else{
		
		res.render('home')
	}
  })
  });
  //click on book Now
  app.post('/payment',(req,res)=>{
	  res.render('payment')
  })
 app.get('/payment',(req,res,)=>{
	let sql = "SELECT * FROM  travelDb.admin ";
	 let qry=connection.query(sql,(err,rows)=>{
		 if(err)throw err;
		 res.render('payment',{
			 user:rows
			});
	 });
 });
app.get('/admin',(req,res)=>{
	let sql = "SELECT * FROM travelDb.admin";
	let qry = connection.query(sql,(err,rows)=>{
        if(err) throw err;
	res.render("admin",{
		user:rows
	});
	});
});
app.get("/add",(req,res)=>{
	res.render("add")
});
app.post("/save",(req,res)=>{
	let data={
		name:req.body.name,location:req.body.location,
		package:req.body.package,type:req.body.type,
		duration:req.body.duration,email:req.body.email,
	    phone:req.body.phone
	}
		let sql ="INSERT INTO travelDb.admin SET ?";
		let qry =connection.query(sql,data,(err,rows)=>{
        if(err) throw err;
        res.redirect('/admin');
    });
})
//after the user clicks on edit button

app.get("/edit/:name",(req,res)=>{
    const username= req.params.name;
    let sql = "SELECT * FROM admin WHERE name=?";
    let qry = connection.query(sql,[username],(err,rows)=>{
        if(err) throw err;
        res.render("edit",{
            user: rows[0]
        });
});
});
//after user clicks on save button of user edit page - update the record
app.post("/save_edit",(req,res)=>{
    let sql = "UPDATE admin SET location = ? ,  package= ?, type= ? ,duration= ? , email= ? , phone= ? WHERE name = ?";
    let qry = connection.query(sql,[req.body.name,req.body.location,
		req.body.package,req.body.type,req.body.duration,
		req.body.email,req.body.phone],(err,rows)=>{
        if(err) throw err;
        res.redirect('/admin');
    });
});
app.get("/delete/:name",(req,res)=>{
    let sql = "DELETE FROM admin WHERE name= ?";
    let qry = connection.query(sql,[req.params.name],(err,rows)=>{
        if(err) throw err;
        res.redirect('/admin');
    });
});
    

app.listen(5000);