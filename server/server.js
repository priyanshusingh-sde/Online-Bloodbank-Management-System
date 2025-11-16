require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));

// Serve static files
const staticDir = path.join(__dirname, '..', 'client');
console.log('Serving static files from:', staticDir);
app.use(express.static(staticDir));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'cherryclouds_secret_key_2025',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false
    }
}));

// Models
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

const bloodInventorySchema = new mongoose.Schema({
    bloodType: { type: String, required: true, unique: true },
    units: { type: Number, required: true, default: 0 },
    status: { 
        type: String, 
        enum: ['Good', 'Low', 'Critical'], 
        default: 'Good' 
    },
    lastUpdated: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
    adminId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
const Admin = mongoose.model('Admin', adminSchema);

// Initialize Admin Account
async function initializeAdmin() {
    try {
        const adminId = process.env.ADMIN_ID || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        const adminExists = await Admin.findOne({ adminId });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await Admin.create({
                adminId,
                password: hashedPassword,
                name: 'Admin User'
            });
            console.log(`✅ Admin account created: adminId=${adminId}, password=${adminPassword}`);
        }
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
    }
}

// Initialize Blood Inventory
async function initializeInventory() {
    try {
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        for (let type of bloodTypes) {
            const exists = await BloodInventory.findOne({ bloodType: type });
            if (!exists) {
                const units = Math.floor(Math.random() * 50) + 10;
                let status = 'Good';
                if (units < 10) status = 'Critical';
                else if (units < 20) status = 'Low';
                
                await BloodInventory.create({
                    bloodType: type,
                    units: units,
                    status: status
                });
            }
        }
        console.log('✅ Blood inventory initialized');
    } catch (error) {
        console.error('❌ Error initializing inventory:', error);
    }
}

mongoose.connection.once('open', () => {
    initializeAdmin();
    initializeInventory();
});

// Helper function to update blood inventory
async function updateBloodInventory(bloodType, units, action) {
    try {
        console.log(`📦 updateBloodInventory called:`, { bloodType, units, action });
        
        const inventory = await BloodInventory.findOne({ bloodType });
        
        if (!inventory) {
            const error = `Blood type ${bloodType} not found in inventory`;
            console.error('❌', error);
            throw new Error(error);
        }

        console.log(`📊 Current inventory state:`, { 
            bloodType: inventory.bloodType, 
            currentUnits: inventory.units, 
            status: inventory.status 
        });

        let newUnits = inventory.units;
        
        if (action === 'add') {
            newUnits = inventory.units + units;
            console.log(`➕ Adding ${units} units. ${inventory.units} + ${units} = ${newUnits}`);
        } else if (action === 'deduct') {
            newUnits = inventory.units - units;
            if (newUnits < 0) {
                const error = 'Cannot deduct more units than available';
                console.error('❌', error);
                throw new Error(error);
            }
            console.log(`➖ Deducting ${units} units. ${inventory.units} - ${units} = ${newUnits}`);
        } else {
            const error = 'Invalid action. Use "add" or "deduct"';
            console.error('❌', error);
            throw new Error(error);
        }

        // Update status based on new units count
        let status = 'Good';
        if (newUnits < 10) {
            status = 'Critical';
        } else if (newUnits < 20) {
            status = 'Low';
        }

        console.log(`📊 New status will be: ${status}`);

        // Update the inventory in database
        const updatedInventory = await BloodInventory.findOneAndUpdate(
            { bloodType },
            { 
                units: newUnits, 
                status, 
                lastUpdated: Date.now() 
            },
            { new: true }
        );

        console.log(`✅ Database updated successfully:`, {
            bloodType: updatedInventory.bloodType,
            units: updatedInventory.units,
            status: updatedInventory.status,
            lastUpdated: updatedInventory.lastUpdated
        });

        return updatedInventory;
        
    } catch (error) {
        console.error('❌ Error in updateBloodInventory:', error);
        throw error;
    }
}

// Authentication Middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please login first' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.adminId) {
        return res.status(401).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// ==================== USER ROUTES ====================

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { 
            fullName, email, password, phone, dateOfBirth, gender, bloodGroup, 
            address, city, state, pinCode, userType, weight, lastDonation, 
            noDiseases, noMedication, emergencyContact, urgencyLevel, unitsRequired,
            hospitalName, hospitalAddress, doctorName, medicalCondition, 
            emergencyContactNumber 
        } = req.body;

        if (!fullName || !email || !password || !phone || !dateOfBirth || !gender || 
            !bloodGroup || !address || !city || !state || !pinCode || !userType) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be filled' 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered. Please login instead.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            fullName,
            email,
            password: hashedPassword,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            address,
            city,
            state,
            pinCode,
            userType
        };

        if (userType === 'donor') {
            userData.weight = weight;
            userData.lastDonation = lastDonation;
            userData.noDiseases = noDiseases || false;
            userData.noMedication = noMedication || false;
            userData.emergencyContact = emergencyContact || false;
            userData.totalDonations = 0;
            userData.rewardPoints = 0;
        } else if (userType === 'recipient') {
            userData.urgencyLevel = urgencyLevel;
            userData.unitsRequired = unitsRequired;
            userData.hospitalName = hospitalName;
            userData.hospitalAddress = hospitalAddress;
            userData.doctorName = doctorName;
            userData.medicalCondition = medicalCondition;
            userData.emergencyContactNumber = emergencyContactNumber;
        }

        const user = await User.create(userData);

        res.json({ 
            success: true, 
            message: 'Registration successful! You can now login with your credentials.',
            userId: user._id 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed: ' + error.message 
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        const user = await User.findOne({ email, userType });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Your account has been deactivated. Please contact admin.' 
            });
        }

        req.session.userId = user._id;
        req.session.userType = user.userType;
        req.session.userName = user.fullName;
        req.session.bloodGroup = user.bloodGroup;

        res.json({ 
            success: true, 
            message: 'Login successful!',
            userType: user.userType,
            redirect: user.userType === 'donor' ? '/donor_dashboard.html' : '/recipient_dashboard.html'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { adminId, password } = req.body;

        const admin = await Admin.findOne({ adminId });
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        req.session.adminId = admin._id;
        req.session.isAdmin = true;

        res.json({ 
            success: true, 
            message: 'Admin login successful',
            redirect: '/admin_dashboard.html'
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Get User Profile
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// Update User Profile
app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password;
        delete updates.email;
        delete updates.bloodGroup;
        delete updates.userType;
        
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (updates.fullName) {
            req.session.userName = updates.fullName;
        }

        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// ==================== APPOINTMENT ROUTES ====================

// Create Appointment
app.post('/api/appointments', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.userType !== 'donor') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only donors can schedule appointments' 
            });
        }

        const { date, time, location, requirements } = req.body;

        const appointment = await Appointment.create({
            donorId: user._id,
            donorName: user.fullName,
            donorEmail: user.email,
            bloodGroup: user.bloodGroup,
            date,
            time,
            location,
            requirements,
            status: 'scheduled'
        });

        res.json({ 
            success: true, 
            message: 'Appointment scheduled successfully! Waiting for admin confirmation.',
            appointment 
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ success: false, message: 'Error creating appointment' });
    }
});

// Get Donor Appointments
app.get('/api/appointments', requireAuth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ donorId: req.session.userId })
            .sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Error fetching appointments' });
    }
});

// Cancel Appointment
app.put('/api/appointments/:id/cancel', requireAuth, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, donorId: req.session.userId, status: { $in: ['scheduled', 'confirmed'] } },
            { status: 'cancelled', updatedAt: Date.now() },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Appointment not found or cannot be cancelled' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Appointment cancelled successfully', 
            appointment 
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ success: false, message: 'Error cancelling appointment' });
    }
});

// ==================== BLOOD REQUEST ROUTES ====================

// Create Blood Request
app.post('/api/blood-requests', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.userType !== 'recipient') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only recipients can create blood requests' 
            });
        }

        const { bloodType, units, hospitalName, requiredDate, urgencyLevel, 
                medicalReason, doctorName, contactNumber } = req.body;

        const count = await BloodRequest.countDocuments();
        const requestId = `REQ${String(count + 1).padStart(3, '0')}`;

        const bloodRequest = await BloodRequest.create({
            requestId,
            recipientId: user._id,
            recipientName: user.fullName,
            recipientEmail: user.email,
            bloodType,
            units,
            hospitalName,
            requiredDate,
            urgencyLevel,
            medicalReason,
            doctorName,
            contactNumber,
            status: 'pending',
            timeline: [{
                status: 'pending',
                message: 'Request submitted and waiting for admin approval',
                timestamp: Date.now()
            }]
        });

        res.json({ 
            success: true, 
            message: 'Blood request submitted successfully! Admin will review your request soon.',
            request: bloodRequest 
        });
    } catch (error) {
        console.error('Error creating blood request:', error);
        res.status(500).json({ success: false, message: 'Error creating blood request' });
    }
});

// Get Recipient Requests
app.get('/api/blood-requests', requireAuth, async (req, res) => {
    try {
        const requests = await BloodRequest.find({ recipientId: req.session.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching requests' });
    }
});

// Cancel Blood Request
app.put('/api/blood-requests/:id/cancel', requireAuth, async (req, res) => {
    try {
        const request = await BloodRequest.findOneAndUpdate(
            { 
                _id: req.params.id, 
                recipientId: req.session.userId, 
                status: 'pending' 
            },
            { 
                status: 'cancelled', 
                updatedAt: Date.now(),
                $push: {
                    timeline: {
                        status: 'cancelled',
                        message: 'Request cancelled by user',
                        timestamp: Date.now()
                    }
                }
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found or cannot be cancelled' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Request cancelled successfully', 
            request 
        });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ success: false, message: 'Error cancelling request' });
    }
});

// Get Blood Inventory (Public)
app.get('/api/blood-inventory', async (req, res) => {
    try {
        const inventory = await BloodInventory.find().sort({ bloodType: 1 });
        res.json({ success: true, inventory });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false, message: 'Error fetching inventory' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get Dashboard Stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const totalDonors = await User.countDocuments({ userType: 'donor', isActive: true });
        const totalRecipients = await User.countDocuments({ userType: 'recipient', isActive: true });
        const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
        const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' });
        
        const inventory = await BloodInventory.find();
        const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);

        res.json({
            success: true,
            stats: {
                totalDonors,
                totalRecipients,
                pendingRequests,
                pendingAppointments,
                totalUnits
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

// Get All Appointments (Admin)
app.get('/api/admin/appointments', requireAdmin, async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Error fetching appointments' });
    }
});

// Approve Appointment (Admin)
app.put('/api/admin/appointments/:id/approve', requireAdmin, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed', updatedAt: Date.now() },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ 
            success: true, 
            message: 'Appointment confirmed successfully', 
            appointment 
        });
    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).json({ success: false, message: 'Error approving appointment' });
    }
});

// Reject Appointment (Admin)
app.put('/api/admin/appointments/:id/reject', requireAdmin, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', updatedAt: Date.now() },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ 
            success: true, 
            message: 'Appointment rejected successfully', 
            appointment 
        });
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        res.status(500).json({ success: false, message: 'Error rejecting appointment' });
    }
});

// Complete Appointment (Admin)
app.put('/api/admin/appointments/:id/complete', requireAdmin, async (req, res) => {
    try {
        console.log('🔵 Complete appointment request received:', req.params.id);
        
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            console.error('❌ Appointment not found:', req.params.id);
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        console.log('📋 Current appointment status:', appointment.status);

        if (appointment.status !== 'confirmed') {
            return res.status(400).json({ 
                success: false, 
                message: `Only confirmed appointments can be completed. Current status: ${appointment.status}` 
            });
        }

        const inventoryBefore = await BloodInventory.findOne({ bloodType: appointment.bloodGroup });
        const oldUnits = inventoryBefore ? inventoryBefore.units : 0;
        console.log(`📊 BEFORE: ${appointment.bloodGroup} = ${oldUnits} units`);

        appointment.status = 'completed';
        appointment.updatedAt = Date.now();
        await appointment.save();
        console.log('✅ Appointment marked as completed');

        await User.findByIdAndUpdate(appointment.donorId, {
            $inc: { totalDonations: 1, rewardPoints: 100 }
        });
        console.log('✅ Donor stats updated');

        const updatedInventory = await updateBloodInventory(appointment.bloodGroup, 1, 'add');
        console.log(`📊 AFTER: ${appointment.bloodGroup} = ${updatedInventory.units} units`);

        res.json({ 
            success: true, 
            message: `✅ Donation completed! Added 1 unit of ${appointment.bloodGroup}.`,
            appointment: appointment.toObject(),
            inventoryUpdate: {
                bloodType: appointment.bloodGroup,
                oldUnits: oldUnits,
                newUnits: updatedInventory.units,
                unitsAdded: 1,
                status: updatedInventory.status
            }
        });
    } catch (error) {
        console.error('❌ Error completing appointment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error completing appointment: ' + error.message 
        });
    }
});

// Get All Blood Requests (Admin)
app.get('/api/admin/blood-requests', requireAdmin, async (req, res) => {
    try {
        const requests = await BloodRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Error fetching requests' });
    }
});

// Approve/Reject Blood Request (Admin)
app.put('/api/admin/blood-requests/:id/:action', requireAdmin, async (req, res) => {
    try {
        const { id, action } = req.params;
        const status = action === 'approve' ? 'approved' : 'rejected';

        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // If approving, check inventory availability
        if (action === 'approve') {
            const inventory = await BloodInventory.findOne({ bloodType: request.bloodType });
            
            if (!inventory) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Blood type ${request.bloodType} not found in inventory` 
                });
            }
            
            if (inventory.units < request.units) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient blood units in inventory. Available: ${inventory.units}, Required: ${request.units}` 
                });
            }
            
            console.log(`✅ Inventory check passed: ${inventory.units} units available`);
        }

        const updatedRequest = await BloodRequest.findByIdAndUpdate(
            id,
            { 
                status, 
                updatedAt: Date.now(),
                $push: {
                    timeline: {
                        status,
                        message: action === 'approve' 
                            ? 'Request approved by admin. Blood will be deducted when marked as fulfilled.' 
                            : 'Request rejected by admin',
                        timestamp: Date.now()
                    }
                }
            },
            { new: true }
        );

        res.json({ 
            success: true, 
            message: `Request ${action}d successfully`, 
            request: updatedRequest 
        });
    } catch (error) {
        console.error(`Error ${req.params.action}ing request:`, error);
        res.status(500).json({ 
            success: false, 
            message: `Error ${req.params.action}ing request: ` + error.message 
        });
    }
});

// Mark Request as Fulfilled (Admin) - CRITICAL FIX
app.put('/api/admin/blood-requests/:id/fulfill', requireAdmin, async (req, res) => {
    try {
        console.log('🔵 Fulfill request received:', req.params.id);
        
        const request = await BloodRequest.findById(req.params.id);
        
        if (!request) {
            console.error('❌ Request not found:', req.params.id);
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        console.log('📋 Request details:', {
            id: request.requestId,
            bloodType: request.bloodType,
            units: request.units,
            status: request.status
        });

        // CRITICAL: Check if request is approved
        if (request.status !== 'approved') {
            console.error('❌ Invalid status for fulfillment:', request.status);
            return res.status(400).json({ 
                success: false, 
                message: `Only approved requests can be fulfilled. Current status: ${request.status}` 
            });
        }

        // Get inventory BEFORE update
        const inventoryBefore = await BloodInventory.findOne({ bloodType: request.bloodType });
        
        if (!inventoryBefore) {
            return res.status(400).json({
                success: false,
                message: `Blood type ${request.bloodType} not found in inventory`
            });
        }
        
        const oldUnits = inventoryBefore.units;
        console.log(`📊 BEFORE: ${request.bloodType} = ${oldUnits} units`);

        // Check if enough units available
        if (oldUnits < request.units) {
            return res.status(400).json({
                success: false,
                message: `Insufficient blood units. Available: ${oldUnits}, Required: ${request.units}`
            });
        }

        // CRITICAL: Update request status to fulfilled (NOT cancelled)
        request.status = 'fulfilled';
        request.updatedAt = Date.now();
        request.timeline.push({
            status: 'fulfilled',
            message: `Blood delivered to recipient. ${request.units} units of ${request.bloodType} deducted from inventory.`,
            timestamp: Date.now()
        });
        await request.save();
        console.log('✅ Request status updated to: fulfilled');

        // CRITICAL: DEDUCT units from inventory
        const updatedInventory = await updateBloodInventory(request.bloodType, request.units, 'deduct');
        console.log(`📊 AFTER: ${request.bloodType} = ${updatedInventory.units} units (Status: ${updatedInventory.status})`);

        res.json({ 
            success: true, 
            message: `✅ Request fulfilled successfully! Deducted ${request.units} units of ${request.bloodType} from inventory.`,
            request: request.toObject(),
            inventoryUpdate: {
                bloodType: request.bloodType,
                oldUnits: oldUnits,
                newUnits: updatedInventory.units,
                unitsDeducted: request.units,
                status: updatedInventory.status,
                lastUpdated: updatedInventory.lastUpdated
            }
        });
    } catch (error) {
        console.error('❌ Error fulfilling request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fulfilling request: ' + error.message 
        });
    }
});

// Update Blood Inventory (Admin)
app.put('/api/admin/inventory/:bloodType', requireAdmin, async (req, res) => {
    try {
        const { units, action } = req.body;
        
        if (!units || !action || (action !== 'add' && action !== 'deduct')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid request. Provide units and action (add/deduct)' 
            });
        }

        const result = await updateBloodInventory(req.params.bloodType, units, action);
        
        res.json({ 
            success: true, 
            message: 'Inventory updated successfully', 
            inventory: result 
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error updating inventory' 
        });
    }
});

// Get All Users (Admin)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// Toggle User Status (Admin)
app.put('/api/admin/users/:id/toggle-status', requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        const message = user.isActive ? 'User activated successfully' : 'User deactivated successfully';
        res.json({ success: true, message, user: user.toObject({ getters: true, versionKey: false }) });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ success: false, message: 'Error updating user status' });
    }
});

// HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.get('/donor_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'donor_dashboard.html'));
});

app.get('/recipient_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'recipient_dashboard.html'));
});

app.get('/admin_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'admin_dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🩸 CherryClouds Blood Bank Management System       ║
║                                                       ║
║   ✅ Server running on http://localhost:${PORT}       ║
║                                                       ║
║   📋 Default Admin Credentials:                      ║
║   Admin ID: admin                                     ║
║   Password: admin123                                  ║
║                                                       ║
║   🚀 Open http://localhost:${PORT} in your browser   ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});