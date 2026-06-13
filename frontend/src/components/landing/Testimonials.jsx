import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Anika Sharma",
    role: "Software Engineer @ Razorpay",
    avatar: "AS",
    bg: "bg-blue-500",
    quote:
      "MentorCircle completely changed how I approach learning. The structured circles and real mentor guidance helped me land my first SWE role in 6 months.",
    stars: 5,
  },
  {
    name: "Rohan Mehta",
    role: "ML Engineer @ Swiggy",
    avatar: "RM",
    bg: "bg-violet-500",
    quote:
      "The ML Circle gave me hands-on projects and mentors who actually work in the field. Far more valuable than any online course I've paid for.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Data Analyst @ Flipkart",
    avatar: "PN",
    bg: "bg-emerald-500",
    quote:
      "I was stuck transitioning into data science for years. Within 3 months of joining, I had a portfolio, peer support, and a mentor who got me interviews.",
    stars: 5,
  },
  {
    name: "Dev Patel",
    role: "Full-Stack Developer",
    avatar: "DP",
    bg: "bg-amber-500",
    quote:
      "The peer learning environment is unmatched. Everyone is motivated, the discussions are real, and the mentors treat you like a professional.",
    stars: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Product Manager @ Zomato",
    avatar: "SR",
    bg: "bg-rose-500",
    quote:
      "I joined as a mentor and it's been one of the most fulfilling experiences of my career. The platform makes it easy to give back meaningfully.",
    stars: 5,
  },
  {
    name: "Kiran Joshi",
    role: "Frontend Developer @ CRED",
    avatar: "KJ",
    bg: "bg-cyan-500",
    quote:
      "Honestly, the community here is what sets MentorCircle apart. I've made genuine connections that go beyond just 'networking'.",
    stars: 5,
  },
];

const TestimonialCard = ({ t, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay, ease: "easeOut" }}
    className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    {/* Stars */}
    <div className="flex gap-0.5 mb-4">
      {[...Array(t.stars)].map((_, i) => (
        <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
      ))}
    </div>

    {/* Quote */}
    <p className="text-[14px] text-[#334155] leading-relaxed mb-5">
      "{t.quote}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
      <div
        className={`w-9 h-9 rounded-full ${t.bg} flex items-center justify-center text-[12px] font-bold text-white shrink-0`}
      >
        {t.avatar}
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[#0F172A]">{t.name}</div>
        <div className="text-[11.5px] text-[#64748B]">{t.role}</div>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-[12px] font-semibold mb-5"
          >
            <Star size={12} className="fill-amber-500 text-amber-500" />
            Real stories from real members
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4"
          >
            Loved by learners and mentors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[#64748B] max-w-xl mx-auto text-[15px]"
          >
            From career pivots to skill mastery — here's what our community says.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
