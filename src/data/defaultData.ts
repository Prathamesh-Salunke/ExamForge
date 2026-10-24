import { Subject, Student, Classroom } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  // CS Students (Batch A)
  { id: 'STU-01', rollNo: '24-CS-101', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-02', rollNo: '24-CS-102', name: 'Ananya Deshmukh', email: 'ananya.d@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-03', rollNo: '24-CS-103', name: 'Rohan Patil', email: 'rohan.patil@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-04', rollNo: '24-CS-104', name: 'Ishita Verma', email: 'ishita.v@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-05', rollNo: '24-CS-105', name: 'Kabir Kulkarni', email: 'kabir.k@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-06', rollNo: '24-CS-106', name: 'Neha Joshi', email: 'neha.j@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-07', rollNo: '24-CS-107', name: 'Aditya Shinde', email: 'aditya.s@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-08', rollNo: '24-CS-108', name: 'Pooja Nair', email: 'pooja.n@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-09', rollNo: '24-CS-109', name: 'Vikram Mehta', email: 'vikram.m@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-10', rollNo: '24-CS-110', name: 'Sneha More', email: 'sneha.m@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-11', rollNo: '24-CS-111', name: 'Yash Bhosale', email: 'yash.b@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-12', rollNo: '24-CS-112', name: 'Tanvi Gaikwad', email: 'tanvi.g@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-13', rollNo: '24-CS-113', name: 'Harsh Vardhan', email: 'harsh.v@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-14', rollNo: '24-CS-114', name: 'Diya Sawant', email: 'diya.s@college.edu', department: 'Computer Science', semester: 4 },
  { id: 'STU-15', rollNo: '24-CS-115', name: 'Siddharth Rao', email: 'siddharth.r@college.edu', department: 'Computer Science', semester: 4 },

  // IT Students (Batch B)
  { id: 'STU-16', rollNo: '24-IT-201', name: 'Meera Chawla', email: 'meera.c@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-17', rollNo: '24-IT-202', name: 'Devendra Chavan', email: 'devendra.c@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-18', rollNo: '24-IT-203', name: 'Riya Gupta', email: 'riya.g@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-19', rollNo: '24-IT-204', name: 'Kunal Jadhav', email: 'kunal.j@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-20', rollNo: '24-IT-205', name: 'Shruti Kamble', email: 'shruti.k@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-21', rollNo: '24-IT-206', name: 'Pranav Mane', email: 'pranav.m@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-22', rollNo: '24-IT-207', name: 'Sakshi Pawar', email: 'sakshi.p@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-23', rollNo: '24-IT-208', name: 'Omkar Salvi', email: 'omkar.s@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-24', rollNo: '24-IT-209', name: 'Gauri Tambe', email: 'gauri.t@college.edu', department: 'Information Technology', semester: 4 },
  { id: 'STU-25', rollNo: '24-IT-210', name: 'Nikhil Rane', email: 'nikhil.r@college.edu', department: 'Information Technology', semester: 4 },

  // AI & Data Science Students (Batch C)
  { id: 'STU-26', rollNo: '24-AI-301', name: 'Arya Kadam', email: 'arya.k@college.edu', department: 'AI & Data Science', semester: 4 },
  { id: 'STU-27', rollNo: '24-AI-302', name: 'Manish Bhat', email: 'manish.b@college.edu', department: 'AI & Data Science', semester: 4 },
  { id: 'STU-28', rollNo: '24-AI-303', name: 'Sayali Jagtap', email: 'sayali.j@college.edu', department: 'AI & Data Science', semester: 4 },
  { id: 'STU-29', rollNo: '24-AI-304', name: 'Tushar Shinde', email: 'tushar.s@college.edu', department: 'AI & Data Science', semester: 4 },
  { id: 'STU-30', rollNo: '24-AI-305', name: 'Vaishnavi Gole', email: 'vaishnavi.g@college.edu', department: 'AI & Data Science', semester: 4 },

  // Electronics & Interdisciplinary
  { id: 'STU-31', rollNo: '24-EC-401', name: 'Gaurav Kulkarni', email: 'gaurav.k@college.edu', department: 'Electronics', semester: 4 },
  { id: 'STU-32', rollNo: '24-EC-402', name: 'Pallavi Dixit', email: 'pallavi.d@college.edu', department: 'Electronics', semester: 4 },
  { id: 'STU-33', rollNo: '24-EC-403', name: 'Sanket Date', email: 'sanket.d@college.edu', department: 'Electronics', semester: 4 },
  { id: 'STU-34', rollNo: '24-EC-404', name: 'Madhura Kale', email: 'madhura.k@college.edu', department: 'Electronics', semester: 4 },
  { id: 'STU-35', rollNo: '24-EC-405', name: 'Chinmay Sane', email: 'chinmay.s@college.edu', department: 'Electronics', semester: 4 },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'SUB-CS301',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-01', 'STU-02', 'STU-03', 'STU-04', 'STU-05',
      'STU-06', 'STU-07', 'STU-08', 'STU-09', 'STU-10',
      'STU-11', 'STU-12', 'STU-13', 'STU-14', 'STU-15',
      'STU-26', 'STU-27', 'STU-28' // Shared with AI Batch
    ],
  },
  {
    id: 'SUB-CS302',
    code: 'CS302',
    name: 'Database Management Systems',
    department: 'Computer Science',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-01', 'STU-02', 'STU-03', 'STU-04', 'STU-05',
      'STU-06', 'STU-07', 'STU-08', 'STU-16', 'STU-17',
      'STU-18', 'STU-19', 'STU-20' // Shares CS Batch & IT Students
    ],
  },
  {
    id: 'SUB-MA201',
    code: 'MA201',
    name: 'Discrete Mathematics & Graph Theory',
    department: 'Applied Mathematics',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-01', 'STU-02', 'STU-03', 'STU-04', 'STU-05',
      'STU-09', 'STU-10', 'STU-11', 'STU-12', 'STU-13',
      'STU-16', 'STU-17', 'STU-18', 'STU-21', 'STU-22',
      'STU-26', 'STU-27', 'STU-28', 'STU-29', 'STU-30'
    ],
  },
  {
    id: 'SUB-CS303',
    code: 'CS303',
    name: 'Computer Networks & Security',
    department: 'Computer Science',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-07', 'STU-08', 'STU-09', 'STU-10', 'STU-11',
      'STU-12', 'STU-13', 'STU-14', 'STU-15', 'STU-23',
      'STU-24', 'STU-25'
    ],
  },
  {
    id: 'SUB-IT301',
    code: 'IT301',
    name: 'Web Technologies & Cloud Platforms',
    department: 'Information Technology',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-16', 'STU-17', 'STU-18', 'STU-19', 'STU-20',
      'STU-21', 'STU-22', 'STU-23', 'STU-24', 'STU-25'
    ],
  },
  {
    id: 'SUB-AI301',
    code: 'AI301',
    name: 'Artificial Intelligence & Neural Nets',
    department: 'AI & Data Science',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-26', 'STU-27', 'STU-28', 'STU-29', 'STU-30',
      'STU-04', 'STU-05' // Elective takers from CS
    ],
  },
  {
    id: 'SUB-EC204',
    code: 'EC204',
    name: 'Digital Electronics & Microcontrollers',
    department: 'Electronics',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-31', 'STU-32', 'STU-33', 'STU-34', 'STU-35'
    ],
  },
  {
    id: 'SUB-OE102',
    code: 'OE102',
    name: 'Cyber Laws & Professional Ethics',
    department: 'Humanities & Management',
    semester: 4,
    durationMinutes: 180,
    enrolledStudentIds: [
      'STU-31', 'STU-32', 'STU-33', 'STU-34', 'STU-35',
      'STU-14', 'STU-15'
    ],
  },
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'RM-AUDI',
    name: 'Central Auditorium',
    building: 'Block A (Main Administrative)',
    floor: 1,
    capacity: 75,
    isActive: true,
    isLab: false,
  },
  {
    id: 'RM-LH101',
    name: 'Lecture Hall 101',
    building: 'Block B (Science Wing)',
    floor: 1,
    capacity: 45,
    isActive: true,
    isLab: false,
  },
  {
    id: 'RM-LH102',
    name: 'Lecture Hall 102',
    building: 'Block B (Science Wing)',
    floor: 1,
    capacity: 40,
    isActive: true,
    isLab: false,
  },
  {
    id: 'RM-LH201',
    name: 'Smart Classroom 201',
    building: 'Block C (Tech Tower)',
    floor: 2,
    capacity: 32,
    isActive: true,
    isLab: false,
  },
  {
    id: 'RM-LH202',
    name: 'Smart Classroom 202',
    building: 'Block C (Tech Tower)',
    floor: 2,
    capacity: 28,
    isActive: true,
    isLab: false,
  },
  {
    id: 'RM-LAB01',
    name: 'Computing Lab 1',
    building: 'Block C (Tech Tower)',
    floor: 3,
    capacity: 25,
    isActive: true,
    isLab: true,
  },
  {
    id: 'RM-TUT401',
    name: 'Tutorial Room 401 (Maintenance)',
    building: 'Block A (Annex)',
    floor: 4,
    capacity: 20,
    isActive: false, // Inactive: proves capacity and inactive filter in UI
    isLab: false,
  },
];
