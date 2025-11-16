# CherryClouds - Blood Bank Management System

A comprehensive online blood bank management system built with HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB.

## Features

### For Donors
- User registration and authentication
- Schedule blood donation appointments
- View donation history
- Track reward points
- Receive notifications about appointment status
- Profile management

### For Recipients
- User registration and authentication
- Search for available blood types
- Submit blood requests
- Track request status in real-time
- View request timeline
- Cancel pending requests

### For Administrators
- Dashboard with comprehensive statistics
- Approve/reject blood requests
- Manage donor appointments
- Update blood inventory
- User management
- Generate reports

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Session Management**: Express-session with MongoDB store
- **Authentication**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm (Node Package Manager)

## Installation

### 1. Clone or Download the Project

Download all the files to a single directory.

### 2. Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- express-session
- connect-mongo
- cors

### 3. Configure MongoDB Connection

Open `server.js` and update the MongoDB connection string on line 13:

```javascript
const MONGODB_URI = 'mongodb+srv://priyanshu_singh_db_user:YOUR_PASSWORD@cluster0.gn8sae9.mongodb.net/cherryclouds_db?retryWrites=true&w=majority&appName=Cluster0';
```

Replace `YOUR_PASSWORD` with your actual MongoDB password.

### 4. File Structure

Your project should have the following structure:

```
project-folder/
│
├── server.js                    (Backend server)
├── package.json                 (Dependencies)
├── index.html                   (Landing page)
├── style.css                    (Landing page styles)
├── script.js                    (Replace with script_updated.js)
├── donor_dashboard.html         (Donor interface)
├── recipient_dashboard.html     (Recipient interface)
├── admin_dashboard.html         (Admin interface)
├── donor_dashboard.js           (New file - add this)
├── recipient_dashboard.js       (New file - add this)
├── admin_dashboard.js           (New file - add this)
└── README.md                    (This file)
```

### 5. Add Dashboard JavaScript Files

You need to link the JavaScript files to their respective HTML files:

**For donor_dashboard.html**, add before closing `</body>` tag:
```html
<script src="donor_dashboard.js"></script>
```

**For recipient_dashboard.html**, add before closing `</body>` tag:
```html
<script src="recipient_dashboard.js"></script>
```

**For admin_dashboard.html**, add before closing `</body>` tag:
```html
<script src="admin_dashboard.js"></script>
```

### 6. Replace script.js

Replace the content of `script.js` with the content from `script_updated.js`.

## Running the Application

### 1. Start the Server

In the project directory, run:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 2. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Default Admin Credentials

The system creates a default admin account on first run:

- **Admin ID**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login in production!

## User Registration

### Donor Registration
1. Click "User Login" button
2. Click "Register" link
3. Select "Register as Donor"
4. Fill in all required information:
   - Personal details (name, email, phone, etc.)
   - Blood group
   - Weight (must be at least 45kg)
   - Last donation date
   - Health declarations
5. Submit the form
6. Login with registered credentials

### Recipient Registration
1. Click "User Login" button
2. Click "Register" link
3. Select "Register as Recipient"
4. Fill in all required information:
   - Personal details
   - Blood group
   - Medical condition
   - Hospital information
   - Emergency contact
5. Submit the form
6. Login with registered credentials

## Usage Guide

### For Donors

1. **Schedule Appointment**
   - Navigate to "Schedule Donation"
   - Select date, time, and location
   - Add any special requirements
   - Submit appointment
   - Wait for admin confirmation

2. **View History**
   - Check "Donation History" to see past donations
   - Track reward points earned

3. **Manage Appointments**
   - View upcoming appointments on dashboard
   - Cancel appointments if needed (only scheduled ones)

### For Recipients

1. **Search Blood Availability**
   - Navigate to "Search Blood"
   - Filter by blood type
   - Check real-time availability

2. **Request Blood**
   - Navigate to "Request Blood"
   - Fill in all required information
   - Submit request
   - Track request status on dashboard

3. **Track Requests**
   - View active request timeline
   - See all past requests
   - Cancel pending requests if needed

### For Administrators

1. **Dashboard Overview**
   - View total donors, recipients, pending requests
   - Monitor blood inventory levels
   - See recent activities

2. **Manage Blood Requests**
   - Navigate to "Blood Requests"
   - Review pending requests
   - Approve or reject requests
   - Mark approved requests as fulfilled

3. **Manage Inventory**
   - View current blood stock
   - Add new blood units
   - Monitor critical stock levels

4. **User Management**
   - View all registered users
   - Deactivate users if needed
   - View user details

## Database Schema

### Users Collection
- Personal information
- Authentication credentials
- User type (donor/recipient)
- Type-specific information
- Activity status

### Appointments Collection
- Donor information
- Appointment details
- Status tracking
- Timestamps

### Blood Requests Collection
- Recipient information
- Blood type and quantity
- Hospital details
- Status and timeline
- Timestamps

### Blood Inventory Collection
- Blood type
- Available units
- Status (Good/Low/Critical)
- Last updated timestamp

### Admin Collection
- Admin credentials
- Name

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/logout` - Logout

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Appointments (Donor)
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Blood Requests (Recipient)
- `POST /api/blood-requests` - Create blood request
- `GET /api/blood-requests` - Get user requests
- `PUT /api/blood-requests/:id/cancel` - Cancel request

### Inventory
- `GET /api/blood-inventory` - Get blood inventory (public)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/appointments` - Get all appointments
- `PUT /api/admin/appointments/:id/:action` - Approve/reject appointment
- `PUT /api/admin/appointments/:id/complete` - Complete appointment
- `GET /api/admin/blood-requests` - Get all requests
- `PUT /api/admin/blood-requests/:id/:action` - Approve/reject request
- `PUT /api/admin/blood-requests/:id/fulfill` - Mark request fulfilled
- `PUT /api/admin/inventory/:bloodType` - Update inventory
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/deactivate` - Deactivate user

## Workflow

### Donor Workflow
1. Register as donor
2. Login to donor dashboard
3. Schedule appointment
4. Admin reviews and confirms
5. Donor receives notification
6. Complete donation
7. Earn reward points
8. Inventory updated automatically

### Recipient Workflow
1. Register as recipient
2. Login to recipient dashboard
3. Search available blood
4. Submit blood request with details
5. Track request status
6. Admin reviews and approves
7. Inventory deducted
8. Request marked as fulfilled
9. Blood delivered to hospital

### Admin Workflow
1. Login with admin credentials
2. Monitor dashboard statistics
3. Review pending appointments
4. Confirm/reject appointments
5. Review blood requests
6. Approve/reject requests
7. Manage blood inventory
8. Complete donations
9. Fulfill blood requests

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Protected routes with middleware
- Input validation
- SQL injection prevention (NoSQL)
- XSS protection

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Server won't start
- Check if MongoDB connection string is correct
- Ensure MongoDB Atlas allows connections from your IP
- Check if port 3000 is available

### Can't login
- Verify credentials are correct
- Check if user is registered
- Check browser console for errors

### Database connection issues
- Verify MongoDB Atlas credentials
- Check network connection
- Ensure database name is correct

## Future Enhancements

- Email notifications
- SMS alerts
- Blood donation camps management
- Mobile app
- Multi-language support
- Advanced analytics
- PDF report generation
- Payment integration for rewards

## Support

For issues or questions, please contact the development team.

## License

This project is licensed under the MIT License.

---

**CherryClouds** - Saving lives through smart blood management 🩸