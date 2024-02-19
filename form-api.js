const express = require('express');
// const fs = require('fs');
// const users = require('./users.json');
const app = express();
const PORT = 8000;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const mysql = require('mysql');
const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hodal@2111",
    database: "API"
});
connect.connect((err) => {
    if (err) {
        console.warn('error', err)
    }
    console.warn("Connected!");
});


app.get('/', (req, res) => {

})
