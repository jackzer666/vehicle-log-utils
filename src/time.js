/**
 * 起播时间提取器 - 从 ADB 日志中提取视频起播至播放的时间差
 * 
 * 使用方式：node time.js <input-file> [output-file]
 * 
 * @module time
 * @exports {Function} processLogData
 * @exports {Function} appendResultsToFile
 * @exports {Function} processLogFile
 */

const fs = require('fs');
const path = require('path');
const { generateResultFileName, currentTimeString } = require('./shared');

const PLAYBACK_START_KEY = "h5_call_bm_send_enter_page\\\",[\\\"player\\\"]]";
const PLAYBACK_STATE_KEYS = [
  "h5_call_bm_send_video_state\\\",[\\\"adstartplay\\\"]]",
  "h5_call_bm_send_video_state\\\",[\\\"playing\\\"]]",
];

/**
 * 从日志行中提取时间戳（第7-18位）
 * @param {string} lineStr 日志行
 * @returns {string} 时间戳字符串
 */
const extractTimestamp = (lineStr) => {
  return lineStr.substring(6, 18);
};

/**
 * 处理日志内容，提取起播时间对
 * @param {string} logContent 原始日志文本
 * @returns {Array<Array<string>>} 时间对数组 [[time1, time2], ...]
 */
const extractPlaybackTimePairs = (logContent) => {
  if (typeof logContent !== 'string' || logContent.trim() === '') return [];

  const lines = logContent.trim().split('\n');
  const processedLines = new Set();
  const results = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (processedLines.has(i)) continue;

    const line = lines[i].trim();
    if (!line || !line.includes(PLAYBACK_START_KEY) || line.length < 18) continue;

    const time1 = extractTimestamp(line);

    // 查找后续匹配的播放状态行
    for (let j = i + 1; j < lines.length; j += 1) {
      const nextLine = lines[j].trim();
      if (!nextLine) continue;
      if (nextLine.includes(PLAYBACK_START_KEY)) break; // 遇到下一个起播行，停止
      
      if (PLAYBACK_STATE_KEYS.some((keyword) => nextLine.includes(keyword)) && nextLine.length >= 18) {
        const time2 = extractTimestamp(nextLine);
        results.push([time1, time2]);
        processedLines.add(i);
        processedLines.add(j);
        break;
      }
    }
  }

  return results;
};

/**
 * 将提取结果追加到输出文件
 * @param {Array<Array<string>>} results 时间对数组
 * @param {string} outputFile 输出文件路径
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

    const timestamp = currentTimeString ? currentTimeString() : new Date().toISOString();
    const isCsv = outputFile.endsWith('.csv');
    const separator = isCsv ? ',' : '\t';
    const contentLines = results.map(([t1, t2]) => `${t1}${separator}${t2}`).join('\n');
    const content = `${prefix}${timestamp}\n${contentLines}\n`;

    fs.appendFileSync(outputFile, content, 'utf8');
    console.log(`结果已追加到文件: ${outputFile}`);
  } catch (err) {
    console.error('写入文件时出错:', err && err.message ? err.message : err);
  }
};

/**
 * 读取并处理日志文件
 * @param {string} filename 输入文件路径
 * @param {string} [outputFile] 输出文件路径（可选）
 * @returns {Array<Array<string>>} 时间对数组
 */
const processPlaybackLog = (filename, outputFile) => {
  if (!filename || typeof filename !== 'string') throw new TypeError('filename 必须是字符串');

  try {
    const content = fs.readFileSync(filename, 'utf8');
    const results = extractPlaybackTimePairs(content);

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
    console.log('  node playbackTimeExtractor.js <输入文件> [输出文件]');
    return;
  }

  const inputFile = argv[0];
  const outputFile = argv[1] || generateResultFileName(inputFile);
  processPlaybackLog(inputFile, outputFile);
};

module.exports = {
  extractPlaybackTimePairs,
  appendResultsToFile,
  processPlaybackLog,
};

if (require.main === module) {
  main();
}
