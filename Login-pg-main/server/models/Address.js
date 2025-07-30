const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addressline1: { type: String, required: true },
  addressline2: { type: String },
  postCode: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true }
});

const AddressModel = mongoose.model('Address', AddressSchema);

module.exports = AddressModel; 