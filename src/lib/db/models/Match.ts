import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  challengeId: mongoose.Types.ObjectId;
  startupId: mongoose.Types.ObjectId;
  matchScore: number;
  pros: string[];
  cons: string[];
  detailedExplanation: string;
  estimatedCost: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'CompanyChallenge', required: [true, 'Challenge ID is required'], index: true },
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: [true, 'Startup ID is required'], index: true },
    matchScore: { type: Number, required: [true, 'Match score is required'], min: [0, 'Score cannot be below 0'], max: [100, 'Score cannot exceed 100'] },
    pros: { type: [String], required: [true, 'Pros are required'], validate: { validator: (v: string[]) => v.length > 0, message: 'At least one pro must be listed' } },
    cons: { type: [String], default: [] },
    detailedExplanation: { type: String, required: [true, 'Detailed explanation is required'] },
    estimatedCost: { type: String, required: [true, 'Estimated cost is required'] },
    status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

MatchSchema.index({ challengeId: 1, startupId: 1 }, { unique: true });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
