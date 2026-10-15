import xopyLogo from "@/assets/xopy-logo.png";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={xopyLogo} alt="Xopy" className="h-9 w-28 sm:w-32 object-contain rounded-lg bg-white px-1" />
    </div>
  );
};

export default Logo;