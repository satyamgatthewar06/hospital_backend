import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema(
  {
    billId: {
      type: String,
      unique: true,
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    billDate: {
      type: Date,
      default: Date.now
    },
    billAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      required: true
    },
    charges: [{
      description: String,
      category: String,
      amount: Number,
      quantity: Number
    }],
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'check'],
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'cancelled'],
      default: 'pending'
    },
    paymentDate: Date,
    insuranceClaimed: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    notes: String,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'billings'
  }
);

billingSchema.pre('save', async function (next) {
  if (!this.billId) {
    const count = await this.constructor.countDocuments();
    this.billId = `BILL${String(count + 1).padStart(6, '0')}`;
  }
  this.pendingAmount = this.billAmount - this.paidAmount - this.insuranceClaimed;
  next();
});

export default mongoose.model('Billing', billingSchema);
