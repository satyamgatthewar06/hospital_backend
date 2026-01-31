import mongoose from 'mongoose';

const insurancePolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      unique: true,
      required: true
    },
    tpaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TPA',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    insuranceCompany: {
      type: String,
      required: true
    },
    policyNumber: {
      type: String,
      required: true,
      unique: true
    },
    coverageAmount: {
      type: Number,
      required: true
    },
    policyStartDate: {
      type: Date,
      required: true
    },
    policyEndDate: {
      type: Date,
      required: true
    },
    copayPercentage: {
      type: Number,
      default: 0
    },
    fixedDeductible: {
      type: Number,
      default: 0
    },
    claimsCount: {
      type: Number,
      default: 0
    },
    totalClaimed: {
      type: Number,
      default: 0
    },
    totalApproved: {
      type: Number,
      default: 0
    },
    utilizationPercentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'insurance_policies'
  }
);

insurancePolicySchema.pre('save', async function (next) {
  if (!this.policyId) {
    const count = await this.constructor.countDocuments();
    this.policyId = `POL${String(count + 1).padStart(6, '0')}`;
  }
  if (this.coverageAmount > 0) {
    this.utilizationPercentage = (this.totalApproved / this.coverageAmount) * 100;
  }
  next();
});

export default mongoose.model('InsurancePolicy', insurancePolicySchema);
