import React, { useState } from 'react';
import api from '../../api';
import { 
  FiSearch, FiHelpCircle, FiSettings, FiBook, FiDollarSign, 
  FiMail, FiMessageSquare, FiCheckCircle, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null); // 'loading', 'success', 'error'
  
  // Ticket Form State
  const [formData, setFormData] = useState({
      category: 'Technical Support',
      subject: '',
      message: ''
  });

  // --- 1. DATA: FAQs ---
  const faqs = [
      { q: "How do I download my fee receipt?", a: "Go to the 'Fee Details' section in your dashboard. Click on any 'Paid' installment card to open the details popup, then click the 'Download Receipt' button." },
      { q: "Where can I find the exam timetable?", a: "The exam schedule is available under the 'Timetable' quick link. If it's not visible, the admin may not have uploaded it yet." },
      { q: "How do I submit an assignment?", a: "Navigate to 'Assignments', select your subject, and click on the specific assignment. You will see an upload button if the submission window is open." },
      { q: "My profile information is incorrect.", a: "Please contact the administration office directly or submit a ticket below with the category 'Account Issue' to request a change." },
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(f => 
      f.q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 2. HANDLERS ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      setTicketStatus('loading');
      try {
          const token = localStorage.getItem('token');
          await api.post('/support', formData, { headers: { 'x-auth-token': token } });
          setTicketStatus('success');
          setFormData({ category: 'Technical Support', subject: '', message: '' });
      } catch (error) {
          setTicketStatus('error');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-16 text-center text-white">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">How can we help you?</h1>
          <p className="mb-8 text-gray-300">Search for answers or browse topics below.</p>
          
          <div className="mx-auto flex max-w-2xl items-center overflow-hidden rounded-full bg-white p-2 shadow-lg">
              <FiSearch className="ml-4 text-gray-400" size={24} />
              <input 
                  type="text" 
                  placeholder="Search for help (e.g. 'fees', 'exam')..."
                  className="w-full border-none px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 -mt-10">
          
          {/* --- TOPIC CARDS --- */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
              {[
                  { title: "Technical Support", icon: FiSettings, color: "text-blue-500 bg-blue-50" },
                  { title: "Academic & Exams", icon: FiBook, color: "text-purple-500 bg-purple-50" },
                  { title: "Fees & Account", icon: FiDollarSign, color: "text-green-500 bg-green-50" },
              ].map((topic, i) => (
                  <div key={i} className="rounded-2xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer text-center">
                      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${topic.color}`}>
                          <topic.icon size={28} />
                      </div>
                      <h3 className="font-bold text-gray-800">{topic.title}</h3>
                  </div>
              ))}
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
              
              {/* --- LEFT: FAQs --- */}
              <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                      {filteredFaqs.length > 0 ? (
                          filteredFaqs.map((faq, index) => (
                              <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300">
                                  <button 
                                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                      className="flex w-full items-center justify-between p-5 text-left font-semibold text-gray-700 hover:bg-gray-50"
                                  >
                                      {faq.q}
                                      {activeFaq === index ? <FiChevronUp /> : <FiChevronDown />}
                                  </button>
                                  {activeFaq === index && (
                                      <div className="bg-gray-50 px-5 pb-5 pt-0 text-gray-600">
                                          <p className="pt-2 border-t border-gray-100">{faq.a}</p>
                                      </div>
                                  )}
                              </div>
                          ))
                      ) : (
                          <p className="text-gray-500">No matching help articles found.</p>
                      )}
                  </div>

                  {/* Quick Contact Info */}
                  <div className="mt-8 rounded-xl bg-blue-50 p-6 border border-blue-100">
                      <h3 className="flex items-center gap-2 font-bold text-blue-800">
                          <FiMail /> Direct Support
                      </h3>
                      <p className="mt-2 text-sm text-blue-600">
                          Need urgent help? Email us directly at <span className="font-bold underline">support@cerrebro.com</span>.
                          <br />Response time: ~24 Hours.
                      </p>
                  </div>
              </div>

              {/* --- RIGHT: TICKET FORM --- */}
              <div>
                  <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
                      <h2 className="mb-2 text-2xl font-bold text-gray-800">Still need help?</h2>
                      <p className="mb-6 text-gray-500">Submit a support ticket and we will get back to you.</p>

                      {ticketStatus === 'success' ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                              <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600">
                                  <FiCheckCircle size={40} />
                              </div>
                              <h3 className="text-xl font-bold text-gray-800">Ticket Submitted!</h3>
                              <p className="mt-2 text-gray-500">We have received your request. Check your email for updates.</p>
                              <button 
                                  onClick={() => setTicketStatus(null)}
                                  className="mt-6 text-primary font-bold hover:underline"
                              >
                                  Submit another ticket
                              </button>
                          </div>
                      ) : (
                          <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                  <label className="mb-1 block text-sm font-bold text-gray-700">Topic</label>
                                  <select 
                                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:ring-primary"
                                      value={formData.category}
                                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                                  >
                                      <option>Technical Support</option>
                                      <option>Fees & Billing</option>
                                      <option>Academic Issue</option>
                                      <option>Account Access</option>
                                  </select>
                              </div>
                              
                              <div>
                                  <label className="mb-1 block text-sm font-bold text-gray-700">Subject</label>
                                  <input 
                                      type="text" 
                                      required
                                      placeholder="Briefly describe the issue..."
                                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:ring-primary"
                                      value={formData.subject}
                                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                  />
                              </div>

                              <div>
                                  <label className="mb-1 block text-sm font-bold text-gray-700">Message</label>
                                  <textarea 
                                      required
                                      rows="4"
                                      placeholder="Provide more details..."
                                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:ring-primary"
                                      value={formData.message}
                                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                                  ></textarea>
                              </div>

                              <button 
                                  type="submit" 
                                  disabled={ticketStatus === 'loading'}
                                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:bg-gray-800"
                              >
                                  {ticketStatus === 'loading' ? 'Submitting...' : <><FiMessageSquare /> Submit Ticket</>}
                              </button>
                          </form>
                      )}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default SupportPage;