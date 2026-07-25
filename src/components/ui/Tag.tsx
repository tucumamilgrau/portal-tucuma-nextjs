type Props = {
  children: React.ReactNode;
  color?: "primary" | "alert" | "highlight" | "support" | "outline" | "green";
  className?: string;
};

const colorClass: Record<string, string> = {
  primary: "bg-primary text-white",
  alert: "bg-alert text-white",
  highlight: "bg-highlight text-white",
  support: "bg-support text-white",
  green: "bg-green-600 text-white",
  outline: "bg-transparent border-[1.5px] border-primary text-primary",
};

export default function Tag({ children, color = "primary", className = "" }: Props) {
  return (
    <span
      className={`inline-block font-menu font-bold text-[0.68rem] tracking-wide uppercase text-white px-2.5 py-1 rounded ${colorClass[color]} ${className}`}
    >
      {children}
    </span>
  );
}
