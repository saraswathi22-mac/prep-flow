import { motion } from "framer-motion";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface DatePickerProps {
  selectedDate: string;
  max: string;
  onChange: (date: string) => void;
} 

const DatePicker = ({ selectedDate, max, onChange }: DatePickerProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="
        mt-6 sm:mt-0
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-center
      "
    >
      {/* 🔷 Label */}
      <motion.label
        whileHover={{
          scale: 1.03,
        }}
        className="
          text-sm
          font-medium
          text-gray-700
        "
      >
        Select Date
      </motion.label>

      {/* 🔷 Input Wrapper */}
      <motion.div
        whileHover={{
          y: -2,
          scale: 1.01,
        }}
        whileTap={{
          scale: 0.98,
        }}
        transition={{
          duration: 0.2,
        }}
        className="relative"
      >
        <motion.input
          type="date"
          value={selectedDate}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          whileFocus={{
            scale: 1.01,
          }}
          className="
            w-full
            sm:w-auto
            appearance-none
            rounded-2xl
            border border-white/30
            bg-gradient-to-br
            from-white
            via-blue-50
            to-purple-50
            pl-4
            pr-10
            py-2.5
            text-sm
            text-gray-700
            backdrop-blur-xl
            shadow-[0_8px_30px_rgba(59,130,246,0.10)]
            transition-all
            duration-300
            focus:border-blue-300
            focus:outline-none
            focus:ring-4
            focus:ring-blue-200/50
            hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)]
          "
        />

        <CalendarMonthIcon
          fontSize="small"
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-gray-500
          "
        />
      </motion.div>
    </motion.div>
  );
};

export default DatePicker;
