import { Menu, X } from 'lucide-react';

const HamburgerToggle = ({ isOpen, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-lg"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
};

export default HamburgerToggle;