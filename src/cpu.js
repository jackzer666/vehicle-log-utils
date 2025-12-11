/**
 * CPU 日志处理器 - 从日志内容中提取 CPU 指标
 * 
 * 使用方式：node cpu.js <input-file> [output-file]
 * 
 * @module cpu
 * @exports {Function} processLogData
 * @exports {Function} appendResultsToFile
 * @exports {Function} processLogFile
 */

const fs = require('fs');
const path = require('path');
const { generateResultFileName, getCurrentTimestamp } = require('./shared');

const DEFAULT_CPU_COUNT = 20; // 默认取前 n 组数据
const CPU_MARKER_KEYWORD = '{page:';

/**
 * 从日志文本中提取 CPU 信息
 * @param {string} logContent 原始日志文本
 * @param {{ maxCount?: number, nextKeyword?: string }} [options]
 * @returns {string[]} 提取到的 cpu 字符串数组
 */
const extractCpuMetrics = (logContent = '', options = {}) => {
  const { maxCount = DEFAULT_CPU_COUNT, nextKeyword = CPU_MARKER_KEYWORD } = options;

  if (typeof logContent !== 'string' || logContent.trim() === '') return [];

  const lines = logContent.split('\n');
  const results = [];

  for (let idx = 0; idx < lines.length && results.length < maxCount; idx += 1) {
    const rawLine = lines[idx];
    if (!rawLine) continue;

    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.split(/\s+/).filter(Boolean);
    const nextIndex = parts.findIndex((p) => p.startsWith(nextKeyword));
    if (nextIndex > 0) {
      // 取 nextKeyword 前一个字段作为 cpu 信息（根据原实现）
      results.push(parts[nextIndex - 1]);
    }
  }

  return results;
};

/**
 * 将提取结果追加到指定文件（如果文件不存在则创建）
 * @param {string[]} results
 * @param {string} outputFile
 */
const appendResultsToFile = (results, outputFile) => {
  if (!Array.isArray(results) || results.length === 0) return;
  if (!outputFile || typeof outputFile !== 'string') throw new TypeError('outputFile 必须是字符串');

  try {
    const dir = path.dirname(outputFile);
    if (dir && dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let prefix = '';
    if (fs.existsSync(outputFile)) prefix = '\n\n';

    const timestamp = getCurrentTimestamp();
    const content = `${prefix}${timestamp}\n${results.join('\n')}\n`;

    fs.appendFileSync(outputFile, content, 'utf8');
    console.log(`结果已追加到文件: ${outputFile}`);
  } catch (err) {
    console.error('写入文件时出错:', err && err.message ? err.message : err);
  }
};

/**
 * 从文件读取日志并处理
 * @param {string} filename
 * @param {string} [outputFile]
 * @param {{ maxCount?: number, nextKeyword?: string }} [options]
 * @returns {string[]}
 */
const processCpuLog = (filename, outputFile, options = {}) => {
  if (!filename || typeof filename !== 'string') throw new TypeError('filename 必须是字符串');

  try {
    const content = fs.readFileSync(filename, 'utf8');
    const results = extractCpuMetrics(content, options);

    if (outputFile) appendResultsToFile(results, outputFile);

    console.log(`\n共找到 ${results.length} 组时间数据`);
    return results;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      console.error(`文件 ${filename} 未找到`);
    } else {
      console.error('读取文件时出错:', err && err.message ? err.message : err);
    }
    return [];
  }
};

/**
 * CLI 入口，仅在直接运行此模块时执行
 */
const main = () => {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.log('使用方法:');
    console.log('  node cpuMetricsExtractor.js <输入文件> [输出文件]');
    return;
  }

  const inputFile = argv[0];
  const outputFile = argv[1] || generateResultFileName(inputFile);
  processCpuLog(inputFile, outputFile);
};

module.exports = {
  extractCpuMetrics,
  appendResultsToFile,
  processCpuLog,
};

if (require.main === module) {
  main();
}
