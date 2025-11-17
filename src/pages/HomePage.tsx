import { Building2, Users, Shield } from 'lucide-react';
// import TFP from '../assets/TFP.png';
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
            {/* <img src={TFP} alt="TFP Logo" className="w-8 h-8 object-contain" /> */}
          <h1 className="text-5xl font-bold text-white mb-4">
            Through Faith Properties Follow-Up System
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional CRM for tracking customer interactions and managing sales leads
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Employee Portal
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Submit and track your customer follow-up reports. Manage your leads and stay organized.
            </p>
            <a
              href="/employee/login"
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Employee Login
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Access analytics, manage employees, and view all reports with advanced filtering.
            </p>
            <a
              href="/admin/login"
              className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold text-center hover:from-amber-600 hover:to-amber-700 transition shadow-lg hover:shadow-xl"
            >
              Admin Login
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Role-based Permissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
