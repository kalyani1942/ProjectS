//Db conncection
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Kalyani@1942",
    database: "travelDb"
});
// test connection
connection.connect((err) => {
    if (err) console.log("Db connection failed\n Error:" + JSON.stringify(err, undefined, 2));
    else console.log("Db connected succesfully at port 5000");
});

module.exports = connection;
