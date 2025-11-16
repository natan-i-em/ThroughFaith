import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ReportWithEmployee, Profile } from '../lib/supabase';
import {
  LogOut,
  Users,
  FileText,
  TrendingUp,
  Filter,
  Download,
  Settings,
  Calendar,
  Phone,
  Building2
} from 'lucide-react';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [reports, setReports] = useState<ReportWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false);

  const [filters, setFilters] = useState({
    employee: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchReports(), fetchEmployees()]);
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('follow_up_reports')
      .select(`
        *,
        employee:profiles!employee_id(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('full_name');

    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filters.employee && report.employee_id !== filters.employee) return false;
    if (filters.status && report.lead_status !== filters.status) return false;
    if (filters.dateFrom && report.contact_date < filters.dateFrom) return false;
    if (filters.dateTo && report.contact_date > filters.dateTo) return false;
    return true;
  });

  const stats = {
    totalLeads: filteredReports.length,
    hotLeads: filteredReports.filter(r => r.lead_status === 'Hot').length,
    warmLeads: filteredReports.filter(r => r.lead_status === 'Warm').length,
    coldLeads: filteredReports.filter(r => r.lead_status === 'Cold').length,
    closedLeads: filteredReports.filter(r => r.lead_status === 'Closed').length,
    totalEmployees: employees.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Employee',
      'Customer Name',
      'Phone',
      'Lead Source',
      'Property',
      'Status',
      'Summary',
      'Next Action',
    ];

    const rows = filteredReports.map(report => [
      new Date(report.contact_date).toLocaleDateString(),
      report.employee.full_name,
      report.customer_name,
      report.customer_phone,
      report.lead_source,
      report.property_interested_in,
      report.lead_status,
      report.follow_up_summary,
      report.next_action,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEmployeeManagement(!showEmployeeManagement)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Employees</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {showEmployeeManagement ? (
          <EmployeeManagement
            employees={employees}
            onClose={() => setShowEmployeeManagement(false)}
            onUpdate={fetchEmployees}
          />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
              <p className="text-gray-600">Track performance and manage all reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLeads}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.hotLeads}</div>
                <div className="text-sm text-gray-600">Hot Leads</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.warmLeads}</div>
                <div className="text-sm text-gray-600">Warm Leads</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.coldLeads}</div>
                <div className="text-sm text-gray-600">Cold Leads</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.closedLeads}</div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEmployees}</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-bold text-gray-900">Filter Reports</h3>
                </div>
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee
                  </label>
                  <select
                    value={filters.employee}
                    onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {(filters.employee || filters.status || filters.dateFrom || filters.dateTo) && (
                <button
                  onClick={() => setFilters({ employee: '', status: '', dateFrom: '', dateTo: '' })}
                  className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600">No reports match your current filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">
                  All Reports ({filteredReports.length})
                </h3>

                <div className="grid gap-6">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {report.customer_name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(report.lead_status)}`}>
                              {report.lead_status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{report.employee.full_name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{report.customer_phone}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(report.contact_date).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Lead Source</p>
                          <p className="text-gray-900">{report.lead_source}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Property</p>
                          <p className="text-gray-900">{report.property_interested_in}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Follow-Up Summary</p>
                        <p className="text-gray-900">{report.follow_up_summary}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Next Action</p>
                        <p className="text-gray-900">{report.next_action}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Submitted on {new Date(report.created_at).toLocaleString()} by {report.employee.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmployeeManagement({
  employees,
  onClose,
  onUpdate
}: {
  employees: Profile[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'employee',
          },
        },
      });

      if (signUpError) throw signUpError;

      setFormData({ email: '', password: '', full_name: '' });
      setShowAddForm(false);
      onUpdate();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add employee';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', employeeId);

    if (error) {
      console.error('Error updating employee status:', error);
    } else {
      onUpdate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600 mt-1">Add and manage employee accounts</p>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Back to Reports
        </button>
      </div>

      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-lg"
        >
          + Add New Employee
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Employee</h3>

          <form onSubmit={handleAddEmployee} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setFormData({ email: '', password: '', full_name: '' });
                }}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-900 font-semibold">{employee.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{employee.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    employee.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(employee.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      employee.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {employee.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
