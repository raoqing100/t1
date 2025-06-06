import React, { useState, useEffect } from 'react';
import { getAvailableModels, canAccessModel } from '../services/api';
import '../styles/ModelSelector.css';

/**
 * 模型选择器组件
 * @param {Object} props - 组件属性
 * @param {string} props.apiKey - API密钥
 * @param {string} props.selectedModel - 当前选中的模型ID
 * @param {Function} props.onModelSelect - 模型选择回调函数
 * @returns {JSX.Element} - 渲染的组件
 */
const ModelSelector = ({ apiKey, selectedModel, onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canUseClaudeModels, setCanUseClaudeModels] = useState(false);
  
  // 获取可用模型列表
  useEffect(() => {
    const fetchModels = async () => {
      if (!apiKey) {
        setModels([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getAvailableModels(apiKey);
        if (response && response.data) {
          setModels(response.data);
          
          // 检查是否可以使用Claude 4
          const canAccessClaude4 = await canAccessModel(apiKey, 'claude-4');
          setCanUseClaudeModels(canAccessClaude4);
        } else {
          setModels([]);
        }
      } catch (err) {
        console.error('获取模型列表失败:', err);
        setError('获取模型列表失败，请检查API密钥是否正确');
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, [apiKey]);
  
  // 处理模型选择
  const handleModelChange = (e) => {
    const modelId = e.target.value;
    onModelSelect(modelId);
  };
  
  // 根据访问级别获取模型标签样式
  const getModelLabelStyle = (accessLevel) => {
    switch (accessLevel) {
      case 'premium':
        return { color: '#FFD700' }; // 金色
      case 'enterprise':
        return { color: '#9370DB' }; // 紫色
      case 'standard':
        return { color: '#4682B4' }; // 蓝色
      default:
        return { color: '#2E8B57' }; // 绿色
    }
  };
  
  return (
    <div className="model-selector">
      <h3>选择AI模型</h3>
      
      {loading ? (
        <p>加载模型列表中...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <select 
            value={selectedModel || ''} 
            onChange={handleModelChange}
            disabled={loading || models.length === 0}
          >
            <option value="">默认模型 (通义千问2.5-7B)</option>
            {models.map(model => (
              <option 
                key={model.id} 
                value={model.id}
                disabled={model.id.includes('claude-4') && !canUseClaudeModels}
              >
                {model.id} 
                {model.id.includes('claude-4') && !canUseClaudeModels ? ' (需要企业账户)' : ''}
              </option>
            ))}
          </select>
          
          {!canUseClaudeModels && (
            <div className="error-message">
              您的账号无法使用Claude 4模型，该模型仅限企业账户使用。
            </div>
          )}
          
          <div className="model-labels">
            <span className="model-label free">● 免费</span>
            <span className="model-label standard">● 标准</span>
            <span className="model-label premium">● 高级</span>
            <span className="model-label enterprise">● 企业</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector; 