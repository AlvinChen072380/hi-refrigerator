import { Utensils } from "lucide-react";

const Logo = () => {
  return (
    <a 
      href="/" 
      className="decoration-none" 
    >
      <div className="h1">
        <Utensils size={24} strokeWidth={2.5} stroke="green" />
      </div>
      
      <h1 className="h1">
        Hi refrigerator!
      </h1>
    </a>
  );
};

export default Logo;