import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStartup extends Document {
  name: string;
  industry: string;
  description: string;
  technologies: string[];
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  teamSize: number;
  fundingRaised: number;
  location: string;
  website?: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const StartupSchema = new Schema<IStartup>(
  {
    name: { type: String, required: [true, 'Startup name is required'], trim: true, maxlength: [200, 'Name cannot exceed 200 characters'] },
    industry: { type: String, required: [true, 'Industry is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: [2000, 'Description cannot exceed 2000 characters'] },
    technologies: { type: [String], required: [true, 'At least one technology is required'], validate: { validator: (v: string[]) => v.length > 0, message: 'At least one technology must be specified' } },
    stage: { type: String, required: [true, 'Stage is required'], enum: { values: ['idea', 'mvp', 'growth', 'scale'], message: '{VALUE} is not a valid stage' } },
    teamSize: { type: Number, required: [true, 'Team size is required'], min: [1, 'Team size must be at least 1'] },
    fundingRaised: { type: Number, default: 0, min: [0, 'Funding cannot be negative'] },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    website: { type: String, trim: true },
    contactEmail: { type: String, required: [true, 'Contact email is required'], trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  },
  { timestamps: true }
);

StartupSchema.index({ industry: 1 });
StartupSchema.index({ stage: 1 });
StartupSchema.index({ technologies: 1 });

const Startup: Model<IStartup> = mongoose.models.Startup || mongoose.model<IStartup>('Startup', StartupSchema);

export default Startup;
