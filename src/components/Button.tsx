import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost";

type Size = "sm" | "md" | "lg";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    gap-2

    font-medium

    rounded-2xl

    transition-all
    duration-300

    focus:outline-none
    focus:ring-2
    focus:ring-offset-2

    backdrop-blur-md
  `;

  const variants: Record<Variant, string> = {
    primary: `
      bg-gradient-to-r
      from-indigo-500
      to-purple-500

      text-white

      shadow-lg
      shadow-indigo-500/25

      hover:shadow-xl
      hover:shadow-purple-500/30

      focus:ring-indigo-400
    `,

    secondary: `
      bg-white/70
      text-gray-800

      border border-white/20

      hover:bg-white

      shadow-md

      focus:ring-gray-400
    `,

    danger: `
      bg-gradient-to-r
      from-red-500
      to-rose-500

      text-white

      shadow-lg
      shadow-red-500/25

      hover:shadow-xl

      focus:ring-red-400
    `,

    outline: `
      border border-gray-300
      bg-white/50

      text-gray-700

      hover:bg-gray-50

      focus:ring-gray-400
    `,

    ghost: `
      text-gray-700

      hover:bg-gray-100/80

      focus:ring-gray-400
    `,
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const disabledStyles =
    disabled || loading ? "opacity-50 cursor-not-allowed" : "";

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileTap={{
        scale: disabled || loading ? 1 : 0.96,
      }}
      whileHover={{
        scale: disabled || loading ? 1 : 1.03,
        y: disabled || loading ? 0 : -2,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
      }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        ${widthStyles}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          className="
            w-4
            h-4

            border-2
            border-white
            border-t-transparent

            rounded-full
          "
        />
      )}

      {!loading && leftIcon}

      {children}

      {!loading && rightIcon}
    </motion.button>
  );
};

export default Button;