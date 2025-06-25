// 主题配置文件 - 现代渐变风 + 玻璃质感

// 明亮主题 - 现代渐变风
const lightTheme = {
  colors: {
    // 主要品牌色 - 渐变蓝紫
    primary: '#6366f1',
    primaryLight: '#8b5cf6',
    primaryDark: '#4f46e5',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    
    // 次要色 - 青蓝渐变
    secondary: '#06b6d4',
    secondaryLight: '#0891b2',
    secondaryDark: '#0e7490',
    secondaryGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    
    // 状态色 - 柔和版本
    success: '#10b981',
    successGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: '#f59e0b',
    warningGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: '#ef4444',
    errorGradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    
    // 背景色系 - 玻璃质感
    background: '#fafafb',
    backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    surface: 'rgba(255, 255, 255, 0.8)',
    surfaceGlass: 'rgba(255, 255, 255, 0.25)',
    surfaceHover: 'rgba(255, 255, 255, 0.9)',
    
    // 文字色系 - 高对比度
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    // 边框和分割线 - 透明度
    border: 'rgba(148, 163, 184, 0.2)',
    borderHover: 'rgba(148, 163, 184, 0.3)',
    divider: 'rgba(148, 163, 184, 0.15)',
    
    // 玻璃质感专用色
    glass: {
      backdrop: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      highlight: 'rgba(255, 255, 255, 0.6)'
    },
    
    // 智能体角色色彩 - 渐变版本
    roles: {
      '主持人': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      '战略分析师': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      '技术专家': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      '市场顾问': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      '风险评估师': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      '创新顾问': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      '数据分析师': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      '协调者': 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
      '系统': 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
    },
    
    // 账号级别颜色
    accountTiers: {
      free: '#2E8B57', // 绿色
      standard: '#4682B4', // 蓝色
      premium: '#FFD700', // 金色
      enterprise: '#9370DB' // 紫色
    },
    
    // 模型访问权限颜色
    modelAccess: {
      available: '#4caf50', // 绿色
      unavailable: '#ff6b6b' // 红色
    },
    

  },
  
  // 玻璃质感效果
  glass: {
    backdrop: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.25)'
  },
  
  // 阴影系统 - 多层次
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)'
  },
  
  // 间距系统
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      sans: "'Inter', 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace"
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'   // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  }
};

// 暗色主题 - 深邃玻璃风
const darkTheme = {
  colors: {
    // 主要品牌色 - 更亮的渐变
    primary: '#7c3aed',
    primaryLight: '#a855f7',
    primaryDark: '#6d28d9',
    primaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    
    // 次要色
    secondary: '#0ea5e9',
    secondaryLight: '#38bdf8',
    secondaryDark: '#0284c7',
    secondaryGradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    
    // 状态色
    success: '#22c55e',
    successGradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    warning: '#f97316',
    warningGradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    error: '#f43f5e',
    errorGradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
    
    // 背景色系 - 深色玻璃
    background: '#0f172a',
    backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    surface: 'rgba(30, 41, 59, 0.8)',
    surfaceGlass: 'rgba(30, 41, 59, 0.4)',
    surfaceHover: 'rgba(30, 41, 59, 0.9)',
    
    // 文字色系
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#1e293b',
    
    // 边框和分割线
    border: 'rgba(203, 213, 225, 0.2)',
    borderHover: 'rgba(203, 213, 225, 0.3)',
    divider: 'rgba(203, 213, 225, 0.1)',
    
    // 玻璃质感专用色
    glass: {
      backdrop: 'rgba(30, 41, 59, 0.2)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      highlight: 'rgba(255, 255, 255, 0.1)'
    },
    
    // 智能体角色色彩 - 暗色渐变版本
    roles: {
      '主持人': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      '战略分析师': 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
      '技术专家': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
      '市场顾问': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
      '风险评估师': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
      '创新顾问': 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
      '数据分析师': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      '协调者': 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)',
      '系统': 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)'
    },
    
    // 账号级别颜色 - 暗色模式下调亮
    accountTiers: {
      free: '#3EA76A', // 绿色
      standard: '#5A9FD6', // 蓝色
      premium: '#FFE44D', // 金色
      enterprise: '#B28AFF' // 紫色
    },
    
    // 模型访问权限颜色 - 暗色模式下调亮
    modelAccess: {
      available: '#5CCA60', // 绿色
      unavailable: '#FF8080' // 红色
    },
    

  },
  
  // 暗色玻璃质感
  glass: {
    backdrop: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    background: 'rgba(30, 41, 59, 0.4)'
  },
  
  // 暗色阴影
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(124, 58, 237, 0.4)'
  },
  
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography
};

/**
 * 获取当前主题模式
 * @returns {string} - 'light' 或 'dark'
 */
export const getThemeMode = () => {
  // 从localStorage获取用户设置
  const savedTheme = localStorage.getItem('theme_mode');
  if (savedTheme) {
    return savedTheme;
  }
  
  // 如果没有保存的设置，根据系统偏好设置
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // 默认使用明亮主题
  return 'light';
};

/**
 * 设置主题模式
 * @param {string} mode - 'light' 或 'dark'
 */
export const setThemeMode = (mode) => {
  localStorage.setItem('theme_mode', mode);
  
  // 更新文档根元素的data-theme属性
  document.documentElement.setAttribute('data-theme', mode);
  
  // 添加/移除暗色模式的CSS类
  if (mode === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // 更新CSS变量
  updateCssVariables(mode === 'dark' ? darkTheme : lightTheme);
};

/**
 * 更新CSS变量
 * @param {Object} theme - 主题对象
 */
const updateCssVariables = (theme) => {
  const root = document.documentElement;
  
  // 基础颜色
  root.style.setProperty('--primary-color', theme.colors.primary);
  root.style.setProperty('--secondary-color', theme.colors.secondary);
  root.style.setProperty('--error-color', theme.colors.error);
  root.style.setProperty('--warning-color', theme.colors.warning);
  root.style.setProperty('--success-color', theme.colors.success);
  root.style.setProperty('--background-color', theme.colors.background);
  root.style.setProperty('--surface-color', theme.colors.surface);
  root.style.setProperty('--text-color', theme.colors.text);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--border-color', theme.colors.border);
  root.style.setProperty('--divider-color', theme.colors.divider);
  root.style.setProperty('--disabled-color', theme.colors.disabled);
  
  // 主题颜色变体
  root.style.setProperty('--primary-light', theme.colors.primaryLight);
  root.style.setProperty('--primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--secondary-light', theme.colors.secondaryLight);
  root.style.setProperty('--secondary-dark', theme.colors.secondaryDark);
  
  // 账号级别颜色
  root.style.setProperty('--account-free', theme.colors.accountTiers.free);
  root.style.setProperty('--account-standard', theme.colors.accountTiers.standard);
  root.style.setProperty('--account-premium', theme.colors.accountTiers.premium);
  root.style.setProperty('--account-enterprise', theme.colors.accountTiers.enterprise);
  
  // 模型访问权限颜色
  root.style.setProperty('--model-available', theme.colors.modelAccess.available);
  root.style.setProperty('--model-unavailable', theme.colors.modelAccess.unavailable);
  
  // 卡片和输入框背景
  root.style.setProperty('--card-bg', theme.colors.surface);
  root.style.setProperty('--input-bg', theme.colors.background);
  
  // 阴影
  root.style.setProperty('--shadow-sm', theme.shadows.small);
  root.style.setProperty('--shadow-md', theme.shadows.medium);
  root.style.setProperty('--shadow-lg', theme.shadows.large);
};

// 导出当前主题
export const theme = getThemeMode() === 'dark' ? darkTheme : lightTheme;

// 导出所有主题
export const themes = {
  light: lightTheme,
  dark: darkTheme
};

// 初始化主题
export const initTheme = () => {
  const mode = getThemeMode();
  setThemeMode(mode);
};