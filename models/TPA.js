import mongoose from 'mongoose';

const tpaSchema = new mongoose.Schema(
  {
    tpaId: {
      type: String,
      unique: true,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    contactPerson: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    website: String,
    registrationNumber: String,
    licenseNumber: String,
    panNumber: String,
    bankDetails: {
      accountNumber: String,
      accountHolderName: String,
      bankName: String,
      ifscCode: String,
      branchName: String
    },
    policies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsurancePolicy'
    }],
    claims: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsuranceClaim'
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'tpas'
  }
);

tpaSchema.pre('save', async function (next) {
  if (!this.tpaId) {
    const count = await this.constructor.countDocuments();
    this.tpaId = `TPA${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('TPA', tpaSchema);
