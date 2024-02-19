const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const handlebars = require('express-handlebars');
const app = express();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
app.use(bodyParser.urlencoded({ extended: true }));
// Setting up handlebars as a view engine
// multer for file upload......
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log('ho rha h ');
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${file.originalname}`);
    },
});

const upload = multer({ dest: 'uploads/' });
// app.use(express.urlencoded({extended: false}));
// Create MYSQL Connection
const connectionwithdatabase = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Hodal@2111",
    database: "database_1"
});
connectionwithdatabase.connect((err) => {
    if (err) {
        console.warn('error', err)
    }
    console.warn("Connected!");
});

app.set('view engine', "handlebars");
app.engine('handlebars', handlebars.engine({
    extname: "handlebars", defaultLayout: "index"
}));
// app.set('views', path.join(__dirname, 'views'));
app.get('/', (req, res) => {
    // Retrieve all user information from database.....
    const data = 'SELECT * FROM form_data';
    connectionwithdatabase.query(data, (err, rows) => {
        if (err) { throw err; }
        // Render the form and table with data 
        {
            res.render('main', { userdata: rows })
            // console.log(rows); // used to show data in terminal 
        }
        // res.send(result);
    });
});

app.post('/', upload.single('file'), function (req, res) {

    
    const { first_name, last_name} = req.body;
    // var first_name = req.body.first_name;
    // var middle_name = req.body.middle_name;
    // var last_name = req.body.last_name;
     // Extract file details
     const file = req.file;

     // Save the uploaded file with its original filename
     const fileName = file ? file.originalname : null;
     const filePath = path.join(__dirname, 'uploads', fileName );
 
     // Read and write the file to server
     fs.writeFileSync(filePath, fs.readFileSync(file.path));

    // Extract file details
    // var sql = "INSERT INTO form_data(first_name,last_name)VALUES('" + first_name + "','" + last_name + "','" + "')";
    const sql = "INSERT INTO form_data(first_name,last_name,profile_image) VALUES (?,?,?)";
    const data = [first_name, last_name,fileName];


    connectionwithdatabase.query(sql, data, (err, result) => {
        if (err) { throw err; }
        console.log('User data stored successfully');
        res.redirect('/');
        // console.log('Row inserted with id = ' + result.insertId);
    });
});
app.get('/download/:id', (req, res) => {

    console.log("running download function ");
    const userId = req.params.id;

    // Retrieve the profile image filename from the database
    const sql = 'SELECT profile_image FROM form_data WHERE id = ?';
    connectionwithdatabase.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching profile image filename:', err);
            return res.status(500).send('Error fetching profile image');
        }

        // Check if a profile image exists for the user
        if (results.length === 0 || !results[0].profile_image){
            return res.status(404).send('Profile image not found');
        }

        const profileImageFileName = results[0].profile_image;
        const profileImagePath = path.join(__dirname, 'uploads', profileImageFileName);

        // Check if the file exists
        if (!fs.existsSync(profileImagePath)) {
            return res.status(404).send('Profile image not found');
        }

        // Serve the profile image file for download with its original filename
        res.download(profileImagePath, profileImageFileName);
    });
});

app.listen(8020, () => { console.log('Server Started') });