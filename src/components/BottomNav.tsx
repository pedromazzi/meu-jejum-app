import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Droplet, BarChart2, Trophy, BookOpen } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { path: '/jejum', icon: Home, label: 'Jejum' },
    { path: '/agua', icon: Droplet, label: 'Água' },
    { path: '/progresso', icon: BarChart2, label: 'Progresso' },
    { path: '/conquistas', icon: Trophy, label: 'Conquistas' },
    { path: '/aprender', icon: BookOpen, label: 'Aprender' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={24} />
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;