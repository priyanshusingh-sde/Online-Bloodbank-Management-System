// Recipient Dashboard JavaScript - COMPLETE FIXED VERSION
// Global variables
let userProfile = null;
let requestsData = [];
let bloodInventory = [];

// Load user profile and data on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile();
    await loadBloodRequests();
    await loadBloodInventory();
    updateDashboardStats();
    
    const today = new Date().toISOString().split('T')[0];
    const requiredDateInput = document.getElementById('requiredDate');
    if (requiredDateInput) {
        requiredDateInput.setAttribute('min', today);
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
        
        const patientIdElements = document.querySelectorAll('.user-info div div:last-child');
        patientIdElements.forEach(el => {
            el.textContent = `Patient ID: ${userProfile._id.substr(-6).toUpperCase()}`;
        });
        
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(avatar => {
            avatar.textContent = userProfile.fullName.charAt(0).toUpperCase();
        });
        
        const welcomeMsg = document.querySelector('.dashboard-header h1');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome Back, ${userProfile.fullName.split(' ')[0]}! 🩸`;
        }
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
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="profileFullName" value="${userProfile.fullName}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${userProfile.email}" disabled>
                    </div>
                </div>
                
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="profilePhone" value="${userProfile.phone}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" id="profileDOB" value="${new Date(userProfile.dateOfBirth).toISOString().split('T')[0]}" disabled>
                    </div>
                </div>
                
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
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
                
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
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
                
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Hospital Name</label>
                        <input type="text" id="profileHospitalName" value="${userProfile.hospitalName || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact</label>
                        <input type="text" id="profileEmergencyContact" value="${userProfile.emergencyContactNumber || ''}" disabled>
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
                <h2>Request Statistics</h2>
            </div>
            <div class="stats-grid">
                <div class="stat-card requests">
                    <div class="stat-info">
                        <h3>${requestsData.length}</h3>
                        <p>Total Requests</p>
                    </div>
                </div>
                <div class="stat-card fulfilled">
                    <div class="stat-info">
                        <h3>${requestsData.filter(r => r.status === 'fulfilled').length}</h3>
                        <p>Fulfilled Requests</p>
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
        hospitalName: document.getElementById('profileHospitalName').value,
        emergencyContactNumber: document.getElementById('profileEmergencyContact').value
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

// Load Blood Requests
async function loadBloodRequests() {
    try {
        const response = await fetch('/api/blood-requests');
        const data = await response.json();
        
        if (data.success) {
            requestsData = data.requests;
            updateRequestTables();
            updateActiveRequestStatus();
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Load Blood Inventory
async function loadBloodInventory() {
    try {
        const response = await fetch('/api/blood-inventory');
        const data = await response.json();
        
        if (data.success) {
            bloodInventory = data.inventory;
            displayBloodInventory();
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

// Update dashboard stats
function updateDashboardStats() {
    const totalRequests = requestsData.length;
    const pendingRequests = requestsData.filter(r => r.status === 'pending').length;
    const fulfilledRequests = requestsData.filter(r => r.status === 'fulfilled').length;
    
    document.querySelector('.stat-card.requests h3').textContent = totalRequests;
    document.querySelector('.stat-card.pending h3').textContent = pendingRequests;
    document.querySelector('.stat-card.fulfilled h3').textContent = fulfilledRequests;
}

// Update active request status
function updateActiveRequestStatus() {
    const activeRequestDiv = document.getElementById('activeRequestStatus');
    if (!activeRequestDiv) return;
    
    const activeRequest = requestsData.find(r => r.status === 'pending' || r.status === 'approved');
    
    if (!activeRequest) {
        activeRequestDiv.innerHTML = '<p style="text-align: center; color: #999;">No active requests</p>';
        return;
    }

    const statusColor = {
        'pending': '#f57c00',
        'approved': '#388e3c'
    };

    const statusBg = {
        'pending': 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        'approved': 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
    };

    const timelineHtml = activeRequest.timeline.map(item => {
        const date = new Date(item.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">${date}</div>
                    <strong>${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</strong>
                    <p>${item.message}</p>
                </div>
            </div>
        `;
    }).join('');

    activeRequestDiv.innerHTML = `
        <div style="background: ${statusBg[activeRequest.status]}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <div style="font-size: 18px; font-weight: bold; color: ${statusColor[activeRequest.status]};">Request #${activeRequest.requestId}</div>
                    <div style="color: #666; margin-top: 5px;">Blood Type: ${activeRequest.bloodType} | Units: ${activeRequest.units}</div>
                </div>
                <span class="status-badge ${activeRequest.status}">${activeRequest.status.charAt(0).toUpperCase() + activeRequest.status.slice(1)}</span>
            </div>
            <div class="timeline">
                ${timelineHtml}
            </div>
        </div>
    `;
}

// Update request tables
function updateRequestTables() {
    const recentTable = document.getElementById('recentRequestsTable')?.getElementsByTagName('tbody')[0];
    const allTable = document.getElementById('allRequestsTable')?.getElementsByTagName('tbody')[0];
    
    if (recentTable) {
        recentTable.innerHTML = '';
    }
    if (allTable) {
        allTable.innerHTML = '';
    }

    if (requestsData.length === 0) {
        if (recentTable) {
            recentTable.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No requests yet</td></tr>';
        }
        if (allTable) {
            allTable.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No requests yet</td></tr>';
        }
        return;
    }

    requestsData.slice(0, 5).forEach(req => {
        const date = new Date(req.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${req.requestId}</td>
                <td>${req.bloodType}</td>
                <td>${req.units}</td>
                <td>${date}</td>
                <td><span class="status-badge ${req.status}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>
                    ${req.status === 'pending' ? 
                        `<button class="btn btn-danger btn-sm" onclick="cancelRequest('${req._id}')">Cancel</button>` 
                        : '-'}
                </td>
            </tr>
        `;
        
        if (recentTable) {
            recentTable.innerHTML += row;
        }
    });

    requestsData.forEach(req => {
        const date = new Date(req.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${req.requestId}</td>
                <td>${req.bloodType}</td>
                <td>${req.units}</td>
                <td>${date}</td>
                <td><span class="status-badge ${req.urgencyLevel.toLowerCase()}">${req.urgencyLevel}</span></td>
                <td><span class="status-badge ${req.status}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>
                    ${req.status === 'pending' ? 
                        `<button class="btn btn-danger btn-sm" onclick="cancelRequest('${req._id}')">Cancel</button>` 
                        : '-'}
                </td>
            </tr>
        `;
        
        if (allTable) {
            allTable.innerHTML += row;
        }
    });
}

// Display Blood Inventory
function displayBloodInventory(filter = '') {
    const grid = document.getElementById('bloodGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const filtered = filter ? bloodInventory.filter(b => b.bloodType === filter) : bloodInventory;

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No blood types found</p>';
        return;
    }

    filtered.forEach(blood => {
        const available = blood.units > 10;
        const card = document.createElement('div');
        card.className = `blood-card ${available ? 'available' : ''}`;
        card.innerHTML = `
            <div class="blood-type">${blood.bloodType}</div>
            <div class="blood-units">${blood.units} units</div>
            <div class="blood-units" style="color: ${available ? '#66bb6a' : '#f5576c'}; font-weight: bold; margin-top: 5px;">
                ${blood.status}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Search Blood
function searchBlood() {
    const bloodType = document.getElementById('searchBloodType').value;
    displayBloodInventory(bloodType);
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
    const sections = ['dashboard', 'search', 'request', 'myRequests', 'profile'];
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

    if (section === 'search') {
        displayBloodInventory();
    }

    if (section === 'profile') {
        displayProfileSection();
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        sidebar.classList.remove('open');
        mainContent.classList.remove('shifted');
    }
}

// Submit Blood Request
async function submitRequest(event) {
    event.preventDefault();

    const bloodType = document.getElementById('requestBloodType').value;
    const units = document.getElementById('requestUnits').value;
    const hospitalName = document.getElementById('hospitalName').value;
    const requiredDate = document.getElementById('requiredDate').value;
    const urgencyLevel = document.getElementById('urgencyLevel').value;
    const medicalReason = document.getElementById('medicalReason').value;
    const doctorName = document.getElementById('doctorName').value;
    const contactNumber = document.getElementById('contactNumber').value;

    try {
        const response = await fetch('/api/blood-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bloodType,
                units: parseInt(units),
                hospitalName,
                requiredDate,
                urgencyLevel,
                medicalReason,
                doctorName,
                contactNumber
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            document.getElementById('requestForm').reset();
            await loadBloodRequests();
            
            setTimeout(() => {
                showSection('dashboard');
            }, 2000);
        } else {
            alert(data.message || 'Error submitting request');
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('An error occurred. Please try again.');
    }
}

// Cancel Request
async function cancelRequest(id) {
    if (!confirm('Are you sure you want to cancel this request?')) {
        return;
    }

    try {
        const response = await fetch(`/api/blood-requests/${id}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            await loadBloodRequests();
        } else {
            alert(data.message || 'Error cancelling request');
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
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