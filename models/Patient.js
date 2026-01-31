import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    patientId: {
      type: String,
      unique: true,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      default: null
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    medicalHistory: [{
      condition: String,
      diagnosisDate: Date,
      notes: String
    }],
    allergies: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    insurancePolicy: {
      policyNumber: String,
      insuranceCompany: String,
      coverageAmount: Number,
      validFrom: Date,
      validTo: Date
    },
    totalBilled: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'patients'
  }
);

// Auto-generate patient ID
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await this.constructor.countDocuments();
    this.patientId = `P${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('Patient', patientSchema);
