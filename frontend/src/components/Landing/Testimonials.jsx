import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import { FiUser } from 'react-icons/fi';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.get('/public/testimonials').then(res => setReviews(res.data)).catch(() => {}); }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-sm font-bold text-[#6FCB6C] tracking-widest uppercase mb-2">Voices</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#1E293B]">Success Stories</h3>
        </motion.div>

        <div className="flex overflow-x-auto gap-6 pb-10 snap-x custom-scrollbar">
            {reviews.map((review, i) => (
                <motion.div key={review._id || i} initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="min-w-[300px] md:min-w-[400px] snap-center bg-[#F8FAFC] p-8 rounded-3xl border border-slate-100 shadow-sm"
                >
                    <p className="text-slate-600 italic mb-6">"{review.text}"</p>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-white border-2 border-[#6FCB6C] shadow-sm flex items-center justify-center">
                            {review.profilePic ? <img src={review.profilePic} className="h-full w-full object-cover" /> : <FiUser className="text-slate-400"/>}
                        </div>
                        <div>
                            <h4 className="font-bold text-[#1E293B]">{review.name}</h4>
                            <p className="text-xs text-[#6FCB6C] font-bold">{review.role}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;