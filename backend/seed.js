const mongoose = require('mongoose')
require('dotenv').config()
const User = require('./models/User')
const School = require('./models/School')
const InspectionPlan = require('./models/InspectionPlan')
const Inspection = require('./models/Inspection')

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await School.deleteMany({})
    await InspectionPlan.deleteMany({})
    await Inspection.deleteMany({})

    // Create test users (using create to trigger pre-save middleware for password hashing)
    const user1 = await User.create({
      employeeId: 'ceo001',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh@education.tn.gov.in',
      phone: '9876543210',
      password: 'password123',
      role: 'CEO',
      district: 'Chennai',
    })

    const user2 = await User.create({
      employeeId: 'mu001',
      name: 'Mr. Muhilan',
      email: 'muhilan@education.tn.gov.in',
      phone: '9876543211',
      password: 'password123',
      role: 'DEO/BEO',
      district: 'Chennai',
      block: 'Perambur',
    })

    const user3 = await User.create({
      employeeId: 'hm001',
      name: 'Mrs. Lakshmi Devi',
      email: 'lakshmi@school.tn.gov.in',
      phone: '9876543212',
      password: 'password123',
      role: 'HEADMASTER',
      // Must match a school name or ObjectId / UDISE in DB (see headmasterController.resolveHeadmasterSchool)
      school: 'Habitat Hostel',
    })
    const user4 = await User.create({
      employeeId: 'mo001',
      name: 'MohanPrasath',
      email: 'mohan@education.tn.gov.in',
      phone: '9876543215',
      password: 'password123',
      role: 'DEO/BEO',
      district: 'Chennai',
      block: 'Perambur',
    })

    const users = [user1, user2, user3, user4]
    console.log('✅ Users created:', users.length)

    // Create test schools
    const schools = await School.insertMany([
      {
        name: 'Government Higher Secondary School, Perambur',
        udiseCode: '33050100101',
        district: 'Chennai',
        block: 'Perambur',
        village: 'Perambur',
        pincode: '600012',
        latitude: 13.1436,
        longitude: 80.127,
        principalName: 'Mrs. Lakshmi Devi',
        principalPhone: '9876543212',
        totalStudents: 850,
        totalTeachers: 35,
        schoolType: 'HIGH',
      },
      {
        name: 'Government Primary School, Chintadripet',
        udiseCode: '33050100102',
        district: 'Chennai',
        block: 'Perambur',
        village: 'Chintadripet',
        pincode: '600002',
        latitude: 13.1522,
        longitude: 80.1291,
        principalName: 'Mr. Ramakrishnan',
        principalPhone: '9876543213',
        totalStudents: 320,
        totalTeachers: 12,
        schoolType: 'PRIMARY',
      },{
        name: 'REC',
        udiseCode: '33050100104',
        district: 'Chennai',
        block: 'Thandalam',
        village: 'Thandalam',
        pincode: '602105',
        latitude: 13.008482,
        longitude: 80.002029,
        principalName: 'Mr. Ramakrishnan',
        principalPhone: '9876543213',
        totalStudents: 320,
        totalTeachers: 12,
        schoolType: 'HIGHER_SECONDARY',
      },
      {
        name: 'Government Middle School, Royapuram',
        udiseCode: '33050100103',
        district: 'Chennai',
        block: 'Perambur',
        village: 'Royapuram',
        pincode: '600013',
        latitude: 13.1649,
        longitude: 80.1181,
        principalName: 'Mrs. Priya Singh',
        principalPhone: '9876543214',
        totalStudents: 550,
        totalTeachers: 22,
        schoolType: 'MIDDLE',
      },
      {
        name: 'Habitat Hostel',
        udiseCode: '33050100163',
        district: 'Chennai',
        block: 'irungattukottai',
        village: 'Sriprembadhur',
        pincode: '602105',
        latitude: 13.007433,
        longitude: 79.994869,
        principalName: 'MR Bharath',
        principalPhone: '9876543714',
        totalStudents: 550,
        totalTeachers: 22,
        schoolType: 'MIDDLE',
      }
      
    ])

    console.log('✅ Schools created:', schools.length)

    // Create test inspection plan
    const plan = await InspectionPlan.create({
      createdBy: users[0]._id, // CEO
      title: 'Q2 2024 School Inspection Drive',
      description: 'Quarterly inspection of all government schools in Perambur block',
      schools: schools.map((s) => s._id),
      assignedTo: [
        {
          userId: users[1]._id, // DEO
          schools: schools.map((s) => s._id),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      checklist: {
        infrastructure: [
          'Building condition',
          'Classrooms - sufficient',
          'Toilets - functional',
          'Drinking water - clean',
          'Playground - available',
        ],
        academic: [
          'Curriculum implementation',
          'Textbooks available',
          'Teacher attendance',
          'Student performance',
        ],
        governmentSchemes: [
          'Mid Day Meal distribution',
          'Scholarship records',
          'Uniform supply',
        ],
        safety: [
          'Fire safety measures',
          'First aid kit',
          'Discipline policies',
          'Staff trained',
        ],
      },
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    })

    console.log('✅ Inspection plan created')

    // Create test inspections with some completed with photos and locations
    const inspections = await Inspection.insertMany([
      {
        inspectionPlanId: plan._id,
        schoolId: schools[0]._id,
        inspectorId: users[1]._id, // DEO
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        findings: 'School infrastructure is in good condition. Classrooms are well-maintained with proper ventilation and lighting. Supporting facilities like toilets and drinking water are functional.',
        recommendations: 'Recommend adding more computers to the lab. Update teaching materials for advanced classes. Consider renovation of the library section.',
        overallRating: 'GOOD',
        photos: [
          {
            url: '/uploads/photo1.jpg',
            filename: 'photo1.jpg',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            latitude: 13.1341,
            longitude: 80.1429,
            accuracy: 10,
          },
          {
            url: '/uploads/photo2.jpg',
            filename: 'photo2.jpg',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            latitude: 13.1345,
            longitude: 80.1433,
            accuracy: 8,
          },
        ],
        locationHistory: [
          {
            latitude: 13.1341,
            longitude: 80.1429,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            accuracy: 10,
          },
          {
            latitude: 13.1345,
            longitude: 80.1433,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
            accuracy: 12,
          },
          {
            latitude: 13.1349,
            longitude: 80.1437,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            accuracy: 9,
          },
          {
            latitude: 13.1352,
            longitude: 80.1440,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            accuracy: 11,
          },
          {
            latitude: 13.1355,
            longitude: 80.1444,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            accuracy: 8,
          },
          {
            latitude: 13.1358,
            longitude: 80.1447,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000),
            accuracy: 10,
          },
          {
            latitude: 13.1341,
            longitude: 80.1429,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
            accuracy: 9,
          },
        ],
      },
      {
        inspectionPlanId: plan._id,
        schoolId: schools[1]._id,
        inspectorId: users[1]._id, // DEO
        status: 'PENDING',
      },
      {
        inspectionPlanId: plan._id,
        schoolId: schools[2]._id,
        inspectorId: users[1]._id, // DEO
        status: 'PENDING',
      },
    ])

    console.log('✅ Inspections created:', inspections.length)

    console.log('\n📊 Database seeded successfully!')
    console.log('\n🔐 Test Login Credentials:')
    console.log('CEO:       ceo001 / password123')
    console.log('DEO:       deo001 / password123')
    console.log('Headmaster: hm001 / password123')
    console.log('\n💡 Tip: After login, enter OTP: 123456')

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
