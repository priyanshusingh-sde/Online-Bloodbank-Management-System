// Admin Dashboard JavaScript - FINAL CORRECTED VERSION
// Global variables
let currentRequestId = null;
let currentAction = null;
let bloodInventoryData = [];
let requestsData = [];
let appointmentsData = [];
let usersData = [];

// Enhanced initialization with debugging
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Admin Dashboard Loading...');
    console.log('⏰ Current time:', new Date().toLocaleString());
    
    try {
        console.log('1️⃣ Checking admin authentication...');
        await checkAdminAuth();
        console.log('✅ Admin authenticated');
        
        console.log('2️⃣ Loading dashboard stats...');
        await loadDashboardStats();
        console.log('✅ Dashboard stats loaded');
        
        console.log('3️⃣ Loading blood inventory...');
        await loadInventory();
        console.log('✅ Blood inventory loaded');
        
        console.log('4️⃣ Loading all requests...');
        await loadAllRequests();
        console.log('✅ All requests loaded');
        
        console.log('5️⃣ Loading all appointments...');
        await loadAllAppointments();
        console.log('✅ All appointments loaded');
        
        console.log('6️⃣ Loading all users...');
        await loadAllUsers();
        console.log('✅ All users loaded');
        
        // Set date constraints for inventory form
        const today = new Date().toISOString().split('T')[0];
        const collectionDate = document.getElementById('invCollectionDate');
        const expiryDate = document.getElementById('invExpiryDate');
        if (collectionDate) collectionDate.setAttribute('max', today);
        if (expiryDate) expiryDate.setAttribute('min', today);
        
        console.log('🎉 Admin Dashboard fully loaded and ready!');
        console.log('═'.repeat(60));
    } catch (error) {
        console.error('❌ Error during dashboard initialization:', error);
        alert('Failed to load dashboard. Please check console for details.');
    }
});

// Check admin authentication
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/index.html';
    }
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.querySelector('.stat-card.donors h3').textContent = stats.totalDonors;
            document.querySelector('.stat-card.recipients h3').textContent = stats.totalRecipients;
            document.querySelector('.stat-card.requests h3').textContent = stats.pendingRequests;
            document.querySelector('.stat-card.inventory h3').textContent = stats.totalUnits;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Blood Inventory - ENHANCED
// Load Blood Inventory - ENHANCED
async function loadInventory() {
    console.log('📦 Loading inventory from database...');
    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/blood-inventory?_t=${timestamp}`, {
            cache: 'no-store' // Force no cache
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Inventory loaded:', data.inventory.length, 'blood types');
            
            // Clear and replace inventory data
            bloodInventoryData.length = 0;
            bloodInventoryData.push(...data.inventory);
            
            // Log current inventory
            console.log('📊 Current Inventory:');
            console.table(data.inventory.map(item => ({
                Type: item.bloodType,
                Units: item.units,
                Status: item.status,
                Updated: new Date(item.lastUpdated).toLocaleTimeString()
            })));
            
            displayInventory();
        } else {
            console.error('❌ Failed to load inventory');
        }
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
    }
}
// Display Inventory
function displayInventory() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) {
        console.log('⚠️ Inventory grid element not found');
        return;
    }
    
    console.log('🎨 Displaying inventory grid...');
    grid.innerHTML = '';

    if (!bloodInventoryData || bloodInventoryData.length === 0) {
        console.log('⚠️ No inventory data to display');
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No inventory data</p>';
        return;
    }

    // Sort by blood type
    const sortedInventory = [...bloodInventoryData].sort((a, b) => {
        const order = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        return order.indexOf(a.bloodType) - order.indexOf(b.bloodType);
    });

    sortedInventory.forEach(item => {
        const statusColor = item.status === 'Good' ? '#66bb6a' : 
                          item.status === 'Low' ? '#ffa726' : '#f5576c';
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <div class="blood-type">${item.bloodType}</div>
            <div class="units">${item.units} units</div>
            <div class="status" style="color: ${statusColor}; font-weight: bold;">${item.status}</div>
        `;
        grid.appendChild(div);
    });
    
    console.log('✅ Inventory display updated with', sortedInventory.length, 'blood types');
}

// Load All Requests
async function loadAllRequests() {
    try {
        const response = await fetch('/api/admin/blood-requests');
        const data = await response.json();
        
        if (data.success) {
            requestsData = data.requests;
            displayRequests('all');
            updatePendingRequestsTable();
        }
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

// Display Requests
function displayRequests(filter) {
    const table = document.getElementById('allRequestsTable')?.getElementsByTagName('tbody')[0];
    if (!table) return;
    
    table.innerHTML = '';

    const filtered = filter === 'all' ? requestsData : requestsData.filter(r => r.status === filter);

    if (filtered.length === 0) {
        table.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No requests found</td></tr>';
        return;
    }

    filtered.forEach(req => {
        const date = new Date(req.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${req.requestId}</td>
                <td>${req.recipientName}</td>
                <td>${req.bloodType}</td>
                <td>${req.units}</td>
                <td>${req.hospitalName}</td>
                <td><span class="status-badge ${req.urgencyLevel.toLowerCase()}">${req.urgencyLevel}</span></td>
                <td><span class="status-badge ${req.status}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>
                    ${req.status === 'pending' ? 
                        `<button class="btn btn-success btn-sm" onclick="openRequestModal('${req._id}', 'approve')">Approve</button>
                         <button class="btn btn-danger btn-sm" onclick="openRequestModal('${req._id}', 'reject')">Reject</button>` 
                        : req.status === 'approved' ?
                        `<button class="btn btn-primary btn-sm" onclick="fulfillRequest('${req._id}')">Mark Fulfilled</button>`
                        : '-'}
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Update Pending Requests Table
function updatePendingRequestsTable() {
    const table = document.getElementById('pendingRequestsTable');
    if (!table) return;
    
    table.innerHTML = '';

    const pendingRequests = requestsData.filter(r => r.status === 'pending').slice(0, 5);

    if (pendingRequests.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No pending requests</td></tr>';
        return;
    }

    pendingRequests.forEach(req => {
        const date = new Date(req.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${req.requestId}</td>
                <td>${req.recipientName}</td>
                <td>${req.bloodType}</td>
                <td>${req.units}</td>
                <td><span class="status-badge ${req.urgencyLevel.toLowerCase()}">${req.urgencyLevel}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="openRequestModal('${req._id}', 'approve')">Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="openRequestModal('${req._id}', 'reject')">Reject</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Update Pending Appointments Table
function updatePendingAppointmentsTable() {
    const table = document.getElementById('pendingAppointmentsTable');
    if (!table) return;
    
    table.innerHTML = '';

    const pendingAppointments = appointmentsData.filter(apt => apt.status === 'scheduled').slice(0, 5);

    if (pendingAppointments.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No pending appointments</td></tr>';
        return;
    }

    pendingAppointments.forEach(apt => {
        const date = new Date(apt.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const row = `
            <tr>
                <td>${apt.donorName}</td>
                <td>${apt.bloodGroup}</td>
                <td>${date}</td>
                <td>${apt.time}</td>
                <td>${apt.location}</td>
                <td><span class="status-badge scheduled">Scheduled</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="approveAppointment('${apt._id}')">Confirm</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectAppointment('${apt._id}')">Reject</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Load All Appointments
async function loadAllAppointments() {
    try {
        console.log('📥 Loading appointments from server...');
        const response = await fetch('/api/admin/appointments');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Loaded', data.appointments.length, 'appointments');
            appointmentsData = data.appointments;
            
            // Log status breakdown
            const statusCounts = {};
            appointmentsData.forEach(apt => {
                statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
            });
            console.log('📊 Appointment statuses:', statusCounts);
            
            displayAppointments();
            updatePendingAppointmentsTable();
        } else {
            console.error('❌ Failed to load appointments');
        }
    } catch (error) {
        console.error('❌ Error loading appointments:', error);
    }
}

// Display Appointments - CORRECTED
function displayAppointments() {
    const table = document.getElementById('appointmentsTable');
    if (!table) return;
    
    table.innerHTML = '';

    if (appointmentsData.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No appointments found</td></tr>';
        return;
    }

    appointmentsData.slice(0, 20).forEach(apt => {
        const date = new Date(apt.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Determine action buttons based on status
        let actionButton = '-';
        
        if (apt.status === 'scheduled') {
            actionButton = `
                <button class="btn btn-success btn-sm" onclick="approveAppointment('${apt._id}')">Confirm</button>
                <button class="btn btn-danger btn-sm" onclick="rejectAppointment('${apt._id}')">Reject</button>
            `;
        } else if (apt.status === 'confirmed') {
            actionButton = `<button class="btn btn-primary btn-sm" onclick="completeAppointment('${apt._id}')">Mark Complete</button>`;
        } else if (apt.status === 'completed') {
            actionButton = `<span style="color: #388e3c; font-weight: bold;">✓ Completed</span>`;
        } else if (apt.status === 'cancelled') {
            actionButton = `<span style="color: #d32f2f; font-weight: bold;">✗ Cancelled</span>`;
        }

        const row = `
            <tr>
                <td>${apt.donorName}</td>
                <td>${apt.bloodGroup}</td>
                <td>${date}</td>
                <td>${apt.time}</td>
                <td>${apt.location}</td>
                <td><span class="status-badge ${apt.status}">${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span></td>
                <td>${actionButton}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
    
    console.log('📋 Displayed', appointmentsData.length, 'appointments');
}

// Load All Users
async function loadAllUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (data.success) {
            usersData = data.users;
            displayUsers();
            displayDonors();
            displayRecipients();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display Users
function displayUsers() {
    const table = document.getElementById('usersTable');
    if (!table) return;
    
    table.innerHTML = '';

    usersData.slice(0, 10).forEach(user => {
        const row = `
            <tr>
                <td>${user._id.substr(-6).toUpperCase()}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</td>
                <td>${user.bloodGroup}</td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus('${user._id}', ${user.isActive})">${user.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Display Donors
function displayDonors() {
    const table = document.getElementById('donorsTable');
    if (!table) return;
    
    table.innerHTML = '';

    const donors = usersData.filter(u => u.userType === 'donor');

    if (donors.length === 0) {
        table.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No donors found</td></tr>';
        return;
    }

    donors.forEach(donor => {
        const row = `
            <tr>
                <td>${donor._id.substr(-6).toUpperCase()}</td>
                <td>${donor.fullName}</td>
                <td>${donor.email}</td>
                <td>${donor.bloodGroup}</td>
                <td>${donor.phone}</td>
                <td>${donor.totalDonations || 0}</td>
                <td><span class="status-badge ${donor.isActive ? 'active' : 'inactive'}">${donor.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus('${donor._id}', ${donor.isActive})">${donor.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Display Recipients
function displayRecipients() {
    const table = document.getElementById('recipientsTable');
    if (!table) return;
    
    table.innerHTML = '';

    const recipients = usersData.filter(u => u.userType === 'recipient');

    if (recipients.length === 0) {
        table.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No recipients found</td></tr>';
        return;
    }

    recipients.forEach(recipient => {
        const row = `
            <tr>
                <td>${recipient._id.substr(-6).toUpperCase()}</td>
                <td>${recipient.fullName}</td>
                <td>${recipient.email}</td>
                <td>${recipient.bloodGroup}</td>
                <td>${recipient.phone}</td>
                <td>${recipient.hospitalName || 'N/A'}</td>
                <td><span class="status-badge ${recipient.isActive ? 'active' : 'inactive'}">${recipient.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus('${recipient._id}', ${recipient.isActive})">${recipient.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
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
    const sections = ['dashboard', 'analytics', 'requests', 'appointments', 'inventory', 'addInventory', 'users', 'donors', 'recipients', 'reports'];
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
    
    const clickedItem = document.querySelector(`.sidebar-item[onclick*="${section}"]`);
    if (clickedItem) {
        clickedItem.classList.add('active');
    }

    if (section === 'inventory') {
        displayInventory();
    }

    if (section === 'requests') {
        displayRequests('all');
    }

    if (section === 'appointments') {
        displayAppointments();
    }

    if (section === 'users') {
        displayUsers();
    }

    if (section === 'donors') {
        displayDonors();
    }

    if (section === 'recipients') {
        displayRecipients();
    }

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Filter Requests
function filterRequests(filter) {
    displayRequests(filter);
}

// Open Request Modal
function openRequestModal(requestId, action) {
    const request = requestsData.find(r => r._id === requestId);
    if (!request) return;

    currentRequestId = requestId;
    currentAction = action;

    document.getElementById('detailRequestId').textContent = request.requestId;
    document.getElementById('detailPatientName').textContent = request.recipientName;
    document.getElementById('detailBloodType').textContent = request.bloodType;
    document.getElementById('detailUnits').textContent = request.units;
    document.getElementById('detailHospital').textContent = request.hospitalName;
    document.getElementById('detailUrgency').textContent = request.urgencyLevel;
    
    const reqDate = new Date(request.requiredDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('detailDate').textContent = reqDate;
    document.getElementById('detailReason').textContent = request.medicalReason;

    if (action === 'approve') {
        document.getElementById('modalTitle').textContent = 'Approve Request';
    } else {
        document.getElementById('modalTitle').textContent = 'Reject Request';
    }

    document.getElementById('requestModal').classList.add('active');
}

// Process Request
async function processRequest(action) {
    if (!currentRequestId) return;

    try {
        const response = await fetch(`/api/admin/blood-requests/${currentRequestId}/${action}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            closeModal('requestModal');
            showSuccessModal(data.message);
            
            await loadAllRequests();
            await loadInventory();
            await loadDashboardStats();
        } else {
            alert(data.message || `Error ${action}ing request`);
        }
    } catch (error) {
        console.error(`Error ${action}ing request:`, error);
        alert('An error occurred. Please try again.');
    }
}

// Fulfill Request
// Fulfill Request - ENHANCED VERSION
async function fulfillRequest(requestId) {
    // Find the request
    const request = requestsData.find(r => r._id === requestId);
    if (!request) {
        alert('Request not found');
        return;
    }

    if (!confirm(`Mark this request as FULFILLED?\n\nThis will:\n✓ Mark request as FULFILLED\n✓ Deduct ${request.units} units of ${request.bloodType} from inventory\n✓ Deliver blood to recipient`)) {
        return;
    }

    console.log('🔵 Fulfilling request:', {
        id: request.requestId,
        bloodType: request.bloodType,
        units: request.units,
        status: request.status
    });

    // Check if request is approved
    if (request.status !== 'approved') {
        alert(`This request cannot be fulfilled.\nCurrent status: ${request.status}\n\nOnly APPROVED requests can be marked as fulfilled.`);
        return;
    }

    try {
        console.log('📤 Sending fulfill request to server...');
        
        const response = await fetch(`/api/admin/blood-requests/${requestId}/fulfill`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('📬 Server response:', data);

        if (data.success) {
            console.log('✅ Request fulfilled successfully!');
            
            // Build detailed success message
            let message = '✅ REQUEST FULFILLED SUCCESSFULLY!\n\n';
            message += `Request ID: ${request.requestId}\n`;
            message += `Patient: ${request.recipientName}\n`;
            message += `Blood Type: ${request.bloodType}\n`;
            message += `Units: ${request.units}\n\n`;
            
            if (data.inventoryUpdate) {
                message += '📊 INVENTORY UPDATE:\n';
                message += `• Previous Units: ${data.inventoryUpdate.oldUnits}\n`;
                message += `• New Units: ${data.inventoryUpdate.newUnits}\n`;
                message += `• Deducted: -${data.inventoryUpdate.unitsDeducted} units\n`;
                message += `• Status: ${data.inventoryUpdate.status}`;
            }
            
            alert(message);
            
            console.log('🔄 Reloading all data...');
            
            // Force reload with delay
            setTimeout(async () => {
                console.log('📦 Step 1: Reloading inventory...');
                await loadInventory();
                
                console.log('📋 Step 2: Reloading requests...');
                await loadAllRequests();
                
                console.log('📊 Step 3: Reloading stats...');
                await loadDashboardStats();
                
                console.log('✅ All data reloaded!');
                
                // Force display if on inventory section
                const inventorySection = document.getElementById('inventorySection');
                if (inventorySection && inventorySection.style.display !== 'none') {
                    console.log('🎨 Forcing inventory display refresh...');
                    displayInventory();
                }
                
                // Show success modal
                showSuccessModal('✅ Request fulfilled and inventory updated!');
                
            }, 700); // 700ms delay
            
        } else {
            console.error('❌ Server returned error:', data.message);
            alert('ERROR: ' + (data.message || 'Failed to fulfill request'));
        }
    } catch (error) {
        console.error('❌ Error fulfilling request:', error);
        alert('An error occurred: ' + error.message);
    }
}

// Add Inventory
async function addInventory(event) {
    event.preventDefault();

    const bloodType = document.getElementById('invBloodType').value;
    const units = parseInt(document.getElementById('invUnits').value);

    try {
        const response = await fetch(`/api/admin/inventory/${bloodType}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                units,
                action: 'add'
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(`Successfully added ${units} units of ${bloodType} to inventory!`);
            document.getElementById('inventoryForm').reset();
            
            await loadInventory();
            await loadDashboardStats();
            
            setTimeout(() => {
                showSection('inventory');
            }, 2000);
        } else {
            alert(data.message || 'Error updating inventory');
        }
    } catch (error) {
        console.error('Error adding inventory:', error);
        alert('An error occurred. Please try again.');
    }
}

// Toggle User Status
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            await loadAllUsers();
            await loadDashboardStats();
        } else {
            alert(data.message || 'Error updating user status');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('An error occurred. Please try again.');
    }
}

// Approve Appointment - CORRECTED
async function approveAppointment(appointmentId) {
    if (!confirm('Confirm this appointment?')) {
        return;
    }

    try {
        console.log('✅ Approving appointment:', appointmentId);
        const response = await fetch(`/api/admin/appointments/${appointmentId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            await loadAllAppointments();
            await loadDashboardStats();
        } else {
            alert(data.message || 'Error approving appointment');
        }
    } catch (error) {
        console.error('Error approving appointment:', error);
        alert('An error occurred. Please try again.');
    }
}

// Reject Appointment - CORRECTED
async function rejectAppointment(appointmentId) {
    if (!confirm('Are you sure you want to reject this appointment?')) {
        return;
    }

    try {
        console.log('❌ Rejecting appointment:', appointmentId);
        const response = await fetch(`/api/admin/appointments/${appointmentId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccessModal(data.message);
            await loadAllAppointments();
            await loadDashboardStats();
        } else {
            alert(data.message || 'Error rejecting appointment');
        }
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        alert('An error occurred. Please try again.');
    }
}

// Complete Appointment - FINAL FIXED VERSION
async function completeAppointment(appointmentId) {
    if (!confirm('Mark this donation as completed?\n\nThis will:\n✓ Mark appointment as COMPLETED\n✓ Add 1 unit to blood inventory\n✓ Update donor statistics')) {
        return;
    }

    console.log('🔵 Starting appointment completion for ID:', appointmentId);

    // Find the appointment
    const appointment = appointmentsData.find(apt => apt._id === appointmentId);
    if (!appointment) {
        alert('Appointment not found in local data');
        return;
    }

    console.log('📋 Appointment details:', {
        id: appointment._id,
        donor: appointment.donorName,
        bloodGroup: appointment.bloodGroup,
        status: appointment.status
    });

    // Check if status is confirmed
    if (appointment.status !== 'confirmed') {
        alert(`This appointment cannot be completed.\nCurrent status: ${appointment.status}\n\nOnly CONFIRMED appointments can be marked as complete.`);
        return;
    }

    try {
        console.log('🔄 Sending completion request to server...');
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('🔬 Server response:', data);

        if (data.success) {
            console.log('✅ Appointment completed successfully!');
            
            // Build detailed success message
            let message = '✅ DONATION COMPLETED SUCCESSFULLY!\n\n';
            message += `Donor: ${appointment.donorName}\n`;
            message += `Blood Type: ${appointment.bloodGroup}\n\n`;
            
            if (data.inventoryUpdate) {
                message += '📊 INVENTORY UPDATE:\n';
                message += `• Previous Units: ${data.inventoryUpdate.oldUnits}\n`;
                message += `• New Units: ${data.inventoryUpdate.newUnits}\n`;
                message += `• Added: +${data.inventoryUpdate.unitsAdded} unit\n`;
                message += `• Status: ${data.inventoryUpdate.status}\n\n`;
            }
            
            message += '👤 DONOR STATS:\n';
            message += '• Total Donations: +1\n';
            message += '• Reward Points: +100';
            
            alert(message);
            
            console.log('🔄 Reloading all data with forced refresh...');
            
            // Force reload with delay
            setTimeout(async () => {
                console.log('📦 Step 1: Reloading inventory...');
                await loadInventory();
                
                console.log('📅 Step 2: Reloading appointments...');
                await loadAllAppointments();
                
                console.log('📊 Step 3: Reloading stats...');
                await loadDashboardStats();
                
                console.log('✅ All data reloaded successfully!');
                
                // Force display if on inventory section
                const inventorySection = document.getElementById('inventorySection');
                if (inventorySection && inventorySection.style.display !== 'none') {
                    console.log('🎨 Forcing inventory display refresh...');
                    displayInventory();
                }
                
                // Show success modal after reload
                showSuccessModal('✅ Appointment completed and inventory updated!');
                
            }, 700); // 700ms delay for DB write
            
        } else {
            console.error('❌ Server returned error:', data.message);
            alert('ERROR: ' + (data.message || 'Failed to complete appointment'));
        }
    } catch (error) {
        console.error('❌ Error completing appointment:', error);
        alert('An error occurred: ' + error.message);
    }
}

// Generate Report
function generateReport(event) {
    event.preventDefault();

    const reportType = document.getElementById('reportType').value;
    const format = document.getElementById('reportFormat').value;

    showSuccessModal(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report is being generated in ${format.toUpperCase()} format. You will receive a download link shortly.`);
    
    document.getElementById('reportForm').reset();
}

// Show Success Modal
function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('active');
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
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