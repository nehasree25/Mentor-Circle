import { motion } from "framer-motion";

const stats = [
  { value: "12,000+", label: "Learners & Mentors" },
  { value: "240+", label: "Active Circles" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "4.9★", label: "Average Rating" },
];

const Stats = () => {
  return (
    <section className="border-y border-[#E2E8F0] bg-white py-14">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-[2rem] md:text-[2.5rem] font-extrabold text-[#0F172A] tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-[13px] text-[#64748B] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
