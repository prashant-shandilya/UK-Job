const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  order: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['New', 'Pending', 'Completed', 'Cancelled'],
    default: 'New'
  },
  noOfItems: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  total: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  createdOn: { 
    type: Date, 
    default: Date.now 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'employees', 
    required: true 
  }
}, {
  timestamps: true
});

// Generate order number automatically
TransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.order) {
    const count = await this.constructor.countDocuments();
    this.order = `COM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel; 