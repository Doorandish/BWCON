import Startup from '@/lib/db/models/Startup';

describe('Startup Model Validation', () => {
  const validData = {
    name: 'NeuralCraft AI',
    industry: 'Industrial AI',
    description: 'Autonomous computer vision defect detection systems for manufacturing lines.',
    technologies: ['PyTorch', 'TensorRT', 'FastAPI', 'Docker'],
    stage: 'mvp',
    teamSize: 8,
    fundingRaised: 750000,
    location: 'Munich, Germany',
    website: 'https://neuralcraft.example.com',
    contactEmail: 'contact@neuralcraft.example.com',
  };

  it('validates a complete and correct startup document', () => {
    const startup = new Startup(validData);
    const error = startup.validateSync();
    expect(error).toBeUndefined();
  });

  it('requires startup name', () => {
    const startup = new Startup({ ...validData, name: '' });
    const error = startup.validateSync();
    expect(error?.errors.name).toBeDefined();
  });

  it('enforces maximum character length on startup name', () => {
    const startup = new Startup({ ...validData, name: 'A'.repeat(201) });
    const error = startup.validateSync();
    expect(error?.errors.name).toBeDefined();
  });

  it('requires industry', () => {
    const startup = new Startup({ ...validData, industry: '' });
    const error = startup.validateSync();
    expect(error?.errors.industry).toBeDefined();
  });

  it('requires description', () => {
    const startup = new Startup({ ...validData, description: '' });
    const error = startup.validateSync();
    expect(error?.errors.description).toBeDefined();
  });

  it('requires at least one technology', () => {
    const startup = new Startup({ ...validData, technologies: [] });
    const error = startup.validateSync();
    expect(error?.errors.technologies).toBeDefined();
  });

  it('validates allowed stages', () => {
    const validStages = ['idea', 'mvp', 'growth', 'scale'];
    validStages.forEach((stage) => {
      const startup = new Startup({ ...validData, stage });
      const error = startup.validateSync();
      expect(error).toBeUndefined();
    });

    const invalidStartup = new Startup({ ...validData, stage: 'pre-seed-invalid' });
    const error = invalidStartup.validateSync();
    expect(error?.errors.stage).toBeDefined();
  });

  it('requires positive team size', () => {
    const startup = new Startup({ ...validData, teamSize: 0 });
    const error = startup.validateSync();
    expect(error?.errors.teamSize).toBeDefined();
  });

  it('rejects negative funding', () => {
    const startup = new Startup({ ...validData, fundingRaised: -500 });
    const error = startup.validateSync();
    expect(error?.errors.fundingRaised).toBeDefined();
  });

  it('validates contact email format', () => {
    const startup = new Startup({ ...validData, contactEmail: 'invalid-email-address' });
    const error = startup.validateSync();
    expect(error?.errors.contactEmail).toBeDefined();
  });
});
