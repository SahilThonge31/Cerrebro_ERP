import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiPlus, FiTrash2, FiSave, FiCalendar, FiClock, FiMenu, FiAward } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminExamPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]); // List of published exams
  const [showModal, setShowModal] = useState(false);

  // --- FORM STATE ---
  const [title, setTitle] = useState('');
  const [standard, setStandard] = useState('10th');
  const [board, setBoard] = useState('CBSE');
  
  // Dynamic Schedule Rows
  // Initial State: One empty row
  const [scheduleRows, setScheduleRows] = useState([
      { subject: '', date: '', startTime: '', duration: '' }
  ]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await api.get('/exams/fetch', { headers: { 'x-auth-token': token } });
        setExams(res.data);
    } catch (err) { console.error(err); }
  };

  // --- ROW MANAGEMENT ---
  const addRow = () => {
      setScheduleRows([...scheduleRows, { subject: '', date: '', startTime: '', duration: '' }]);
  };

  const removeRow = (index) => {
      const list = [...scheduleRows];
      list.splice(index, 1);
      setScheduleRows(list);
  };

  const handleRowChange = (index, field, value) => {
      const list = [...scheduleRows];
      list[index][field] = value;
      setScheduleRows(list);
  };

  // --- SUBMIT ---
  const handlePublish = async () => {
      if(!title) return toast.error("Exam Title is required");
      
      // Validation: Ensure no empty rows
      const isValid = scheduleRows.every(row => row.subject && row.date && row.startTime);
      if(!isValid) return toast.error("Please fill all subject details");

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.post('/exams/create', {
              title, standard, board, schedule: scheduleRows
          }, { headers: { 'x-auth-token': token } });

          toast.success("Exam Published Successfully!");
          setShowModal(false);
          fetchExams();
          // Reset Form
          setTitle('');
          setScheduleRows([{ subject: '', date: '', startTime: '', duration: '' }]);
      } catch (err) {
          toast.error("Failed to publish exam");
      } finally {
          setLoading(false);
      }
  };

  const deleteExam = async (id) => {
      if(!window.confirm("Delete this exam schedule?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/exams/${id}`, { headers: { 'x-auth-token': token } });
          setExams(exams.filter(e => e._id !== id));
          toast.success("Deleted");
      } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-4">
               <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
               <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiAward className="text-purple-600" /> Exam Management
               </h1>
           </div>
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md">
               <FiPlus /> Schedule Exam
           </button>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
            {/* Exam List */}
            <div className="grid gap-6">
                {exams.map(exam => (
                    <div key={exam._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">{exam.standard}</span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{exam.board}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteExam(exam._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><FiTrash2/></button>
                        </div>

                        {/* Schedule Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="p-3">Subject</th>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Time</th>
                                        <th className="p-3">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.schedule.map((paper, idx) => (
                                        <tr key={idx} className="border-t border-gray-50">
                                            <td className="p-3 font-bold text-gray-700">{paper.subject}</td>
                                            <td className="p-3">{new Date(paper.date).toLocaleDateString()}</td>
                                            <td className="p-3">{paper.startTime}</td>
                                            <td className="p-3">{paper.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </main>

        {/* --- CREATE EXAM MODAL --- */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold text-xl text-gray-800">Create New Exam Schedule</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                        {/* Header Details */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Exam Title</label>
                                <input type="text" placeholder="e.g. Mid-Term 2026" className="w-full p-3 rounded-xl border font-bold outline-none focus:border-purple-500"
                                    value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Standard</label>
                                <select className="w-full p-3 rounded-xl border font-bold bg-white"
                                    value={standard} onChange={e => setStandard(e.target.value)}>
                                    {['8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Board</label>
                                <select className="w-full p-3 rounded-xl border font-bold bg-white"
                                    value={board} onChange={e => setBoard(e.target.value)}>
                                    {['CBSE','SSC'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Dynamic Rows */}
                        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FiCalendar/> Exam Papers</h4>
                        <div className="space-y-3">
                            {scheduleRows.map((row, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-400 mb-1 block">Subject Name</label>
                                        <input type="text" placeholder="Physics" className="w-full p-2 rounded-lg border outline-none"
                                            value={row.subject} onChange={e => handleRowChange(index, 'subject', e.target.value)} />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <label className="text-xs font-bold text-gray-400 mb-1 block">Date</label>
                                        <input type="date" className="w-full p-2 rounded-lg border outline-none"
                                            value={row.date} onChange={e => handleRowChange(index, 'date', e.target.value)} />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="text-xs font-bold text-gray-400 mb-1 block">Start Time</label>
                                        <input type="time" className="w-full p-2 rounded-lg border outline-none"
                                            value={row.startTime} onChange={e => handleRowChange(index, 'startTime', e.target.value)} />
                                    </div>
                                    <div className="w-full md:w-32">
                                        <label className="text-xs font-bold text-gray-400 mb-1 block">Duration</label>
                                        <input type="text" placeholder="2 Hrs" className="w-full p-2 rounded-lg border outline-none"
                                            value={row.duration} onChange={e => handleRowChange(index, 'duration', e.target.value)} />
                                    </div>
                                    <button onClick={() => removeRow(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2/></button>
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={addRow} className="mt-4 text-purple-600 font-bold text-sm hover:underline flex items-center gap-1">
                            <FiPlus /> Add Another Subject
                        </button>
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex justify-end">
                        <button onClick={handlePublish} disabled={loading} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition">
                            {loading ? 'Publishing...' : 'Publish Schedule'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminExamPage;