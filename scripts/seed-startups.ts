import mongoose from 'mongoose';
import Startup from '../src/lib/db/models/Startup';

const startups = [
  {
    name: 'SensorAI Dynamics',
    industry: 'Industry 4.0, Manufacturing',
    description: 'We provide a plug-and-play predictive maintenance solution utilizing acoustic and vibration sensors retrofitted onto legacy manufacturing equipment. Our proprietary AI analyzes machine health in real-time, predicting failures up to 3 weeks in advance, thereby reducing unplanned downtime by 40% for traditional manufacturing plants without replacing their existing machinery.',
    technologies: ['Python', 'TensorFlow', 'Edge Computing', 'LoRaWAN'],
    stage: 'growth',
    teamSize: 24,
    fundingRaised: 3500000,
    location: 'Stuttgart, Germany',
    website: 'https://sensorai-dynamics.de',
    contactEmail: 'partnerships@sensorai-dynamics.de',
  },
  {
    name: 'RouteOptima',
    industry: 'Logistics, Supply Chain Tech',
    description: 'RouteOptima is an intelligent routing engine for mid-sized logistics providers. By ingesting real-time traffic, weather, and fleet telemetry data, our platform dynamically recalculates the most fuel-efficient delivery routes. We help traditional fleet operators reduce carbon emissions and fuel costs by an average of 18%, integrating seamlessly with older ERP systems.',
    technologies: ['Go', 'React', 'PostgreSQL', 'Google OR-Tools'],
    stage: 'mvp',
    teamSize: 12,
    fundingRaised: 850000,
    location: 'Berlin, Germany',
    website: 'https://routeoptima.com',
    contactEmail: 'hello@routeoptima.com',
  },
  {
    name: 'SecurOT Systems',
    industry: 'Cybersecurity, Industrial Tech',
    description: 'Traditional IT security fails in industrial environments. SecurOT delivers a zero-trust network architecture designed specifically for Operational Technology (OT) networks in Mittelstand factories. Our solution isolates legacy, unpatchable factory machines from modern IT networks, preventing ransomware attacks without interrupting the production line or causing latency.',
    technologies: ['Rust', 'C++', 'Kubernetes', 'Network Microsegmentation'],
    stage: 'scale',
    teamSize: 45,
    fundingRaised: 12000000,
    location: 'Munich, Germany',
    website: 'https://securot.io',
    contactEmail: 'contact@securot.io',
  },
  {
    name: 'EcoBind Solutions',
    industry: 'GreenTech, Advanced Materials',
    description: 'We have developed a proprietary, biodegradable binding agent for the construction and packaging industries. Our material replaces petroleum-based resins, offering equal structural integrity while being 100% compostable. This allows traditional packaging and construction firms to meet strict new EU sustainability regulations without compromising product quality or completely overhauling their production lines.',
    technologies: ['Material Science', 'Chemical Simulation', 'CAD'],
    stage: 'idea',
    teamSize: 6,
    fundingRaised: 250000,
    location: 'Aachen, Germany',
    website: 'https://ecobind.tech',
    contactEmail: 'info@ecobind.tech',
  },
  {
    name: 'VisuStruct AR',
    industry: 'Enterprise Software, Augmented Reality',
    description: 'VisuStruct AR provides an enterprise-grade augmented reality platform for training assembly line workers. By using off-the-shelf AR glasses, our software overlays 3D instructions onto physical components. This reduces onboarding time for new factory workers by 60% and minimizes assembly errors in high-mix, low-volume manufacturing settings where traditional paper manuals are inefficient.',
    technologies: ['Unity', 'C#', 'WebRTC', 'Computer Vision'],
    stage: 'mvp',
    teamSize: 15,
    fundingRaised: 1100000,
    location: 'Karlsruhe, Germany',
    website: 'https://visustruct-ar.com',
    contactEmail: 'founders@visustruct-ar.com',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Please define MONGODB_URI in process.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    for (const item of startups) {
      await Startup.findOneAndUpdate({ name: item.name }, item, { upsert: true, new: true });
      console.log(`Upserted: ${item.name}`);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
