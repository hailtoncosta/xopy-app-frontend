interface NewsBannerProps {
  image: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}

const NewsBanner = ({ image, alt, onClick, className = "" }: NewsBannerProps) => {
  return (
    <section className={`py-4 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-lg overflow-hidden shadow-sm">
          <div className="relative h-20 md:h-24">
            <img 
              src={image} 
              alt={alt} 
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" 
              onClick={onClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsBanner;