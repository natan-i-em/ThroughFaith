# Real Estate Follow-Up System - Setup Guide

## Creating Your First Admin Account

Since this is a fresh installation, you'll need to create the first admin account manually through Supabase.

### Step 1: Sign Up Through the Application

1. Go to `/employee/login` in your browser
2. Open your browser's developer console (F12)
3. Run this command in the console:

```javascript
await supabase.auth.signUp({
  email: 'admin@company.com',
  password: 'admin123',
  options: {
    data: {
      full_name: 'System Admin',
      role: 'admin'
    }
  }
})
```

### Step 2: Verify in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Confirm the user was created
4. Navigate to Table Editor → profiles
5. Find the admin user and verify `role` is set to 'admin'

### Step 3: Login

1. Go to `/admin/login`
2. Sign in with your admin credentials
3. You can now access the full admin dashboard

## Creating Employee Accounts

Once logged in as admin:

1. Go to "Manage Employees" in the admin dashboard
2. Click "Add New Employee"
3. Fill in the employee details
4. The employee will be able to log in at `/employee/login`

## Features

### Employee Portal
- Submit follow-up reports
- View own reports (read-only after submission)
- Cannot see other employees' reports
- Cannot edit or delete submitted reports

### Admin Dashboard
- View all reports from all employees
- Filter by employee, status, and date range
- Export reports to CSV
- View analytics (total leads, hot/warm/cold/closed counts)
- Manage employee accounts (add, activate, deactivate)
- Full visibility across the organization

## Security Features

- Role-based access control (Admin vs Employee)
- Row Level Security (RLS) enforced at database level
- Write-once reports (no editing after submission)
- Secure authentication with JWT tokens
- Active/inactive account management

## Database Structure

### Tables
1. **profiles** - User profiles with role information
2. **follow_up_reports** - Customer interaction reports

### Lead Statuses
- Hot - High priority, ready to close
- Warm - Interested, needs nurturing
- Cold - Low engagement
- Closed - Deal completed

## Navigation

- Home: `/`
- Employee Login: `/employee/login`
- Employee Dashboard: `/employee/dashboard`
- Admin Login: `/admin/login`
- Admin Dashboard: `/admin/dashboard`
