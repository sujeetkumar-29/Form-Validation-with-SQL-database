const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sql@123',
  database: 'form_validation',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected.');
  }
});

app.get('/', (req, res) => {
  res.render('form', { errors: [], formData: {} });
});

app.post(
  '/submit',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('form', { errors: errors.array(), formData: req.body });
    }

    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).send('Server Error');
      }
      res.redirect('/details');
    });
  }
);

// Show details page with all form data
app.get('/details', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render('details', { users: results });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
