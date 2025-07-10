import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  UserPlus, 
  Stethoscope, 
  Heart, 
  Pill, 
  Shield,
  Activity
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    {
      path: '/registration',
      label: 'Registration',
      icon: UserPlus,
      description: 'Register new patients'
    },
    {
      path: '/nurse',
      label: 'Nurse',
      icon: Heart,
      description: 'Initial assessment'
    },
    {
      path: '/doctor',
      label: 'Doctor',
      icon: Stethoscope,
      description: 'Diagnosis & treatment'
    },
    {
      path: '/pharmacist',
      label: 'Pharmacist',
      icon: Pill,
      description: 'Medication management'
    },
    {
      path: '/admin',
      label: 'Admin',
      icon: Shield,
      description: 'System overview'
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">MedFlow System</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;