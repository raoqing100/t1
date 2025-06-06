import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/NavBar.css';

/**
 * 导航栏组件
 * @param {Object} props - 组件属性
 * @param {Function} props.toggleTheme - 切换主题函数
 * @param {boolean} props.isDarkMode - 是否为暗色模式
 * @returns {JSX.Element} - 渲染的组件
 */
const NavBar = ({ toggleTheme, isDarkMode }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">AI多智能体聊天</Link>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          首页
        </NavLink>
        <NavLink to="/config" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          配置智能体
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          聊天室
        </NavLink>
        <NavLink to="/account" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          账号设置
        </NavLink>
      </div>
      
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-button">
          {isDarkMode ? '🌞 亮色模式' : '🌙 暗色模式'}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;