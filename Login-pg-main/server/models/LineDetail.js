const mongoose = require('mongoose');

const LineDetailSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  soldPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const LineDetailModel = mongoose.model('LineDetail', LineDetailSchema);

module.exports = LineDetailModel; 