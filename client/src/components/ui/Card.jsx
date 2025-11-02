export function Card({ className = "", children }) {
    return <div className={`card p-5 ${className}`}>{children}</div>;
  }
  
  export function CardHeader({ className = "", children }) {
    return <div className={`mb-3 ${className}`}>{children}</div>;
  }
  
  export function CardTitle({ className = "", children }) {
    return <h3 className={`text-lg font-semibold leading-tight ${className}`}>{children}</h3>;
  }
  
  export function CardContent({ className = "", children }) {
    return <div className={className}>{children}</div>;
  }
  
  export function CardFooter({ className = "", children }) {
    return <div className={`mt-4 pt-3 border-t border-black/10 dark:border-white/10 ${className}`}>{children}</div>;
  }
  