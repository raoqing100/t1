// 主题配置文件

// 明亮主题
const lightTheme = {
  colors: {
    primary: '#4A6FA5',
    secondary: '#47B881',
    error: '#D14343',
    warning: '#F7D154',
    success: '#47B881',
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    divider: '#eeeeee',
    disabled: '#cccccc',
    
    // 角色颜色
    roles: {
      '主持人': '#4A6FA5',
      '创意者': '#47B881',
      '批评者': '#D14343',
      '整合者': '#9F7AEA',
      '分析者': '#3182CE',
      '执行者': '#DD6B20',
      '协调者': '#38A169',
      '专家': '#805AD5',
      '记录者': '#718096',
      '系统': '#4A5568'
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
    
    // 主题颜色变体
    primaryLight: '#5B8AD9',
    primaryDark: '#3A5A84',
    secondaryLight: '#58D99E',
    secondaryDark: '#389A6A'
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 2px 6px rgba(0,0,0,0.15)',
    large: '0 4px 12px rgba(0,0,0,0.15)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  },
  typography: {
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  }
};

// 暗色主题
const darkTheme = {
  colors: {
    primary: '#5B8AD9',
    secondary: '#4CC38A',
    error: '#E05252',
    warning: '#F7D154',
    success: '#4CC38A',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    border: '#333333',
    divider: '#2A2A2A',
    disabled: '#555555',
    
    // 角色颜色 - 暗色模式下稍微调亮
    roles: {
      '主持人': '#5B8AD9',
      '创意者': '#4CC38A',
      '批评者': '#E05252',
      '整合者': '#B68BFF',
      '分析者': '#4A9EFF',
      '执行者': '#FF8B3E',
      '协调者': '#4BD889',
      '专家': '#9B7AE6',
      '记录者': '#8FA3B7',
      '系统': '#6B7280'
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
    
    // 主题颜色变体
    primaryLight: '#7AA3E9',
    primaryDark: '#4A6FA5',
    secondaryLight: '#6EDAA6',
    secondaryDark: '#3A9A6E'
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.3)',
    medium: '0 2px 6px rgba(0,0,0,0.4)',
    large: '0 4px 12px rgba(0,0,0,0.5)'
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