/**
 * 共享工具库 - 提供日志处理的通用函数
 * 
 * @module shared
 * @exports {Function} generateResultFileName
 * @exports {Function} getCurrentTimestamp
 */

// 输出文件名后缀
const RESULT_FILE_SUFFIX = 'result';

/**
 * 格式化为两位数字字符串（不足前补0）
 * @param {number} num
 * @returns {string}
 */
const padToTwoDigits = (num) => String(num).padStart(2, '0');

/**
 * 从输入文件名生成输出文件名
 * @param {string} inputPath - 输入文件路径或名称
 * @param {boolean} [useCsv=false] - 是否使用 .csv 扩展名（默认 .txt）
 * @returns {string} 生成的输出文件名
 */
const generateResultFileName = (inputPath, useCsv = false) => {
  const dotIndex = inputPath.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? inputPath.substring(0, dotIndex) : inputPath;
  const extension = useCsv ? 'csv' : 'txt';
  return `${baseName}-${RESULT_FILE_SUFFIX}.${extension}`;
};

/**
 * 获取当前时间戳字符串
 * @returns {string} 格式化的时间戳（带标签）
 */
const getCurrentTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padToTwoDigits(now.getMonth() + 1);
  const day = padToTwoDigits(now.getDate());
  const hours = padToTwoDigits(now.getHours());
  const minutes = padToTwoDigits(now.getMinutes());
  const seconds = padToTwoDigits(now.getSeconds());
  return `append time: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}\n`;
};

module.exports = {
  generateResultFileName,
  getCurrentTimestamp,
};
