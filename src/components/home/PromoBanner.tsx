interface PromoBannerProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  gradient: string;
  image?: string;
  onButtonClick?: () => void;
  className?: string;
}

const PromoBanner = ({
  title,
  subtitle,
  buttonText = "Ver ofertas",
  gradient,
  image,
  onButtonClick,
  className = ""
}: PromoBannerProps) => {
  return (
    <div className={`${gradient} h-32 rounded-xl flex items-center justify-between px-6 text-white ${className}`}>
      <div className="flex-1 pr-4">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90 mb-2">{subtitle}</p>
        <button 
          className="bg-white text-black px-3 py-1 rounded-full font-medium hover:bg-gray-100 text-xs"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      </div>
      {image && (
        <div className="w-24 h-24">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PromoBanner;