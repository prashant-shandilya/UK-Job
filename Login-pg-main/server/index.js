const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const EmployeeModel = require('./models/employee')
const AddressModel = require('./models/Address')
const TransactionModel = require('./models/Transaction')
const LineDetailModel = require('./models/LineDetail');
var random = require('random-string-generator');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const JWT_SECRET = "22kh4i3kj"
const { faker } = require('@faker-js/faker'); // For generating dummy data

const app = express()
app.use(express.json())
app.use(cors())

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});



mongoose.connect("mongodb://127.0.0.1:27017/hello")

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) return res.status(401).json({ msg: 'Token not found' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: 'Token invalid' });

    req.user = decoded; // Store user info
    next();
  });
}

app.get('/outh_page', (req, res) => {
  const link = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=468979056259-r25p6vqnqvkgd2hlkgl2j7t3nm34uffc.apps.googleusercontent.com` +
    `&redirect_uri=http://localhost:5173/outhcallback` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

   return res.send(link);
  // res.send("hello world");

})

app.post('/outhcallback', async (req, res) => {
  const code = req.body.code;

   const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id:"xyz",
        client_secret:"xyz",
        redirect_uri:"http://localhost:5173/outhcallback",
        grant_type: 'authorization_code'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

     const { access_token, id_token } = tokenResponse.data;



    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );


    res.send(`
      <h2>Welcome ${userInfo.data.name}</h2>
      <p>Email: ${userInfo.data.email}</p>
      <img src="${userInfo.data.picture}" />
    `);
  



});

app.post('/getInfo', verifyToken, async (req, res) => {
    const user = await EmployeeModel.findOne({ email: req.body.email }).populate('addresses');
    if (!user) return res.json("No user found !");
    const obj = {
        name: user.name,
        email: user.email,
        pass: user.password,
        address: user.addresses, // now an array of Address objects
    };
    return res.json(obj);
});

app.post('/addAddress', verifyToken, async (req, res) => {
    const { email, address } = req.body;
    // address should be an object: { name, addressline1, addressline2, postCode, city, country }
    try {
        const user = await EmployeeModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "No user found!" });
        }
        const newAddress = await AddressModel.create(address);
        user.addresses.push(newAddress._id);
        await user.save();
        await user.populate('addresses');
        return res.json({
            msg: "Address added successfully!",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ msg: "Error adding address" });
    }
});

app.put('/updateAddress', verifyToken, async (req, res) => {
    const { email, addressId, updatedAddress } = req.body;
    // updatedAddress: { name, addressline1, addressline2, postCode, city, country }
    try {
        const user = await EmployeeModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: "No user found!" });
        }
        const address = await AddressModel.findById(addressId);
        if (!address) {
            return res.status(404).json({ msg: "Address not found!" });
        }
        Object.assign(address, updatedAddress);
        await address.save();
        await user.populate('addresses');
        return res.json({
            msg: "Address updated successfully!",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({ msg: "Error updating address" });
    }
});

app.post('/setPassword', async (req,res) =>{
    const pass1 = req.body.pass;
    const mail = req.body.email;

    console.log(mail)

    const user = await EmployeeModel.findOne({ email: req.body.email });

    

    user.password = await bcrypt.hash(pass1, 10)
    user.isTempPasswordUsed = false;
    await user.save(); 

    return res.json("Password is changed !")
    
})

app.post('/login',(req,res)=>{
    const {email,password} = req.body;
    let myUser;
    EmployeeModel.findOne({email:email})
    .then(async (user)=> {
        if(user){
                const hash = user.password
                const isMatch = await bcrypt.compare(password,hash);

                if(isMatch){
                      if(user.isTempPasswordUsed){
                            return res.json("navigate to setPswrd");
                        }
                     const token = jwt.sign(
    {email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' } // Token valid for 1 hour
  );

    return res.json({msg:"Success",token})
                }
                    else
                       return  res.json("the password is incorrect")
}   
        else{
            res.json("no record existed");
        }
    })

  
    
})

app.post('/forgot',async (req,res)=>{

            const user = await EmployeeModel.findOne({ email: req.body.email });

    if (!user) {
        return res.json("Wrong Email typed");
    }

    const newPassword = random('alphanumeric'); 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword; 
    user.isTempPasswordUsed = true;
    await user.save(); 
    //Use nodemailer here to send the newPassword to the email.

    const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "greatpk2012@gmail.com",
    pass: "bxfgfyldqvsbfqid",
  },
});

const mailOptions = {
  from: "greatpk2012@gmail.com",
  to: `${req.body.email}`,
  subject: "Change password from authentication page.",
  text: `${newPassword} is your new password. Please use it to login into the app and then proceed ahead to change password`,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email: ", error);
  } else {
    console.log("Email sent: ", info.response);
  }
});

    res.json({ msg: "Password changed! check your email" });
})



app.post('/register', async (req, res) => {
    const pass = req.body.password;
    const hash = await bcrypt.hash(pass, 10);
    req.body.password = hash;
    if (!req.body.addresses) req.body.addresses = [];
    EmployeeModel.create(req.body)
        .then(employees => res.json(employees))
        .catch(err => res.json(err))
});

// Create Transaction API
app.post('/transactions', verifyToken, async (req, res) => {
    try {
        const { order, status, noOfItems, total } = req.body;
        // Find user by email from JWT token
        const user = await EmployeeModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ msg: "User not found!" });
        }
        // Create transaction
        const newTransaction = await TransactionModel.create({
            order: order || undefined,
            status: status || 'New',
            noOfItems: noOfItems || 0,
            total: total || 0,
            user: user._id
        }); 
        // Add transaction to user's transactions array
        user.transactions.push(newTransaction._id);
        await user.save();
        return res.json({
            msg: "Transaction created successfully!",
            transaction: newTransaction
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return res.status(500).json({ msg: "Error creating transaction" });
    }
});

// Bulk insert transactions for an employee (no authentication) used by POSTMAN to bulk insert tx for an employee
app.post('/transactions/bulk', async (req, res) => {
    try {
        const { email, transactions } = req.body;
        if (!email || !Array.isArray(transactions) || transactions.length < 10) {
            return res.status(400).json({ msg: 'Email and at least 10 transactions are required.' });
        }
        const employee = await EmployeeModel.findOne({ email });
        if (!employee) {
            return res.status(404).json({ msg: 'Employee not found.' });
        }
        const createdTransactions = [];
        for (const tx of transactions) {
            const newTx = await TransactionModel.create({
                order: tx.order || undefined,
                status: tx.status || 'New',
                noOfItems: tx.noOfItems || 0,
                total: tx.total || 0,
                user: employee._id
            });
            employee.transactions.push(newTx._id);
            createdTransactions.push(newTx);
        }
        console.log(createdTransactions)
        await employee.save();
        return res.json({ msg: 'Bulk transactions created successfully!', transactions: createdTransactions });
    } catch (error) {
        console.error('Error in bulk transaction insert:', error);
        return res.status(500).json({ msg: 'Error in bulk transaction insert' });
    }
});

// Test endpoint to get all transactions (for testing)
app.get('/transactions', verifyToken, async (req, res) => {
    try {
        const user = await EmployeeModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ msg: "User not found!" });
        }
        const transactions = await TransactionModel.find({ user: user._id })
            .sort({ createdOn: -1 });
        return res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ msg: "Error fetching transactions" });
    }
});

app.get('/line-details/:transactionId', verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const lines = await LineDetailModel.find({ transaction: transactionId });
    res.json(lines);
  } catch (error) {
    console.error('Error fetching line details:', error);
    res.status(500).json({ msg: 'Error fetching line details' });
  }
});

// bulk insert data into the line data through calling this api from postman
app.post('/line-details/bulk', async (req, res) => {
  try {
    const transactions = await TransactionModel.find({});
    const results = [];
    for (const tx of transactions) {
      const lines = [];
      for (let i = 0; i < tx.noOfItems; i++) {
        const line = await LineDetailModel.create({
          transaction: tx._id,
          code: faker.string.alphanumeric(8),
          description: faker.commerce.productName(),
          soldPrice: faker.number.float({ min: 10, max: 200, precision: 0.01 }),
          quantity: 1,
          unitPrice: faker.number.float({ min: 10, max: 200, precision: 0.01 }),
          discountValue: faker.number.float({ min: 0, max: 10, precision: 0.01 })
        });
        lines.push(line);
      }
      results.push({ transaction: tx._id, order: tx.order, linesCreated: lines.length });
    }
    res.json({ msg: 'Bulk line details created', results });
  } catch (error) {
    console.error('Error in bulk line detail insert:', error);
    res.status(500).json({ msg: 'Error in bulk line detail insert' });
  }
});

app.listen(3001, () => {
    console.log("the server is running on port 3001");
})
