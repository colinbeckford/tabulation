//initializing necessary modules for the server side
const express = require('express');
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
var request = require('request');
var cors = require('cors');
app.use(cors());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "scalescollective.com");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
//     next();
// });
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static("."));
var mysql = require('mysql');
// const con = mysql.createPool({
//   user: process.env.DB_USER, // e.g. 'my-db-user'
//   password: process.env.DB_PASS, // e.g. 'my-db-password'
//   database: process.env.DB_NAME, // e.g. 'my-database'
//   // If connecting via unix domain socket, specify the path
//   socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
//   // If connecting via TCP, enter the IP and port instead
//   // host: 'localhost',
//   // port: 3306,
//
//   //...
// });
//
var con = mysql.createConnection({
host: 'localhost',
port: '3306',
user: 'root',
password: 'password',
database: 'judges'
});
con.connect(function(err) {
if (err) {
console.log(err);
}
else {
console.log('Database successfully connected');
}
});

app.post('/append', function(req,res){
  var num_judges = parseInt(req.body.num_judges);
  pin_list = req.body.pin.split(',');
  name_list = req.body.name.split(',');
  console.log(pin_list);
  console.log(name_list);
  if (req.query.num == "6193")
  {
    for (var i=0; i<=num_judges; i++)
    {
      con.query('INSERT INTO NYYL ( id, name, type, contest, division ) values ( ' + pin_list[i] + ", '" + name_list[i] + "', '" + req.body.judgetype + "', '" + req.body.contest + "', '" + req.body.division + "' );",
      function(err,rows,fields) {
      if (err)
      {
        res.send(err);
      }
      });
    }
    res.send('Success');
  }
  else
  {
    console.log("Invalid PIN");
  }
});

app.get('/login', function(req,res){
  var pin = req.query.num;
  var manualContest;
  var manualDivision;
  var manualJudgeType;
  var manualJudgeName;
  var result;
  con.query('SELECT * from NYYL WHERE id = ' + pin + ";",
  function(err,rows,fields) {
  if (err)
  {
    res.send(err);
  }
  else
  {
    console.log(rows);
    manualContest = rows[0].contest;
    manualDivision = rows[0].division;
    manualJudgeType = rows[0].type;
    manualJudgeName = rows[0].name;
    result = manualContest + "," + manualDivision + "," + manualJudgeType + "," + manualJudgeName;
    res.send(result);
  }
  });

});
