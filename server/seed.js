const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

async function seed() {
  console.log('🌱 Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const users = [
    {
      _id: 'u1',
      name: 'Aditya Sharma',
      email: 'aditya@example.com',
      password: hashedPassword,
      role: 'citizen',
      department: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'u2',
      name: 'Neha Patel',
      email: 'neha@example.com',
      password: hashedPassword,
      role: 'citizen',
      department: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'o1',
      name: 'Officer Rajesh Kumar',
      email: 'rajesh@example.com',
      password: hashedPassword,
      role: 'official',
      department: 'Sanitation & Waste Management',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'o2',
      name: 'Officer Priya Singh',
      email: 'priya@example.com',
      password: hashedPassword,
      role: 'official',
      department: 'Roads & Transport',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const reports = [
    {
      _id: 'r1',
      title: 'Overflowing Garbage Bin near Metro Station',
      description: 'The public trash bin has been overflowing for the last three days. Garbage is spilling onto the footpath, causing foul smell and health hazards for commuters.',
      category: 'Sanitation & Waste Management',
      imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800',
      location: {
        lat: 28.5830,
        lng: 77.3117,
        address: 'Noida Sector 15 Metro Station, Noida, Uttar Pradesh, 201301'
      },
      status: 'Pending',
      citizen: {
        id: 'u1',
        name: 'Aditya Sharma',
        email: 'aditya@example.com'
      },
      officialComment: '',
      resolutionImageUrl: null,
      history: [
        {
          status: 'Pending',
          updatedBy: 'Aditya Sharma',
          comment: 'Issue reported and queued for department verification.',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'r2',
      title: 'Large Dangerous Pothole on Main Crossing',
      description: 'Multiple deep potholes formed right after the monsoons at the junction of Link Road. Two-wheelers have to veer dangerously to avoid it, creating high collision risks.',
      category: 'Roads & Transport',
      imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800',
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Outer Circle, Connaught Place, New Delhi, Delhi, 110001'
      },
      status: 'In Progress',
      citizen: {
        id: 'u2',
        name: 'Neha Patel',
        email: 'neha@example.com'
      },
      officialComment: 'Pothole repairs scheduled. Work order generated and contractors notified to lay asphalt.',
      resolutionImageUrl: null,
      history: [
        {
          status: 'Pending',
          updatedBy: 'Neha Patel',
          comment: 'Issue reported and queued for department verification.',
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: 'In Progress',
          updatedBy: 'Officer Priya Singh (Roads & Transport Department)',
          comment: 'Inspection completed. Work order #RO-542 generated for emergency road patching.',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'r3',
      title: 'Commercial Waste Dumping in Forest Green Belt',
      description: 'Construction trucks have dumped bags of concrete, plaster, and plastics into the forest buffer zone during late night hours. Urgently needs cleanup and barriers to block vehicle access.',
      category: 'Forestry & Environment',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
      location: {
        lat: 28.5244,
        lng: 77.1855,
        address: 'Sanjay Van Trail Entrance, Qutab Minar Area, New Delhi, 110016'
      },
      status: 'Resolved',
      citizen: {
        id: 'u1',
        name: 'Aditya Sharma',
        email: 'aditya@example.com'
      },
      officialComment: 'Commercial waste has been cleared out. Restored soil and planted grass. Blocked vehicular trails with heavy boulders to prevent future drive-in dumping.',
      resolutionImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      history: [
        {
          status: 'Pending',
          updatedBy: 'Aditya Sharma',
          comment: 'Issue reported and queued for department verification.',
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: 'In Progress',
          updatedBy: 'Officer Rajesh Kumar (Sanitation & Waste Management Department)',
          comment: 'Site inspected. Debris clearing vehicle scheduled for Saturday morning.',
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          status: 'Resolved',
          updatedBy: 'Officer Rajesh Kumar (Sanitation & Waste Management Department)',
          comment: 'Cleanup complete. Area soils cleared. Boulders positioned to prevent access. Case closed.',
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Ensure data folder exists
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(DB_PATH, JSON.stringify({ users, reports }, null, 2));
  console.log('🟢 Database successfully seeded with mock data!');
}

seed();
