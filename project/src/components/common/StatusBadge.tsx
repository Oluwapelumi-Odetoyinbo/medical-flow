import React from 'react';
import { Clock, UserCheck, Stethoscope, Pill, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'registered' | 'awaiting_doctor' | 'awaiting_medication' | 'completed';
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'registered':
        return {
          label: 'Registered',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: UserCheck,
        };
      case 'awaiting_doctor':
        return {
          label: 'Awaiting Doctor',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case 'awaiting_medication':
        return {
          label: 'Awaiting Medication',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Pill,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;