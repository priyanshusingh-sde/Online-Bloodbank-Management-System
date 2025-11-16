// Improved Seeder script to populate database with comprehensive sample data
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Define Schemas
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    userType: { type: String, enum: ['donor', 'recipient'], required: true },
    weight: { type: Number },
    lastDonation: { type: String },
    noDiseases: { type: Boolean },
    noMedication: { type: Boolean },
    emergencyContact: { type: Boolean },
    totalDonations: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    urgencyLevel: { type: String },
    unitsRequired: { type: Number },
    hospitalName: { type: String },
    hospitalAddress: { type: String },
    doctorName: { type: String },
    medicalCondition: { type: String },
    emergencyContactNumber: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    requirements: { type: String },
    status: { 
        type: String, 
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], 
        default: 'scheduled' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const bloodRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    bloodType: { type: String, required: true },
    units: { type: Number, required: true },
    hospitalName: { type: String, required: true },
    requiredDate: { type: Date, required: true },
    urgencyLevel: { type: String, required: true },
    medicalReason: { type: String, required: true },
    doctorName: { type: String },
    contactNumber: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'], 
        default: 'pending' 
    },
    timeline: [{
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

// Sample data
async function seedDatabase() {
    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Appointment.deleteMany({});
        await BloodRequest.deleteMany({});
        console.log('✅ Existing data cleared');

        // Create Donors (10 donors)
        const donorData = [
            {
                fullName: 'Rajesh Kumar',
                email: 'rajesh.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543210',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                bloodGroup: 'O+',
                address: '123 Main Street, Delhi Apt 101',
                city: 'Delhi',
                state: 'Delhi',
                pinCode: '110001',
                userType: 'donor',
                weight: 70,
                lastDonation: '6months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 5,
                rewardPoints: 500
            },
            {
                fullName: 'Priya Sharma',
                email: 'priya.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543211',
                dateOfBirth: new Date('1992-08-22'),
                gender: 'female',
                bloodGroup: 'B+',
                address: '456 Oak Avenue, Mumbai Apt 202',
                city: 'Mumbai',
                state: 'Maharashtra',
                pinCode: '400001',
                userType: 'donor',
                weight: 62,
                lastDonation: '3-6months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 7,
                rewardPoints: 700
            },
            {
                fullName: 'Amit Patel',
                email: 'amit.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543212',
                dateOfBirth: new Date('1988-03-10'),
                gender: 'male',
                bloodGroup: 'A+',
                address: '789 Pine Road, Bangalore Apt 303',
                city: 'Bangalore',
                state: 'Karnataka',
                pinCode: '560001',
                userType: 'donor',
                weight: 75,
                lastDonation: 'never',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 0,
                rewardPoints: 0
            },
            {
                fullName: 'Neha Verma',
                email: 'neha.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543213',
                dateOfBirth: new Date('1995-12-05'),
                gender: 'female',
                bloodGroup: 'AB+',
                address: '321 Elm Street, Hyderabad Apt 404',
                city: 'Hyderabad',
                state: 'Telangana',
                pinCode: '500001',
                userType: 'donor',
                weight: 58,
                lastDonation: '3months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 3,
                rewardPoints: 300
            },
            {
                fullName: 'Vikram Singh',
                email: 'vikram.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543214',
                dateOfBirth: new Date('1991-07-18'),
                gender: 'male',
                bloodGroup: 'O-',
                address: '654 Maple Drive, Pune Apt 505',
                city: 'Pune',
                state: 'Maharashtra',
                pinCode: '411001',
                userType: 'donor',
                weight: 72,
                lastDonation: '6months',
                noDiseases: true,
                noMedication: false,
                emergencyContact: true,
                totalDonations: 4,
                rewardPoints: 400
            },
            {
                fullName: 'Kavita Deshmukh',
                email: 'kavita.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543215',
                dateOfBirth: new Date('1993-04-25'),
                gender: 'female',
                bloodGroup: 'A-',
                address: '123 Lake View, Chennai',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pinCode: '600001',
                userType: 'donor',
                weight: 60,
                lastDonation: '6months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 6,
                rewardPoints: 600
            },
            {
                fullName: 'Rohit Gupta',
                email: 'rohit.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543216',
                dateOfBirth: new Date('1989-11-30'),
                gender: 'male',
                bloodGroup: 'B-',
                address: '789 Park Street, Kolkata',
                city: 'Kolkata',
                state: 'West Bengal',
                pinCode: '700001',
                userType: 'donor',
                weight: 78,
                lastDonation: '3-6months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 8,
                rewardPoints: 800
            },
            {
                fullName: 'Sneha Iyer',
                email: 'sneha.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543217',
                dateOfBirth: new Date('1994-06-15'),
                gender: 'female',
                bloodGroup: 'O+',
                address: '456 Gandhi Road, Jaipur',
                city: 'Jaipur',
                state: 'Rajasthan',
                pinCode: '302001',
                userType: 'donor',
                weight: 57,
                lastDonation: '3months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 2,
                rewardPoints: 200
            },
            {
                fullName: 'Arjun Reddy',
                email: 'arjun.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543218',
                dateOfBirth: new Date('1987-02-28'),
                gender: 'male',
                bloodGroup: 'AB-',
                address: '321 MG Road, Ahmedabad',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pinCode: '380001',
                userType: 'donor',
                weight: 82,
                lastDonation: 'never',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 0,
                rewardPoints: 0
            },
            {
                fullName: 'Meera Nair',
                email: 'meera.donor@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '9876543219',
                dateOfBirth: new Date('1996-09-12'),
                gender: 'female',
                bloodGroup: 'A+',
                address: '654 Beach Road, Kochi',
                city: 'Kochi',
                state: 'Kerala',
                pinCode: '682001',
                userType: 'donor',
                weight: 55,
                lastDonation: '6months',
                noDiseases: true,
                noMedication: true,
                emergencyContact: true,
                totalDonations: 4,
                rewardPoints: 400
            }
        ];

        // Create Recipients (10 recipients)
        const recipientData = [
            {
                fullName: 'Anjali Desai',
                email: 'anjali.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432101',
                dateOfBirth: new Date('1994-06-20'),
                gender: 'female',
                bloodGroup: 'O+',
                address: '111 Hospital Street, Delhi',
                city: 'Delhi',
                state: 'Delhi',
                pinCode: '110002',
                userType: 'recipient',
                urgencyLevel: 'Urgent',
                unitsRequired: 2,
                hospitalName: 'Apollo Hospital Delhi',
                hospitalAddress: '123 Mathura Road, Delhi',
                doctorName: 'Dr. Rajesh Gupta',
                medicalCondition: 'Post-surgical blood transfusion required',
                emergencyContactNumber: '8765432101'
            },
            {
                fullName: 'Suresh Menon',
                email: 'suresh.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432102',
                dateOfBirth: new Date('1985-11-12'),
                gender: 'male',
                bloodGroup: 'B+',
                address: '222 Medical Plaza, Mumbai',
                city: 'Mumbai',
                state: 'Maharashtra',
                pinCode: '400002',
                userType: 'recipient',
                urgencyLevel: 'Critical',
                unitsRequired: 4,
                hospitalName: 'Lilavati Hospital Mumbai',
                hospitalAddress: '80 Bandra Reclamation, Mumbai',
                doctorName: 'Dr. Priya Iyer',
                medicalCondition: 'Severe anemia requiring immediate transfusion',
                emergencyContactNumber: '8765432102'
            },
            {
                fullName: 'Ramesh Kumar',
                email: 'ramesh.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432103',
                dateOfBirth: new Date('1980-09-08'),
                gender: 'male',
                bloodGroup: 'A+',
                address: '333 Medical Center, Bangalore',
                city: 'Bangalore',
                state: 'Karnataka',
                pinCode: '560002',
                userType: 'recipient',
                urgencyLevel: 'Regular',
                unitsRequired: 3,
                hospitalName: 'Fortis Hospital Bangalore',
                hospitalAddress: 'Bannerghatta Road, Bangalore',
                doctorName: 'Dr. Arjun Singh',
                medicalCondition: 'Scheduled operation - blood transfusion planned',
                emergencyContactNumber: '8765432103'
            },
            {
                fullName: 'Divya Kapoor',
                email: 'divya.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432104',
                dateOfBirth: new Date('1993-04-30'),
                gender: 'female',
                bloodGroup: 'AB+',
                address: '444 Health Complex, Hyderabad',
                city: 'Hyderabad',
                state: 'Telangana',
                pinCode: '500002',
                userType: 'recipient',
                urgencyLevel: 'Urgent',
                unitsRequired: 2,
                hospitalName: 'Max Hospital Hyderabad',
                hospitalAddress: 'Madhapur, Hyderabad',
                doctorName: 'Dr. Meera Nair',
                medicalCondition: 'Treatment for dengue fever complications',
                emergencyContactNumber: '8765432104'
            },
            {
                fullName: 'Karan Reddy',
                email: 'karan.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432105',
                dateOfBirth: new Date('1987-02-14'),
                gender: 'male',
                bloodGroup: 'O-',
                address: '555 Care Hospital, Pune',
                city: 'Pune',
                state: 'Maharashtra',
                pinCode: '411002',
                userType: 'recipient',
                urgencyLevel: 'Critical',
                unitsRequired: 5,
                hospitalName: 'Ruby Hall Clinic Pune',
                hospitalAddress: 'Sassoon Road, Pune',
                doctorName: 'Dr. Vivek Joshi',
                medicalCondition: 'Accident victim requiring immediate blood transfusion',
                emergencyContactNumber: '8765432105'
            },
            {
                fullName: 'Lakshmi Bhat',
                email: 'lakshmi.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432106',
                dateOfBirth: new Date('1991-08-20'),
                gender: 'female',
                bloodGroup: 'A-',
                address: '123 Medical Street, Chennai',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pinCode: '600002',
                userType: 'recipient',
                urgencyLevel: 'Urgent',
                unitsRequired: 2,
                hospitalName: 'Apollo Hospitals Chennai',
                hospitalAddress: 'Greams Road, Chennai',
                doctorName: 'Dr. Sunita Rao',
                medicalCondition: 'Pregnancy complications requiring blood',
                emergencyContactNumber: '8765432106'
            },
            {
                fullName: 'Prakash Sen',
                email: 'prakash.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432107',
                dateOfBirth: new Date('1978-12-05'),
                gender: 'male',
                bloodGroup: 'B-',
                address: '789 Hospital Road, Kolkata',
                city: 'Kolkata',
                state: 'West Bengal',
                pinCode: '700002',
                userType: 'recipient',
                urgencyLevel: 'Regular',
                unitsRequired: 1,
                hospitalName: 'AMRI Hospitals Kolkata',
                hospitalAddress: 'Salt Lake, Kolkata',
                doctorName: 'Dr. Amit Chatterjee',
                medicalCondition: 'Routine blood transfusion for chronic condition',
                emergencyContactNumber: '8765432107'
            },
            {
                fullName: 'Pooja Agarwal',
                email: 'pooja.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432108',
                dateOfBirth: new Date('1990-03-18'),
                gender: 'female',
                bloodGroup: 'O+',
                address: '456 Care Street, Jaipur',
                city: 'Jaipur',
                state: 'Rajasthan',
                pinCode: '302002',
                userType: 'recipient',
                urgencyLevel: 'Urgent',
                unitsRequired: 3,
                hospitalName: 'Fortis Escorts Hospital Jaipur',
                hospitalAddress: 'Jawahar Lal Nehru Marg, Jaipur',
                doctorName: 'Dr. Ravi Sharma',
                medicalCondition: 'Surgical blood loss compensation',
                emergencyContactNumber: '8765432108'
            },
            {
                fullName: 'Manish Shah',
                email: 'manish.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432109',
                dateOfBirth: new Date('1983-07-22'),
                gender: 'male',
                bloodGroup: 'AB-',
                address: '321 Health Lane, Ahmedabad',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pinCode: '380002',
                userType: 'recipient',
                urgencyLevel: 'Critical',
                unitsRequired: 4,
                hospitalName: 'Sterling Hospital Ahmedabad',
                hospitalAddress: 'Off Gurukul Road, Ahmedabad',
                doctorName: 'Dr. Nisha Patel',
                medicalCondition: 'Emergency trauma case',
                emergencyContactNumber: '8765432109'
            },
            {
                fullName: 'Sanjana Pillai',
                email: 'sanjana.recipient@email.com',
                password: await bcrypt.hash('password123', 10),
                phone: '8765432110',
                dateOfBirth: new Date('1995-05-10'),
                gender: 'female',
                bloodGroup: 'A+',
                address: '654 Medical Avenue, Kochi',
                city: 'Kochi',
                state: 'Kerala',
                pinCode: '682002',
                userType: 'recipient',
                urgencyLevel: 'Regular',
                unitsRequired: 2,
                hospitalName: 'Amrita Institute of Medical Sciences',
                hospitalAddress: 'Ponekkara, Kochi',
                doctorName: 'Dr. Thomas George',
                medicalCondition: 'Pre-surgical blood requirement',
                emergencyContactNumber: '8765432110'
            }
        ];

        // Insert donors
        const createdDonors = await User.insertMany(donorData);
        console.log('✅ Inserted 10 donors');

        // Insert recipients
        const createdRecipients = await User.insertMany(recipientData);
        console.log('✅ Inserted 10 recipients');

        // Create appointments for donors
        const appointmentData = [
            {
                donorId: createdDonors[0]._id,
                donorName: createdDonors[0].fullName,
                donorEmail: createdDonors[0].email,
                bloodGroup: createdDonors[0].bloodGroup,
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                time: '09:00 AM',
                location: 'City Blood Bank, Main Center',
                requirements: 'Fasting required. Drink plenty of water.',
                status: 'scheduled'
            },
            {
                donorId: createdDonors[1]._id,
                donorName: createdDonors[1].fullName,
                donorEmail: createdDonors[1].email,
                bloodGroup: createdDonors[1].bloodGroup,
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                time: '10:30 AM',
                location: 'North Blood Donation Center',
                requirements: 'Bring ID proof. Eat light breakfast.',
                status: 'confirmed'
            },
            {
                donorId: createdDonors[2]._id,
                donorName: createdDonors[2].fullName,
                donorEmail: createdDonors[2].email,
                bloodGroup: createdDonors[2].bloodGroup,
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                time: '02:00 PM',
                location: 'South Blood Bank',
                requirements: 'No strenuous activities before donation.',
                status: 'scheduled'
            },
            {
                donorId: createdDonors[3]._id,
                donorName: createdDonors[3].fullName,
                donorEmail: createdDonors[3].email,
                bloodGroup: createdDonors[3].bloodGroup,
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                time: '11:00 AM',
                location: 'Central Hospital Blood Bank',
                requirements: '',
                status: 'scheduled'
            },
            {
                donorId: createdDonors[5]._id,
                donorName: createdDonors[5].fullName,
                donorEmail: createdDonors[5].email,
                bloodGroup: createdDonors[5].bloodGroup,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                time: '09:30 AM',
                location: 'Regional Blood Bank',
                requirements: '',
                status: 'completed'
            }
        ];

        await Appointment.insertMany(appointmentData);
        console.log('✅ Inserted 5 appointments');

        // Create blood requests
        const bloodRequestData = [
            {
                requestId: 'REQ001',
                recipientId: createdRecipients[0]._id,
                recipientName: createdRecipients[0].fullName,
                recipientEmail: createdRecipients[0].email,
                bloodType: 'O+',
                units: 2,
                hospitalName: 'Apollo Hospital Delhi',
                requiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                urgencyLevel: 'Urgent',
                medicalReason: 'Post-surgical blood transfusion required',
                doctorName: 'Dr. Rajesh Gupta',
                contactNumber: '8765432101',
                status: 'pending',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted and waiting for admin approval',
                    timestamp: new Date()
                }]
            },
            {
                requestId: 'REQ002',
                recipientId: createdRecipients[1]._id,
                recipientName: createdRecipients[1].fullName,
                recipientEmail: createdRecipients[1].email,
                bloodType: 'B+',
                units: 4,
                hospitalName: 'Lilavati Hospital Mumbai',
                requiredDate: new Date(),
                urgencyLevel: 'Critical',
                medicalReason: 'Severe anemia requiring immediate transfusion',
                doctorName: 'Dr. Priya Iyer',
                contactNumber: '8765432102',
                status: 'approved',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                }, {
                    status: 'approved',
                    message: 'Request approved by admin',
                    timestamp: new Date()
                }]
            },
            {
                requestId: 'REQ003',
                recipientId: createdRecipients[2]._id,
                recipientName: createdRecipients[2].fullName,
                recipientEmail: createdRecipients[2].email,
                bloodType: 'A+',
                units: 3,
                hospitalName: 'Fortis Hospital Bangalore',
                requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                urgencyLevel: 'Regular',
                medicalReason: 'Scheduled operation - blood transfusion planned',
                doctorName: 'Dr. Arjun Singh',
                contactNumber: '8765432103',
                status: 'fulfilled',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                }, {
                    status: 'approved',
                    message: 'Request approved by admin',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                }, {
                    status: 'fulfilled',
                    message: 'Blood delivered to recipient',
                    timestamp: new Date()
                }]
            },
            {
                requestId: 'REQ004',
                recipientId: createdRecipients[3]._id,
                recipientName: createdRecipients[3].fullName,
                recipientEmail: createdRecipients[3].email,
                bloodType: 'AB+',
                units: 2,
                hospitalName: 'Max Hospital Hyderabad',
                requiredDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                urgencyLevel: 'Urgent',
                medicalReason: 'Treatment for dengue fever complications',
                doctorName: 'Dr. Meera Nair',
                contactNumber: '8765432104',
                status: 'pending',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted and waiting for approval',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                }]
            },
            {
                requestId: 'REQ005',
                recipientId: createdRecipients[4]._id,
                recipientName: createdRecipients[4].fullName,
                recipientEmail: createdRecipients[4].email,
                bloodType: 'O-',
                units: 5,
                hospitalName: 'Ruby Hall Clinic Pune',
                requiredDate: new Date(),
                urgencyLevel: 'Critical',
                medicalReason: 'Accident victim requiring immediate blood transfusion',
                doctorName: 'Dr. Vivek Joshi',
                contactNumber: '8765432105',
                status: 'approved',
                timeline: [{
                    status: 'pending',
                    message: 'Emergency request submitted',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }, {
                    status: 'approved',
                    message: 'Request approved by admin - PRIORITY ALERT',
                    timestamp: new Date()
                }]
            },
            {
                requestId: 'REQ006',
                recipientId: createdRecipients[5]._id,
                recipientName: createdRecipients[5].fullName,
                recipientEmail: createdRecipients[5].email,
                bloodType: 'A-',
                units: 2,
                hospitalName: 'Apollo Hospitals Chennai',
                requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                urgencyLevel: 'Urgent',
                medicalReason: 'Pregnancy complications requiring blood',
                doctorName: 'Dr. Sunita Rao',
                contactNumber: '8765432106',
                status: 'pending',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted and waiting for approval',
                    timestamp: new Date()
                }]
            },
            {
                requestId: 'REQ007',
                recipientId: createdRecipients[6]._id,
                recipientName: createdRecipients[6].fullName,
                recipientEmail: createdRecipients[6].email,
                bloodType: 'B-',
                units: 1,
                hospitalName: 'AMRI Hospitals Kolkata',
                requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                urgencyLevel: 'Regular',
                medicalReason: 'Routine blood transfusion for chronic condition',
                doctorName: 'Dr. Amit Chatterjee',
                contactNumber: '8765432107',
                status: 'fulfilled',
                timeline: [{
                    status: 'pending',
                    message: 'Request submitted',
                    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
                }, {
                    status: 'approved',
                    message: 'Request approved',
                    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
                }, {
                    status: 'fulfilled',
                    message: 'Blood delivered successfully',
                    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                }]
            }
        ];

        await BloodRequest.insertMany(bloodRequestData);
        console.log('✅ Inserted 7 blood requests');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log('   - 10 Donors added');
        console.log('   - 10 Recipients added');
        console.log('   - 5 Appointments added');
        console.log('   - 7 Blood Requests added');
        console.log('\n🔐 Test Credentials:');
        console.log('\n   DONORS:');
        console.log('   1. rajesh.donor@email.com / password123 (O+)');
        console.log('   2. priya.donor@email.com / password123 (B+)');
        console.log('   3. amit.donor@email.com / password123 (A+)');
        console.log('   4. neha.donor@email.com / password123 (AB+)');
        console.log('   5. vikram.donor@email.com / password123 (O-)');
        console.log('   6. kavita.donor@email.com / password123 (A-)');
        console.log('   7. rohit.donor@email.com / password123 (B-)');
        console.log('   8. sneha.donor@email.com / password123 (O+)');
        console.log('   9. arjun.donor@email.com / password123 (AB-)');
        console.log('   10. meera.donor@email.com / password123 (A+)');
        console.log('\n   RECIPIENTS:');
        console.log('   1. anjali.recipient@email.com / password123 (O+)');
        console.log('   2. suresh.recipient@email.com / password123 (B+)');
        console.log('   3. ramesh.recipient@email.com / password123 (A+)');
        console.log('   4. divya.recipient@email.com / password123 (AB+)');
        console.log('   5. karan.recipient@email.com / password123 (O-)');
        console.log('   6. lakshmi.recipient@email.com / password123 (A-)');
        console.log('   7. prakash.recipient@email.com / password123 (B-)');
        console.log('   8. pooja.recipient@email.com / password123 (O+)');
        console.log('   9. manish.recipient@email.com / password123 (AB-)');
        console.log('   10. sanjana.recipient@email.com / password123 (A+)');
        console.log('\n   ADMIN:');
        console.log('   Admin ID: admin / Password: admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeder
seedDatabase();