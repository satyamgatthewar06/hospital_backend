import mongoose from 'mongoose';

const laboratorySchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      unique: true,
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testName: {
      type: String,
      required: true
    },
    testCategory: {
      type: String,
      required: true
    },
    testDescription: String,
    sampleType: String,
    sampleCollectionDate: Date,
    testStartDate: Date,
    testEndDate: Date,
    result: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    },
    testCost: {
      type: Number,
      default: 0
    },
    normalRange: String,
    notes: String,
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'laboratory_tests'
  }
);

laboratorySchema.pre('save', async function (next) {
  if (!this.testId) {
    const count = await this.constructor.countDocuments();
    this.testId = `LAB${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Laboratory', laboratorySchema);
