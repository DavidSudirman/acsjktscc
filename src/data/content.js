// Single source of truth for club content.
// Everything here was carried over from the original ACS SCC site.

export const club = {
  name: "ACS STEM/Coding Club",
  short: "ACS SCC",
  tagline: "We build. We learn. We ship code.",
  blurb:
    "ACS SCC is a student-run club with four tracks — Beginner Python, Robotics, Web Dev/AI, and DSA — where members build real projects and prep for competitions together.",
  email: "acsscc@acs.edu",
  year: 2026,
};

export const stats = [
  { num: "40+", label: "Active members" },
  { num: "15+", label: "Projects built" },
  { num: "30+", label: "Sessions run" },
  { num: "3", label: "Years running" },
];

export const tracks = [
  {
    id: "python",
    index: "01",
    name: "Beginner Python",
    short: "Python",
    color: "#D9A441",
    summary:
      "No experience needed. Learn Python fundamentals — variables, loops, functions, and small projects — from the ground up.",
    keywords: ["variables", "loops", "functions", "file I/O"],
  },
  {
    id: "robotics",
    index: "02",
    name: "Robotics",
    short: "Robotics",
    color: "#E4572E",
    summary:
      "Build and program real robots with Arduino — sensors, motors, circuits, and hands-on hardware projects.",
    keywords: ["arduino", "sensors", "servos", "circuits"],
  },
  {
    id: "webai",
    index: "03",
    name: "Web Dev / AI",
    short: "Web / AI",
    color: "#5AC8DE",
    summary:
      "Build websites and apps, then explore AI/ML basics — APIs, interactive UIs, and simple machine learning models.",
    keywords: ["html/css", "javascript", "apis", "scikit-learn"],
  },
  {
    id: "dsa",
    index: "04",
    name: "DSA",
    short: "DSA",
    color: "#9FD356",
    summary:
      "Data structures and algorithms practice for members prepping for technical interviews and competitive programming.",
    keywords: ["arrays", "graphs", "big-O", "dynamic programming"],
  },
];

export const projects = [
  {
    id: "guessing-game",
    title: "Number Guessing Game",
    category: "python",
    glyph: "🐍",
    desc: "A classic beginner Python project — practicing loops, conditionals, and functions by building an interactive guessing game.",
    tags: ["Python", "Beginner"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "todo-cli",
    title: "To-Do List CLI",
    category: "python",
    glyph: "📝",
    desc: "A command-line to-do list app teaching file I/O, lists, and basic data structures in Python.",
    tags: ["Python", "Beginner"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "line-robot",
    title: "Line-Following Robot",
    category: "robotics",
    glyph: "🤖",
    desc: "An Arduino-powered robot that uses IR sensors to follow a track — our intro robotics build.",
    tags: ["Arduino", "C++", "Sensors"],
    links: [{ label: "GitHub", href: "#" }],
    featured: true,
  },
  {
    id: "claw-arm",
    title: "Robotic Claw Arm",
    category: "robotics",
    glyph: "🦾",
    desc: "A servo-controlled claw arm built and coded by a robotics team, controlled with a custom joystick rig.",
    tags: ["Arduino", "Servos", "3D Printing"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "weather",
    title: "Weather Dashboard",
    category: "webai",
    glyph: "🌦️",
    desc: "A live weather dashboard built during our web dev workshop series, pulling from a public weather API.",
    tags: ["JavaScript", "API", "CSS"],
    links: [
      { label: "GitHub", href: "#" },
      { label: "Live Demo", href: "#" },
    ],
    featured: true,
  },
  {
    id: "study-sorter",
    title: "Study Sorter ML Demo",
    category: "webai",
    glyph: "🧠",
    desc: "A machine learning project that automatically sorts study notes into subjects using text classification.",
    tags: ["Python", "scikit-learn"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "chatbot",
    title: "Homework Helper Chatbot",
    category: "webai",
    glyph: "💬",
    desc: "An AI-assisted chatbot prototype that answers common math and CS homework questions.",
    tags: ["Python", "NLP", "AI"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "resource-hub",
    title: "Club Resource Hub",
    category: "webai",
    glyph: "📚",
    desc: "An internal site (this one!) that showcases club projects, sessions, and how to get involved.",
    tags: ["HTML", "CSS", "JavaScript"],
    links: [{ label: "GitHub", href: "#" }],
  },
  {
    id: "algo-viz",
    title: "Algorithm Visualizer",
    category: "dsa",
    glyph: "🧩",
    desc: "A browser tool that animates sorting and pathfinding algorithms step-by-step to help members study for interviews and competitions.",
    tags: ["JavaScript", "DSA"],
    links: [
      { label: "GitHub", href: "#" },
      { label: "Live Demo", href: "#" },
    ],
    featured: true,
  },
  {
    id: "leetcode",
    title: "Weekly LeetCode Tracker",
    category: "dsa",
    glyph: "🏆",
    desc: "A shared tracker where members log solved problems by topic (arrays, trees, graphs, DP) to prep for competitions and interviews.",
    tags: ["Python", "DSA"],
    links: [{ label: "GitHub", href: "#" }],
  },
];

export const upcomingSessions = [
  {
    date: "Aug 26, 2026",
    meta: "3:30–4:30 PM · Room 214",
    title: "Beginner Python: Variables & Loops",
    desc: "First session of the Beginner Python track — no experience required. We'll set up your environment and write your first programs.",
  },
  {
    date: "Sept 2, 2026",
    meta: "3:30–4:30 PM · Room 214",
    title: "Track Kickoff Night",
    desc: "Pick your track — Beginner Python, Robotics, Web Dev/AI, or DSA — and meet your team for the semester.",
  },
  {
    date: "Sept 9, 2026",
    meta: "3:30–4:30 PM · Robotics Lab",
    title: "Robotics: Arduino & Circuits 101",
    desc: "An intro to the Robotics track — wiring circuits, reading sensors, and programming your first Arduino sketch.",
  },
  {
    date: "Sept 16, 2026",
    meta: "3:30–4:30 PM · Room 214",
    title: "Web Dev/AI: Building Your First Web Page",
    desc: "Kicks off the Web Dev/AI track with HTML/CSS fundamentals before moving into JavaScript and APIs.",
  },
  {
    date: "Sept 23, 2026",
    meta: "3:30–4:30 PM · Room 214",
    title: "DSA: Arrays & Big-O Basics",
    desc: "Kicks off the DSA track — core data structures and how to reason about time/space complexity.",
  },
];

export const pastSessions = [
  {
    date: "May 6, 2026",
    title: "End-of-Year Showcase",
    desc: "Members demoed their finished projects to the club and invited guests.",
  },
  {
    date: "April 22, 2026",
    title: "Intro to Machine Learning",
    desc: "Covered the basics of training a simple classifier using scikit-learn.",
  },
  {
    date: "April 8, 2026",
    title: "Game Jam Night",
    desc: "Teams built small browser games from scratch in one session using JavaScript canvas.",
  },
  {
    date: "March 18, 2026",
    title: "Arduino & Hardware Basics",
    desc: "Introduced sensors, circuits, and basic microcontroller programming.",
  },
  {
    date: "February 25, 2026",
    title: "APIs & Building the Weather Dashboard",
    desc: "Learned how to fetch and display live data from a public API.",
  },
];

export const officers = [
  {
    initials: "JL",
    name: "Jordan Lee",
    role: "President",
    bio: "Runs weekly meetings and leads our web dev project track.",
  },
  {
    initials: "AM",
    name: "Ava Martinez",
    role: "Vice President",
    bio: "Organizes workshops and coordinates with guest speakers.",
  },
  {
    initials: "SK",
    name: "Sam Kim",
    role: "Head of Projects",
    bio: "Matches members to project teams and tracks progress.",
  },
  {
    initials: "RP",
    name: "Riya Patel",
    role: "Outreach & Social Media",
    bio: "Runs the club's Discord and Instagram, and plans events.",
  },
];

export const pillars = [
  {
    title: "Our Mission",
    body: "To make coding and STEM approachable for every ACS student — no experience necessary — through hands-on projects, peer teaching, and a genuinely fun club environment.",
  },
  {
    title: "What We Do",
    body: "Weekly workshops, ongoing team projects, guest speaker talks, and prep for hackathons and competitions like Congressional App Challenge.",
  },
  {
    title: "Who Can Join",
    body: "Any ACS student — total beginners and experienced coders alike. We split into skill-based tracks so everyone has something to work on.",
  },
];

export const channels = [
  {
    title: "Discord",
    desc: "Join our server for updates and to chat with members.",
    linkLabel: "Join Discord",
    href: "#",
  },
  {
    title: "Instagram",
    desc: "Follow along for event photos and announcements.",
    linkLabel: "@acs.scc",
    href: "#",
  },
  {
    title: "Email",
    desc: "Reach the officers directly with any questions.",
    linkLabel: club.email,
    href: `mailto:${club.email}`,
  },
];

export const nav = [
  { label: "Index", href: "/index.html" },
  { label: "Projects", href: "/projects.html" },
  { label: "Sessions", href: "/sessions.html" },
  { label: "About", href: "/about.html" },
  { label: "Join", href: "/join.html" },
];
