/**
 * 时间日志提取器 - 从日志文件中提取指定时间段的日志行
 * 
 * 使用方式：node timeLogExtractor.js
 * 
 * @module timeLogExtractor
 * @exports {Function} extractTimeFromLine
 * @exports {Function} extractLogsByTime
 */

const fs = require('fs');
const path = require('path');

// 支持的日志文件扩展名
const SUPPORTED_LOG_EXTENSIONS = ['.log', '.txt'];

/**
 * 检查文件是否为支持的日志文件
 * @param {string} filename - 文件名
 * @returns {boolean}
 */
function isSupportedLogFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_LOG_EXTENSIONS.includes(ext);
}

/**
 * 从日志行中提取时间信息
 * @param {string} line - 日志行
 * @returns {string|null} 返回时间字符串（HH:MM 格式），如果无法提取则返回 null
 */
function extractTimeFromLine(line) {
  // 匹配时间格式：HH:MM（如 13:26）
  // 支持的时间格式：13:26, 13:26:16, 13:26:16.827 等
  const timeRegex = /\b(\d{1,2}:\d{2}):/;
  const match = line.match(timeRegex);
  return match && match[1] ? match[1] : null; // 返回 HH:MM 格式
}

/**
 * 提取指定时间段的日志
 * @param {string} inputFolder - 输入文件夹路径
 * @param {string} outputFile - 输出文件路径
 * @param {string} targetTime - 目标时间（HH:MM 格式，如 "13:26"）
 */
async function extractLogsByTime(inputFolder, outputFile, targetTime) {
  try {
    console.log(`开始处理文件夹: ${inputFolder}`);
    console.log(`目标时间段: ${targetTime}`);

    // 读取文件夹中的所有文件
    const files = fs.readdirSync(inputFolder);

    // 过滤出 .log 和 .txt 文件
    const logFiles = files.filter(isSupportedLogFile);

    console.log(`找到 ${logFiles.length} 个日志文件`);

    if (logFiles.length === 0) {
      console.log('未找到任何日志文件');
      return;
    }

    // 创建输出文件（如果已存在则清空内容）
    let outputContent = `=== 提取时间: ${targetTime} 的日志 ===\n`;
    outputContent += `=== 生成时间: ${new Date().toLocaleString()} ===\n\n`;

    let totalMatchedLines = 0;
    let processedFiles = 0;

    // 逐个处理日志文件
    for (const logFile of logFiles) {
      const filePath = path.join(inputFolder, logFile);
      console.log(`正在处理文件: ${logFile}`);

      try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let fileMatchedLines = 0;
        const matchedLines = [];

        // 过滤指定时间段的日志行
        for (const line of lines) {
          if (line.trim() === '') continue; // 跳过空行

          const lineTime = extractTimeFromLine(line);
          if (lineTime === targetTime) {
            matchedLines.push(line);
            fileMatchedLines++;
          }
        }

        totalMatchedLines += fileMatchedLines;
        processedFiles++;

        // 累积匹配的行到输出内容
        if (matchedLines.length > 0) {
          outputContent += `\n// ===== 文件: ${logFile} ===== //\n`;
          outputContent += `${matchedLines.join('\n')}\n`;
        }

        console.log(`  ${logFile}: 找到 ${fileMatchedLines} 个 ${targetTime} 时间段的日志行`);
      } catch (error) {
        console.error(`  处理文件 ${logFile} 时出错:`, error.message);
      }
    }

    // 一次性写入所有内容到输出文件
    fs.writeFileSync(outputFile, outputContent);

    console.log(`\n处理完成!`);
    console.log(`成功处理 ${processedFiles}/${logFiles.length} 个文件`);
    console.log(`总共找到 ${totalMatchedLines} 个 ${targetTime} 时间段的日志行`);
    console.log(`结果已保存到: ${outputFile}`);
  } catch (error) {
    console.error('处理过程中发生错误:', error);
  }
}

// 使用示例
const inputFolder = './logs-tool/logs/20251126'; // 修改为你的日志文件夹路径
const outputFile = './test/1126.log'; // 输出文件路径
const targetTime = '13:26'; // 要提取的时间段

// 执行处理
extractLogsByTime(inputFolder, outputFile, targetTime);
