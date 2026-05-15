import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = ({ name, size = 24, color = '#000' }) => {
  // Map custom names to Material Icons
  const iconMap = {
    profile: 'account-circle',
    user: 'person',
    logout: 'logout',
    'alert-circle': 'error-outline',
    'information-circle': 'info',
    'location-outline': 'location-on',
  };

  const iconName = iconMap[name] || name;

  return (
    <MaterialIcons name={iconName} size={size} color={color} />
  );
};

export default Icon;
