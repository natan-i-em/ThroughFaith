import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, FollowUpReport } from '../lib/supabase';
import { LogOut, Plus, Calendar, Phone, Building2 } from 'lucide-react';

export default function EmployeeDashboard() {
  const { profile, signOut } = useAuth();
  const [reports, setReports] = useState<FollowUpReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('follow_up_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Employee Portal</h1>
                <p className="text-sm text-gray-600">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Follow-Up Reports</h2>
            <p className="text-gray-600 mt-1">Track and manage your customer interactions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Submit New Report</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">Get started by submitting your first follow-up report</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Report</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {report.customer_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(report.lead_status)}`}>
                    {report.lead_status}
                  </span>
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
                    Submitted on {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ReportFormModal onClose={() => setShowForm(false)} onSuccess={fetchReports} />
      )}
    </div>
  );
}

function ReportFormModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    contact_date: '',
    lead_source: '',
    property_interested_in: '',
    follow_up_summary: '',
    next_action: '',
    lead_status: 'Warm',
  });

  const leadSources = [
    'Website',
    'Referral',
    'Walk-in',
    'Phone Call',
    'Social Media',
    'Email Campaign',
    'Property Portal',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('follow_up_reports').insert([
        {
          ...formData,
          employee_id: profile?.id,
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Follow-Up Report</h2>
          <p className="text-gray-600 mt-1">Fill in the customer interaction details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Date *
              </label>
              <input
                type="date"
                required
                value={formData.contact_date}
                onChange={(e) => setFormData({ ...formData, contact_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lead Source *
              </label>
              <select
                required
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select source</option>
                {leadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Interested In *
            </label>
            <input
              type="text"
              required
              value={formData.property_interested_in}
              onChange={(e) => setFormData({ ...formData, property_interested_in: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main St, Luxury Condo"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Follow-Up Summary *
            </label>
            <textarea
              required
              rows={4}
              value={formData.follow_up_summary}
              onChange={(e) => setFormData({ ...formData, follow_up_summary: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the interaction, customer feedback, and key points discussed..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Next Action *
            </label>
            <input
              type="text"
              required
              value={formData.next_action}
              onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Schedule property viewing, send documentation, follow-up call..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lead Status *
            </label>
            <div className="grid grid-cols-4 gap-4">
              {['Hot', 'Warm', 'Cold', 'Closed'].map((status) => (
                <label
                  key={status}
                  className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.lead_status === status
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="lead_status"
                    value={status}
                    checked={formData.lead_status === status}
                    onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                    className="sr-only"
                  />
                  <span className="font-semibold">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
