import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, FileText, Check, X, Plus } from 'lucide-react';

export default function Appointments({ user, setView }) {
  const [appointments, setAppointments] = useState({
    new: [],
    inProgress: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    followUpDate: '',
    notes: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockAppointments = [
      {
        _id: '1',
        patientName: 'John Smith',
        patientId: 'P001',
        date: '2025-06-23',
        time: '10:00 AM',
        reason: 'Regular checkup',
        status: 'pending',
        contactNumber: '+1234567890',
        age: 35,
        gender: 'Male'
      },
      {
        _id: '2',
        patientName: 'Sarah Johnson',
        patientId: 'P002',
        date: '2025-06-23',
        time: '11:30 AM',
        reason: 'Follow-up consultation',
        status: 'pending',
        contactNumber: '+1234567891',
        age: 28,
        gender: 'Female'
      },
      {
        _id: '3',
        patientName: 'Mike Davis',
        patientId: 'P003',
        date: '2025-06-22',
        time: '2:00 PM',
        reason: 'Blood pressure check',
        status: 'confirmed',
        contactNumber: '+1234567892',
        age: 45,
        gender: 'Male'
      },
      {
        _id: '4',
        patientName: 'Emily Wilson',
        patientId: 'P004',
        date: '2025-06-21',
        time: '9:00 AM',
        reason: 'Diabetes consultation',
        status: 'completed',
        contactNumber: '+1234567893',
        age: 52,
        gender: 'Female'
      }
    ];

    // Group appointments by status
    const groupedAppointments = mockAppointments.reduce(
      (acc, appointment) => {
        if (appointment.status === 'pending') {
          acc.new.push(appointment);
        } else if (appointment.status === 'confirmed') {
          acc.inProgress.push(appointment);
        } else if (appointment.status === 'completed') {
          acc.completed.push(appointment);
        }
        return acc;
      },
      { new: [], inProgress: [], completed: [] }
    );

    setAppointments(groupedAppointments);
    setIsLoading(false);
  }, []);

  const handleAcceptAppointment = (appointmentId) => {
    setAppointments(prev => {
      const appointment = prev.new.find(apt => apt._id === appointmentId);
      if (appointment) {
        return {
          new: prev.new.filter(apt => apt._id !== appointmentId),
          inProgress: [...prev.inProgress, { ...appointment, status: 'confirmed' }],
          completed: prev.completed
        };
      }
      return prev;
    });
  };

  const handleRejectAppointment = (appointmentId) => {
    setAppointments(prev => ({
      ...prev,
      new: prev.new.filter(apt => apt._id !== appointmentId)
    }));
  };

  const handleCompleteAppointment = (appointmentId) => {
    setAppointments(prev => {
      const appointment = prev.inProgress.find(apt => apt._id === appointmentId);
      if (appointment) {
        return {
          new: prev.new,
          inProgress: prev.inProgress.filter(apt => apt._id !== appointmentId),
          completed: [...prev.completed, { ...appointment, status: 'completed' }]
        };
      }
      return prev;
    });
  };

  const handleAddPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
  };

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitPrescription = () => {
    // Here you would typically send the prescription data to your backend
    console.log('Prescription data:', prescriptionData);
    alert('Prescription added successfully!');
    setShowPrescriptionForm(false);
    setPrescriptionData({
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      instructions: '',
      followUpDate: '',
      notes: ''
    });
  };

  const AppointmentCard = ({ appointment, section }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
            <p className="text-sm text-gray-500">ID: {appointment.patientId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          section === 'new' ? 'bg-yellow-100 text-yellow-800' :
          section === 'inProgress' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {section === 'new' ? 'Pending' : section === 'inProgress' ? 'In Progress' : 'Completed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{appointment.date}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{appointment.time}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600"><strong>Reason:</strong> {appointment.reason}</p>
        <p className="text-sm text-gray-600"><strong>Age:</strong> {appointment.age} | <strong>Gender:</strong> {appointment.gender}</p>
        <p className="text-sm text-gray-600"><strong>Contact:</strong> {appointment.contactNumber}</p>
      </div>

      <div className="flex space-x-2">
        {section === 'new' && (
          <>
            <button
              onClick={() => handleAcceptAppointment(appointment._id)}
              className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleRejectAppointment(appointment._id)}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </>
        )}
        
        {section === 'inProgress' && (
          <button
            onClick={() => handleCompleteAppointment(appointment._id)}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark Complete</span>
          </button>
        )}
        
        {section === 'completed' && (
          <button
            onClick={() => handleAddPrescription(appointment)}
            className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Add Prescription</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments Dashboard</h1>
          <p className="text-gray-600">Manage your patient appointments efficiently</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Appointments</p>
                <p className="text-2xl font-bold text-yellow-600">{appointments.new.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{appointments.inProgress.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{appointments.completed.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Sections */}
        <div className="space-y-8">
          {/* New Appointments */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-yellow-500 rounded mr-3"></div>
              New Appointments ({appointments.new.length})
            </h2>
            {appointments.new.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.new.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} section="new" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No new appointments</p>
              </div>
            )}
          </section>

          {/* In Progress */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
              In Progress ({appointments.inProgress.length})
            </h2>
            {appointments.inProgress.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.inProgress.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} section="inProgress" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments in progress</p>
              </div>
            )}
          </section>

          {/* Completed */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
              Completed ({appointments.completed.length})
            </h2>
            {appointments.completed.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.completed.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} section="completed" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Check className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No completed appointments yet</p>
              </div>
            )}
          </section>
        </div>

        {/* Prescription Form Modal */}
        {showPrescriptionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Add Prescription for {selectedAppointment?.patientName}
                  </h3>
                  <button
                    onClick={() => setShowPrescriptionForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Patient ID: {selectedAppointment?.patientId} | Date: {selectedAppointment?.date}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Medications Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800">Medications</h4>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Medication</span>
                    </button>
                  </div>
                  
                  {prescriptionData.medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication Name
                        </label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        {prescriptionData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={prescriptionData.instructions}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                    placeholder="Enter any special instructions for the patient..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any additional notes or observations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitPrescription}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}