const express = require('express');
// const fs = require('fs');
// const users = require('./users.json');
const app = express();
const PORT = 8000;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');
const randomNumber = require('random-number');
// const sendMail = require('./sendmail');
//  SQL Connection 
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

// Middleware- plugin
app.use(express.urlencoded({ extended: false }));
// Routes
app.get("/user", (req, res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join('')}; 
    </ul>`;
    res.send(html);
});

//  REST APIs

// app.get('/api/users', (req, res) => {
//     return res.json(users);
// });

//   :id is a dynamic variable......
//  GET /api/users/: id --> Dynamic path parameter 
// app.get("/api/users/:id", (req, res) => {
//     const id = Number(req.params.id); // converting string to number data type 
//     const user = users.find((user) => user.id === id); //  finding user with id in the URL 
//     return res.json(user);
// });

// Insert a new data in database......
app.post('/api/create', (req, res) => {
    const { name, email, contact_no } = req.body;

    const query = "INSERT INTO information(name,email,contact_no) VALUES (?,?,?)";
    const data = [name, email, contact_no];
    connect.query(query, data, (err, result) => {
        if (err) {
            return res.status(500).send('Error updating data');;
        }
        console.log('User data stored successfully');
        // return res.json({ status: "200", result});
        return res.status(201).send({ success: true, message: `Data created successfully`});
    });
});

// Search the data from database
app.post('/api/search/:id', (req, res) => {
    const id = Number(req.params.id);
    const querydata = `SELECT * FROM information WHERE id = ${id}`;
    connect.query(querydata, (err, result) => {
        if (err) {
            return res.status(500).send('Error updating data');;
        }
        console.log(result);
        return res.status(200).send({ success: true, message: 'Data search successfully',result });

    });
});
// show full table data
app.post('/api/showdata', (req, res) => {
    // const id = Number(req.params.id);
    const querydata = `SELECT * FROM information`;
    connect.query(querydata, (err, result) => {
        if (err) {
            return res.status(500).send('Error updating data');;
        }
        console.log(result);
        return res.status(200).send({ success: true, message: ' Table Data shows successfully', result });

    });
});



// Delete the data from database
app.post('/api/delete/:id', (req, res) => {
    const id = Number(req.params.id);
    const querydata = `DELETE FROM information WHERE id = ${id}`;
    connect.query(querydata, (err, result) => {
        if (err) { return res.status(500).send('Error updating data');; }
        return res.status(200).send({ success: true, message: 'Data delete successfully' });

        // return res.json({ status: "success" });
    });
});

// // Update 
// app.post('/api/update/:id', (req, res) => {

//     const id = Number(req.params.id);
//     const name = req.body.name;
//     const email = req.body.email;
//     const phone = req.body.contact_no;
//     const querydata = `UPDATE information SET name = ?,email = ?,contact_no = ? WHERE id = ${id};`;
//     const data = [name, email, phone];
//     connect.query(querydata, data, (err, result) => {
//         if (err) { throw err; }
//         return res.json({ status: "success", result });
//     });
// });

// working code  -- Update 
app.post('/update/:id', (req, res) => {
    // Parse the request body
    const { name, email, contact_no } = req.body;
    // Construct the SQL UPDATE query dynamically based on the provided columns
    let sql = 'UPDATE information SET ';
    const updateValues = [];
    if (name !== undefined) {
        sql += 'name = ?, ';
        updateValues.push(name);
    }
    if (email !== undefined) {
        sql += 'email = ?, ';
        updateValues.push(email);
    }
    if (contact_no !== undefined) {
        sql += 'contact_no = ?, ';
        updateValues.push(contact_no);
    }
    // Remove the trailing comma and space
    sql = sql.slice(0, -2);
    sql += ' WHERE id = ?';

    // Add the id value to the updateValues array
    updateValues.push(id);

    // Execute the SQL UPDATE query
    connect.query(sql, updateValues, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).send('Error updating data');
            return;
        }
        // console.log('Data updated successfully');
        // res.send('Data updated successfully');
        return res.status(200).send({ success: true, message: 'Data delete successfully' });

    });
});





// Email Verification

// function to generate OTP 
function generateOTP() {
    const options = {
        min: 100000,
        max: 999999,
        integer: true
    };
    return randomNumber(options);
}

let otp = generateOTP();

const sendMail = async (req, res) => {
    res.send("Sending male");
    // connnection with smtp 
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'makhijaji100@gmail.com',
            pass: 'vltlgcxafpzyvcie'
        }
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Vansh <makhijaji100@gmail.com>"', // sender address
        to: "niteshsharma2038@gmail.com", // list of receivers
        subject: "Email Verification API ", // Subject line
        text: "Hello World",// plain text body
        html: `<p> OTP for Verification is ${otp}</p>`, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log(otp);
    return res.json();
}

app.post('/mail', sendMail);
/// OTP VERIFICATION 

app.post('/mail/verify', (req, res) => {
    const { verifyotp } = req.body;
    // console.log(OTP);
    if (verifyotp == otp) {
        return res.json({ status: "success" });
    }
    else {
        return res.json({ status: "failure", "OTP Verification is Unsuccessful": "" });
    }
});

const Server = app.listen(PORT, () => { console.log(`Server is started at PORT ${PORT}`) });

