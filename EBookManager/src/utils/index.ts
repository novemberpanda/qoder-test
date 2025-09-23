// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

// 生成UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

// 验证文件扩展名
export const isValidEBookFormat = (fileName: string): boolean => {
  const validExtensions = ['.epub', '.pdf', '.txt', '.mobi'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return validExtensions.includes(extension);
};

// 从文件路径提取文件名
export const extractFileName = (filePath: string): string => {
  return filePath.split('/').pop() || 'unknown';
};

// 从文件名提取扩展名
export const extractFileExtension = (fileName: string): string => {
  return fileName.toLowerCase().substring(fileName.lastIndexOf('.') + 1);
};

// 清理HTML标签
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 计算阅读时间估算
export const estimateReadingTime = (wordCount: number): string => {
  const wordsPerMinute = 200; // 平均阅读速度
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes < 60) {
    return `约 ${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `约 ${hours} 小时 ${remainingMinutes} 分钟`;
  }
};

// 验证书籍标题
export const validateBookTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= 200;
};

// 安全地解析JSON
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON解析失败:', error);
    return defaultValue;
  }
};

// 深度复制对象
export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepCopy(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepCopy((obj as any)[key]);
    });
    return copy;
  }
  
  return obj;
};