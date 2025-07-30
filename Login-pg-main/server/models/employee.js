const mongoose = require('mongoose')

const EmployeeSchema = new mongoose.Schema ({
    name: String,
    email: String,
    password: String,
    isTempPasswordUsed: Boolean,
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
})

const EmployeeModel = mongoose.model("employees", EmployeeSchema)

module.exports = EmployeeModel