import { motion, type HTMLMotionProps } from "framer-motion";
import type { ChangeEventHandler, ReactNode } from "react";

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  inputProps?: HTMLMotionProps<"input">;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const TextField = ({
  label,
  value,
  onChange,
  inputProps = {},
  error,
  helperText,
  fullWidth = true,
  leftIcon,
  rightIcon,
}: TextFieldProps) => {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`
        flex
        flex-col
        gap-1.5

        ${fullWidth ? "w-full" : ""}
      `}
    >
      {/* 🔷 Label */}
      {label && (
        <motion.label
          layout
          className="
            text-sm
  font-medium
  text-gray-700
          "
        >
          {label}
        </motion.label>
      )}

      {/* 🔷 Input Wrapper */}
      <motion.div
        whileHover={{
          y: -1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="relative"
      >
        {/* Left Icon */}
        {leftIcon && (
          <motion.span
            animate={{
              opacity: 1,
            }}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2

              text-gray-400
              text-sm
            "
          >
            {leftIcon}
          </motion.span>
        )}

        {/* Input */}
        <motion.input
          value={value}
          onChange={onChange}
          {...inputProps}
          whileFocus={{
            scale: 1.01,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          className={`
            w-full

            rounded-2xl

            border

            bg-white/80
            backdrop-blur-xl

            text-sm
            text-gray-800

            transition-all
            duration-300

            outline-none

            shadow-[0_6px_25px_rgba(0,0,0,0.05)]

            placeholder:text-gray-400

            ${leftIcon ? "pl-10" : "pl-4"}

            ${rightIcon ? "pr-10" : "pr-4"}

            py-3

            ${
              error
                ? `
                  border-red-300

                  focus:border-red-400
                  focus:ring-red-100
                `
                : `
                  border-white/30

                  hover:border-indigo-200

                  focus:border-indigo-400
                  focus:ring-indigo-100
                `
            }

            focus:ring-4

            disabled:bg-gray-100
            disabled:cursor-not-allowed
          `}
        />

        {/* Right Icon */}
        {rightIcon && (
          <motion.span
            animate={{
              opacity: 1,
            }}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2

              text-gray-400
              text-sm
            "
          >
            {rightIcon}
          </motion.span>
        )}
      </motion.div>

      {/* 🔷 Helper / Error */}
      {(helperText || error) && (
        <motion.p
          initial={{
            opacity: 0,
            y: -3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className={`
            text-xs

            ${error ? "text-red-500" : "text-gray-500"}
          `}
        >
          {error || helperText}
        </motion.p>
      )}
    </motion.div>
  );
};

export default TextField;
