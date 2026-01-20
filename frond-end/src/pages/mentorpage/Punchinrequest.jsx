import React from 'react'
import Sidebar from './sidebar'
import { useState, useEffect } from "react";
import axios from "axios";

function Punchinrequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    // Poll for new requests every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3001/mentor/punch-requests",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const accept = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/mentor/punch-requests/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchRequests();
      alert("✅ Request accepted successfully!");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("❌ Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/mentor/punch-requests/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchRequests();
      alert("❌ Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("❌ Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const acceptedToday = requests.filter(req => 
    req.status === 'APPROVED' && 
    new Date(req.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const rejectedToday = requests.filter(req => 
    req.status === 'REJECTED' && 
    new Date(req.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <Sidebar/>
        <div className="flex-1 p-4 md:p-6 ml-0 lg:ml-64">
      
          {/* Header */}
          <div className="bg-[#141E46]/90 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white/20 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Punch-in Requests</h1>
                  <p className="text-blue-100 mt-1">Review and manage student attendance requests</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">{pendingRequests.length}</div>
                  <div className="text-sm text-blue-100">Pending</div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">{acceptedToday}</div>
                  <div className="text-sm text-blue-100">Accepted</div>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
                  <div className="text-2xl font-bold">{requests.length}</div>
                  <div className="text-sm text-blue-100">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: "⏰", value: pendingRequests.length, label: "Pending Requests", color: "blue" },
              { icon: "✅", value: acceptedToday, label: "Accepted Today", color: "green" },
              { icon: "❌", value: rejectedToday, label: "Rejected Today", color: "red" },
              { icon: "📊", value: requests.length, label: "Total Requests", color: "purple" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg mr-4`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Table Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Student Requests</h2>
                  <p className="text-gray-600 mt-1">Accept or reject student punch-in requests</p>
                </div>
                <button 
                  onClick={fetchRequests}
                  className="mt-3 md:mt-0 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <p className="text-lg font-medium">No pending requests</p>
                          <p className="text-sm">All requests have been processed</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                              {req.studentId?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{req.studentId?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">ID: {req.studentId?._id?.slice(-6) || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                            {req.studentId?.batch || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                            {req.studentId?.course || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {new Date(req.punchTime).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(req.punchTime).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span className={`font-medium ${req.distance <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.round(req.distance)}m
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            req.type === 'PUNCH_IN' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {req.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {req.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => accept(req._id)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Accept
                            </button>
                            <button 
                              onClick={() => reject(req._id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 mb-3 md:mb-0">
                Showing <span className="font-medium">{pendingRequests.length}</span> of <span className="font-medium">{requests.length}</span> total requests
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Punchinrequest