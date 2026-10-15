import { Toaster as Sonner, toast } from 'sonner';
import { CircleCheck, CircleX, Info, TriangleAlert, LoaderCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
type ToasterProps = React.ComponentProps<typeof Sonner>;
const Toaster = (props: ToasterProps) => {
 const { isDarkMode } = useTheme();
 return <Sonner {...props} theme={isDarkMode ? 'dark' : 'light'} className="xopy-feedback" position="top-right" closeButton duration={4000} containerAriaLabel="Avisos do sistema" visibleToasts={3} gap={12} offset={20} mobileOffset={16}
  icons={{ success: <CircleCheck size={21} />, error: <CircleX size={21} />, warning: <TriangleAlert size={21} />, info: <Info size={21} />, loading: <LoaderCircle size={21} className="animate-spin" /> }}
  toastOptions={{ className: 'xopy-toast', duration: 4000 }} />;
};
export { Toaster, toast };
