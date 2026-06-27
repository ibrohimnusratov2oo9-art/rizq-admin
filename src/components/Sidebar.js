import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ShoppingBag, Package } from 'lucide-react';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>RIZQ</h1>
        <p>Admin Panel</p>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/users" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Пользователи
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/sellers" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Store size={20} />
            Рестораны
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/orders" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            Заказы
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/products" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            Товары
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;