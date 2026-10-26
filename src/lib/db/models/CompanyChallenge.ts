import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompanyChallenge extends Document {
  companyName: string;
  industry: string;
  challengeTitle: string;
  challengeDescription: string;
  desiredOutcome: string;
  budget: number;
  timeline: string;
  requiredTechnologies: string[];
  preferredStartupStage: ('idea' | 'mvp' | 'growth' | 'scale')[];
  contactEmail: string;
  status: 'open' | 'matching' | 'matched' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const CompanyChallengeSchema = new Schema<ICompanyChallenge>(
  {
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    industry: { type: String, required: [true, 'Industry is required'], trim: true },
    challengeTitle: { type: String, required: [true, 'Challenge title is required'], trim: true, maxlength: [300, 'Title cannot exceed 300 characters'] },
    challengeDescription: { type: String, required: [true, 'Challenge description is required'], trim: true, maxlength: [3000, 'Description cannot exceed 3000 characters'] },
    desiredOutcome: { type: String, required: [true, 'Desired outcome is required'], trim: true },
    budget: { type: Number, required: [true, 'Budget is required'], min: [0, 'Budget cannot be negative'] },
    timeline: { type: String, required: [true, 'Timeline is required'], trim: true },
    requiredTechnologies: { type: [String], default: [] },
    preferredStartupStage: { type: [String], enum: ['idea', 'mvp', 'growth', 'scale'], default: [] },
    contactEmail: { type: String, required: [true, 'Contact email is required'], trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
    status: { type: String, enum: ['open', 'matching', 'matched', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

CompanyChallengeSchema.index({ status: 1 });
CompanyChallengeSchema.index({ industry: 1 });

const CompanyChallenge: Model<ICompanyChallenge> = mongoose.models.CompanyChallenge || mongoose.model<ICompanyChallenge>('CompanyChallenge', CompanyChallengeSchema);

export default CompanyChallenge;
