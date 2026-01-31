import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      unique: true,
      required: true
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsurancePolicy',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    tpaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TPA',
      required: true
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Billing'
    },
    claimAmount: {
      type: Number,
      required: true
    },
    approvedAmount: {
      type: Number,
      default: 0
    },
    deductionAmount: {
      type: Number,
      default: 0
    },
    payableAmount: {
      type: Number,
      default: 0
    },
    serviceDate: Date,
    description: String,
    authorizationNumber: String,
    submissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed'],
      default: 'pending'
    },
    documents: [{
      name: String,
      type: String,
      size: Number,
      uploadDate: Date,
      url: String
    }],
    tpaResponse: {
      status: String,
      approvedAmount: Number,
      deductionAmount: Number,
      payableAmount: Number,
      remarks: String,
      approvalDate: Date
    },
    remarks: String
  },
  {
    timestamps: true,
    collection: 'insurance_claims'
  }
);

insuranceClaimSchema.pre('save', async function (next) {
  if (!this.claimId) {
    const count = await this.constructor.countDocuments();
    this.claimId = `CLM${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.authorizationNumber) {
    this.authorizationNumber = `AUTH${Date.now()}`;
  }
  next();
});

export default mongoose.model('InsuranceClaim', insuranceClaimSchema);
