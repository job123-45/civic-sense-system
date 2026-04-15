// ============================================
// DEMO MODE — All API calls are mocked locally
// No backend / axios dependency required
// ============================================

// Helper: get demo issues from localStorage
const getDemoIssues = () => {
  const raw = localStorage.getItem('demo_issues');
  return raw ? JSON.parse(raw) : [];
};

// Helper: save demo issues to localStorage
const saveDemoIssues = (issues) => {
  localStorage.setItem('demo_issues', JSON.stringify(issues));
};

// Seed some initial demo issues if none exist
const seedDemoData = () => {
  if (getDemoIssues().length === 0) {
    const seed = [
      {
        _id: 'demo_001',
        title: 'Large pothole on MG Road',
        description: 'A deep pothole near the bus stop causing accidents. Multiple vehicles have been damaged. Urgent repair needed before monsoon season.',
        category: 'Road',
        status: 'Open',
        location: '110001',
        lat: 28.6139,
        lng: 77.2090,
        image: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Demo User' },
        assignedTo: null,
      },
      {
        _id: 'demo_002',
        title: 'Garbage overflow near Central Park',
        description: 'Garbage bins have been overflowing for 3 days. Stray animals are spreading waste across the sidewalk. Health hazard for nearby residents.',
        category: 'Garbage',
        status: 'In Progress',
        location: '110002',
        lat: 28.6280,
        lng: 77.2197,
        image: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Anita Sharma' },
        assignedTo: { name: 'Sanitation Dept.' },
      },
      {
        _id: 'demo_003',
        title: 'Broken street light on Nehru Avenue',
        description: 'Street light pole #47 has been non-functional for over a week. The area becomes very dark after 7 PM making it unsafe for pedestrians.',
        category: 'Electricity',
        status: 'Resolved',
        location: '110003',
        lat: 28.6353,
        lng: 77.2250,
        image: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Raj Kumar' },
        assignedTo: { name: 'Electricity Board' },
      },
      {
        _id: 'demo_004',
        title: 'Water pipeline leak in Sector 5',
        description: 'A major water pipeline is leaking near the community hall. Clean drinking water is being wasted continuously. Residents are facing low water pressure.',
        category: 'Water',
        status: 'Open',
        location: '110004',
        lat: 28.6100,
        lng: 77.2300,
        image: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Priya Singh' },
        assignedTo: null,
      },
      {
        _id: 'demo_005',
        title: 'Illegal dumping near river bank',
        description: 'Construction debris and household waste is being dumped near the Yamuna river bank. This is polluting the water and harming local wildlife.',
        category: 'Garbage',
        status: 'Open',
        location: '110005',
        lat: 28.6050,
        lng: 77.2400,
        image: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Demo User' },
        assignedTo: null,
      },
      {
        _id: 'demo_006',
        title: 'Cracked footpath near school zone',
        description: 'The footpath tiles are cracked and uneven near Delhi Public School. Students and elderly citizens are at risk of tripping.',
        category: 'Road',
        status: 'In Progress',
        location: '110001',
        lat: 28.6200,
        lng: 77.2150,
        image: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Meena Gupta' },
        assignedTo: { name: 'PWD Delhi' },
      },
      {
        _id: 'demo_007',
        title: 'Frequent power cuts in Block C',
        description: 'Block C has been experiencing 4-5 hour power outages daily for the past week. Transformer seems overloaded.',
        category: 'Electricity',
        status: 'Closed',
        location: '110006',
        lat: 28.6180,
        lng: 77.2080,
        image: null,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Vikram Joshi' },
        assignedTo: { name: 'BSES Yamuna' },
      },
      {
        _id: 'demo_008',
        title: 'Sewage overflow on Ring Road',
        description: 'Sewage water is overflowing onto the main Ring Road near ITO junction. Causing foul smell and traffic hazard.',
        category: 'Water',
        status: 'Resolved',
        location: '110002',
        lat: 28.6300,
        lng: 77.2350,
        image: null,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Sanjay Verma' },
        assignedTo: { name: 'DJB' },
      },
      {
        _id: 'demo_009',
        title: 'Fallen tree blocking lane',
        description: 'A large banyan tree fell during last night\'s storm, completely blocking the service lane. Cars have to take a long detour.',
        category: 'Other',
        status: 'In Progress',
        location: '110016',
        lat: 28.5355,
        lng: 77.1914,
        image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Rahul Bose' },
        assignedTo: { name: 'Horticulture Dept' },
      },
      {
        _id: 'demo_010',
        title: 'Broken traffic signal',
        description: 'The traffic signal at the 14th street intersection is stuck on red for the last 5 hours. Creating massive traffic jams.',
        category: 'Road',
        status: 'Open',
        location: '110001',
        lat: 28.6180,
        lng: 77.2150,
        image: 'https://images.unsplash.com/photo-1541819793132-0545fdfd1aa1?auto=format&fit=crop&q=80&w=800',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Kavita Iyer' },
        assignedTo: null,
      },
      {
        _id: 'demo_011',
        title: 'Stray dog menace near playground',
        description: 'A pack of aggressive stray dogs has taken over the children\'s playground. Parents are afraid to send their kids out.',
        category: 'Other',
        status: 'Open',
        location: '110022',
        lat: 28.5600,
        lng: 77.1600,
        image: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Sumit Singh' },
        assignedTo: null,
      },
      {
        _id: 'demo_012',
        title: 'Uncovered manhole',
        description: 'A deep manhole cover is missing right in the middle of a pedestrian crossing. Highly dangerous, especially at night.',
        category: 'Water',
        status: 'Resolved',
        location: '110011',
        lat: 28.6010,
        lng: 77.2270,
        image: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { name: 'Neha Khanna' },
        assignedTo: { name: 'PWD' },
      },
    ];
    saveDemoIssues(seed);
  }
};

// Initialize seed data on first load
seedDemoData();

// ---- Auth APIs (mocked) ----
export const loginUser = async (email, password) => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  const user = { name: 'Demo User', email, role: 'citizen' };
  return {
    data: {
      success: true,
      token: 'demo-token-xyz',
      user,
    },
  };
};

export const signupUser = async (name, email, password, role) => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    data: {
      success: true,
      message: 'Demo signup successful',
    },
  };
};

export const getMe = async () => {
  await new Promise((r) => setTimeout(r, 200));
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    data: {
      success: true,
      user: user || { name: 'Demo User', email: 'demo@civicsense.com' },
    },
  };
};

// ---- Issue APIs (mocked) ----
export const createIssue = async (formData) => {
  await new Promise((r) => setTimeout(r, 700));

  // Extract data from FormData
  const title = formData.get('title');
  const description = formData.get('description');
  const category = formData.get('category') || 'Other';
  const location = formData.get('location');
  const lat = parseFloat(formData.get('lat'));
  const lng = parseFloat(formData.get('lng'));

  const issues = getDemoIssues();
  const newIssue = {
    _id: 'demo_' + Date.now().toString(36),
    title,
    description,
    category,
    status: 'Open',
    location,
    lat,
    lng,
    image: null,
    createdAt: new Date().toISOString(),
    createdBy: { name: 'Demo User' },
    assignedTo: null,
  };

  issues.unshift(newIssue);
  saveDemoIssues(issues);

  return { data: { success: true, data: newIssue } };
};

export const getIssues = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 400));

  let issues = getDemoIssues();

  // Apply filters
  if (params.category && params.category !== 'All') {
    issues = issues.filter((i) => i.category === params.category);
  }
  if (params.status && params.status !== 'All') {
    issues = issues.filter((i) => i.status === params.status);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    issues = issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  // Apply sorting
  if (params.sort === 'oldest') {
    issues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return { data: { success: true, data: issues } };
};

export const getIssueStats = async () => {
  await new Promise((r) => setTimeout(r, 300));

  const issues = getDemoIssues();

  const status = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  const categories = { Garbage: 0, Road: 0, Water: 0, Electricity: 0, Other: 0 };

  issues.forEach((issue) => {
    if (status[issue.status] !== undefined) status[issue.status]++;
    if (categories[issue.category] !== undefined) categories[issue.category]++;
  });

  return {
    data: {
      success: true,
      data: {
        total: issues.length,
        status,
        categories,
      },
    },
  };
};

export const getIssueById = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  const issues = getDemoIssues();
  const issue = issues.find((i) => i._id === id);
  return { data: { success: true, data: issue || null } };
};

export const updateIssueStatus = async (id, newStatus) => {
  await new Promise((r) => setTimeout(r, 400));
  const issues = getDemoIssues();
  const idx = issues.findIndex((i) => i._id === id);
  if (idx !== -1) {
    issues[idx].status = newStatus;
    saveDemoIssues(issues);
  }
  return { data: { success: true, data: issues[idx] } };
};

export const deleteIssue = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  let issues = getDemoIssues();
  issues = issues.filter((i) => i._id !== id);
  saveDemoIssues(issues);
  return { data: { success: true } };
};

// Default export (no-op, consumers that imported the default axios instance won't crash)
export default {};
