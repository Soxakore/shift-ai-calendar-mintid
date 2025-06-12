import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardSpotlight = ({ className, children, ...props }: CardSpotlightProps) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-[1px]",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-blue-500/20 before:via-purple-500/20 before:to-pink-500/20 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        "after:absolute after:inset-[1px] after:rounded-xl after:bg-slate-900",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <div className="relative z-10 h-full rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
};
