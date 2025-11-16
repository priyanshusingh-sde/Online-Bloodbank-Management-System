// Donor Dashboard JavaScript - COMPLETE FIXED VERSION
// Global variables
let userProfile = null;
let appointmentsData = [];

// Load user profile and data on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile();
    await loadAppointments();
    await loadDonationHistory();
    updateDashboardStats();
    
    // Set minimum date to today for appointment scheduling
    const today = new Date().toISOString().split('T')[0];
    const donationDateInput = document.getElementById('donationDate');
    if (donationDateInput) {
        donationDateInput.setAttribute('min', today);
    }
});

// Load User Profile
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.success) {
            userProfile = data.user;
            updateUserInfo();
            displayProfileSection();
        } else {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Session expired. Please login again.');
        window.location.href = '/index.html';
    }
}

// Update user info in header
function updateUserInfo() {
    if (userProfile) {
        const userNameElements = document.querySelectorAll('.user-info div div:first-child');
        userNameElements.forEach(el => {
            el.textContent = userProfile.fullName;
        });
        
        const bloodTypeElements = document.querySelectorAll('.user-info div div:last-child');
        bloodTypeElements.forEach(el => {
            el.textContent = `Blood Type: ${userProfile.bloodGroup}`;
        });
        
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(avatar => {
            avatar.textContent = userProfile.fullName.charAt(0).toUpperCase();
        });
        
        const welcomeMsg = document.querySelector('.dashboard-header h1');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome Back, ${userProfile.fullName.split(' ')[0]}! 🩸`;
        }
        
        document.querySelector('.stat-card.donations h3').textContent = userProfile.totalDonations || 0;
        document.querySelector('.stat-card.points h3').textContent = userProfile.rewardPoints || 0;
    }
}

// Display Profile Section
function displayProfileSection() {
    const profileSection = document.getElementById('profileSection');
    if (!profileSection || !userProfile) return;

    const profileHTML = `
        <div class="dashboard-header">
            <h1>My Profile</h1>
            <p>View and manage your personal information</p>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Personal Information</h2>
                <button class="btn btn-primary" onclick="enableEditProfile()">Edit Profile</button>
            </div>
            <form id="profileForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="profileFullName" value="${userProfile.fullName}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${userProfile.email}" disabled>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="profilePhone" value="${userProfile.phone}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" id="profileDOB" value="${new Date(userProfile.dateOfBirth).toISOString().split('T')[0]}" disabled>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Gender</label>
                        <input type="text" id="profileGender" value="${userProfile.gender}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Blood Group</label>
                        <input type="text" id="profileBloodGroup" value="${userProfile.bloodGroup}" disabled>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="profileAddress" value="${userProfile.address}" disabled>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="profileCity" value="${userProfile.city}" disabled>
                    </div>
                    <div class="form-group">
                        <label>State</label>
                        <input type="text" id="profileState" value="${userProfile.state}" disabled>
                    </div>
                    <div class="form-group">
                        <label>PIN Code</label>
                        <input type="text" id="profilePinCode" value="${userProfile.pinCode}" disabled>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="profileWeight" value="${userProfile.weight || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Last Donation</label>
                        <input type="text" id="profileLastDonation" value="${userProfile.lastDonation || 'Never'}" disabled>
                    </div>
                </div>
                
                <div id="profileButtons" style="display: none; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="cancelEditProfile()">Cancel</button>
                </div>
            </form>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>Donation Statistics</h2>
            </div>
            <div class="stats-grid">
                <div class="stat-card donations">
                    <div class="stat-info">
                        <h3>${userProfile.totalDonations || 0}</h3>
                        <p>Total Donations</p>
                    </div>
                </div>
                <div class="stat-card points">
                    <div class="stat-info">
                        <h3>${userProfile.rewardPoints || 0}</h3>
                        <p>Reward Points</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    profileSection.innerHTML = profileHTML;
}

// Enable Edit Profile
function enableEditProfile() {
    const inputs = document.querySelectorAll('#profileForm input:not(#profileEmail):not(#profileBloodGroup)');
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    document.getElementById('profileButtons').style.display = 'flex';
    document.querySelector('#profileSection .card-header button').style.display = 'none';
}

// Cancel Edit Profile
function cancelEditProfile() {
    displayProfileSection();
}

// Save Profile
async function saveProfile() {
    const updatedData = {
        fullName: document.getElementById('profileFullName').value,
        phone: document.getElementById('profilePhone').value,
        dateOfBirth: document.getElementById('profileDOB').value,
        address: document.getElementById('profileAddress').value,
        city: document.getElementById('profileCity').value,
        state: document.getElementById('profileState').value,
        pinCode: document.getElementById('profilePinCode').value,
        weight: parseInt(document.getElementById('profileWeight').value)
    };

    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal('Profile updated successfully!');
            userProfile = data.user;
            displayProfileSection();
            updateUserInfo();
        } else {
            alert(data.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred. Please try again.');
    }
}

// Load Appointments
async function loadAppointments() {
    try {
        const response = await fetch('/api/appointments');
        const data = await response.json();
        
        if (data.success) {
            appointmentsData = data.appointments;
            updateAppointmentTables();
            updateScheduledCount();
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Load Donation History
async function loadDonationHistory() {
    const historyTable = document.querySelector('#historySection table tbody');
    if (!historyTable) return;

    const completedDonations = appointmentsData.filter(apt => apt.status === 'completed');
    
    historyTable.innerHTML = '';
    
    if (completedDonations.length === 0) {
        historyTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No donation history yet</td></tr>';
        return;
    }

    completedDonations.forEach(donation => {
        const date = new Date(donation.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${date}</td>
                <td>${donation.location}</td>
                <td>${donation.bloodGroup}</td>
                <td>450</td>
                <td><span class="status-badge completed">Completed</span></td>
                <td>100</td>
            </tr>
        `;
        historyTable.innerHTML += row;
    });
}

// Update appointment tables
function updateAppointmentTables() {
    const upcomingTable = document.getElementById('upcomingTable')?.getElementsByTagName('tbody')[0];
    const allTable = document.getElementById('allAppointmentsTable')?.getElementsByTagName('tbody')[0];
    
    if (upcomingTable) {
        upcomingTable.innerHTML = '';
    }
    if (allTable) {
        allTable.innerHTML = '';
    }

    const upcomingAppointments = appointmentsData.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
    );

    if (upcomingAppointments.length === 0 && upcomingTable) {
        upcomingTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No upcoming appointments</td></tr>';
    }

    appointmentsData.forEach(apt => {
        const date = new Date(apt.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const statusClass = apt.status.toLowerCase();
        const statusText = apt.status.charAt(0).toUpperCase() + apt.status.slice(1);

        let actionButton = '-';
        if (apt.status === 'scheduled') {
            actionButton = `<button class="btn btn-danger btn-sm" onclick="cancelAppointment('${apt._id}')">Cancel</button>`;
        } else if (apt.status === 'confirmed') {
            actionButton = `<span style="color: #66bb6a; font-weight: bold;">✓ Confirmed</span>`;
        } else if (apt.status === 'completed') {
            actionButton = `<span style="color: #1976d2; font-weight: bold;">✓ Completed</span>`;
        } else if (apt.status === 'cancelled') {
            actionButton = `<span style="color: #f5576c; font-weight: bold;">✗ Cancelled</span>`;
        }

        const row = `
            <tr>
                <td>${date}</td>
                <td>${apt.time}</td>
                <td>${apt.location}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${actionButton}</td>
            </tr>
        `;
        
        if (upcomingTable && (apt.status === 'scheduled' || apt.status === 'confirmed')) {
            upcomingTable.innerHTML += row;
        }
        if (allTable) {
            allTable.innerHTML += row;
        }
    });
}

// Update scheduled count in stats
function updateScheduledCount() {
    const scheduledCount = appointmentsData.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;
    
    const scheduledStat = document.querySelector('.stat-card.scheduled h3');
    if (scheduledStat) {
        scheduledStat.textContent = scheduledCount;
    }
}

// Update dashboard stats
function updateDashboardStats() {
    if (userProfile) {
        const nextDonationMsg = document.querySelector('.dashboard-header p');
        if (nextDonationMsg && userProfile.lastDonation) {
            nextDonationMsg.textContent = 'Thank you for being a life saver!';
        }
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('shifted');
}

// Show Section
function showSection(section) {
    const sections = ['dashboard', 'schedule', 'history', 'appointments', 'profile', 'rewards'];
    sections.forEach(s => {
        const el = document.getElementById(s + 'Section');
        if (el) el.style.display = 'none';
    });
    
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    if (section === 'profile') {
        displayProfileSection();
    }

    if (section === 'history') {
        loadDonationHistory();
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        sidebar.classList.remove('open');
        mainContent.classList.remove('shifted');
    }
}

// Schedule Appointment
async function scheduleAppointment(event) {
    event.preventDefault();
    
    const date = document.getElementById('donationDate').value;
    const time = document.getElementById('donationTime').value;
    const location = document.getElementById('location').value;
    const requirements = document.getElementById('requirements').value;

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                time,
                location,
                requirements
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            document.getElementById('scheduleForm').reset();
            await loadAppointments();
            
            setTimeout(() => {
                showSection('dashboard');
            }, 2000);
        } else {
            alert(data.message || 'Error scheduling appointment');
        }
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        alert('An error occurred. Please try again.');
    }
}

// Cancel Appointment
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`/api/appointments/${id}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            await loadAppointments();
        } else {
            alert(data.message || 'Error cancelling appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('An error occurred. Please try again.');
    }
}

// Show Success Modal
function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Logout
async function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/index.html';
    }
}