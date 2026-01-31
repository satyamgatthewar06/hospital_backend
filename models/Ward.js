import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema(
  {
    wardName: {
      type: String,
      required: true,
      trim: true
    },
    wardType: {
      type: String,
      enum: ['ICU', 'GENERAL', 'PRIVATE', 'PEDIATRICS', 'OTHER'],
      default: 'GENERAL'
    },
    totalBeds: {
      type: Number,
      default: 0,
      min: 0
    },
    availableBeds: {
      type: Number,
      default: 0,
      min: 0
    },
    charges: {
      type: Number,
      default: 0,
      min: 0
    },
    description: String
  },
  {
    timestamps: true,
    collection: 'wards'
  }
);

wardSchema.pre('save', function (next) {
  if (this.availableBeds > this.totalBeds) this.availableBeds = this.totalBeds;
  next();
});

export default mongoose.model('Ward', wardSchema);
