import { Utensils, Leaf } from "lucide-react";

const Logo = ({ isVeganMode }) => {
  return (
    <div className="logo-link" >     
      
      <h1 className="logo-text">
        Hi refrigerator! 
        {isVeganMode && (
          <Leaf size={24} strokeWidth={2.5} stroke="green" className="leaf-icon"/>
      )}
      </h1>      
    </div>
  );
};

export default Logo;