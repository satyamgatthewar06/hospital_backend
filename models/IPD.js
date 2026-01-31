import mongoose from 'mongoose';

const ipdSchema = new mongoose.Schema(
  {
    ipdId: {
      type: String,
      unique: true,
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward'
    },
    bedNumber: String,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    dischargeDate: Date,
    reason: String,
    diagnosis: String,
    treatment: String,
    status: {
      type: String,
      enum: ['admitted', 'discharged', 'transferred'],
      default: 'admitted'
    },
    vitals: [{
      date: Date,
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    notes: String
  },
  {
    timestamps: true,
    collection: 'ipd_records'
  }
);

ipdSchema.pre('save', async function (next) {
  if (!this.ipdId) {
    const count = await this.constructor.countDocuments();
    this.ipdId = `IPD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('IPD', ipdSchema);
