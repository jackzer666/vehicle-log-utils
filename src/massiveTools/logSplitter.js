/**
 * 日志分割器 - 将日志文件均匀分割成多个文件
 * 
 * 使用方式：node logSplitter.js
 * 
 * @module logSplitter
 * @exports {Function} splitLogFile
 */

const fs = require('fs');
const path = require('path');

// 输出文件分割数量
const OUTPUT_FILE_COUNT = 3;

/**
 * 将日志文件内容均匀分成指定数量的文件
 * @param {string} inputFile - 输入文件路径
 * @param {string} outputPrefix - 输出文件前缀
 * @param {number} fileCount - 分割文件数量，默认为 3
 */
function splitLogFile(inputFile, outputPrefix = 'split_log', fileCount = OUTPUT_FILE_COUNT) {
  try {
    console.log(`开始处理文件: ${inputFile}`);
    
    // 检查输入文件是否存在
    if (!fs.existsSync(inputFile)) {
      console.error(`错误: 文件 ${inputFile} 不存在`);
      return;
    }
    
    // 读取文件内容并过滤空行
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const totalLines = lines.length;
    console.log(`总行数: ${totalLines}`);
    
    if (totalLines === 0) {
      console.log('文件为空，无需处理');
      return;
    }
    
    // 计算每个文件应该包含的行数
    const linesPerFile = Math.ceil(totalLines / fileCount);
    console.log(`每个文件大约 ${linesPerFile} 行`);
    
    let filesCreated = 0;
    let totalLinesWritten = 0;
    
    // 将内容分割到多个文件中
    for (let i = 0; i < fileCount; i++) {
      const startIndex = i * linesPerFile;
      
      // 如果起始索引已经超过文件行数，跳过创建空文件
      if (startIndex >= totalLines) {
        const outputFile = `${outputPrefix}_${i + 1}.log`;
        console.log(`文件 ${outputFile} 跳过（无内容）`);
        continue;
      }
      
      const endIndex = Math.min(startIndex + linesPerFile, totalLines);
      const fileLines = lines.slice(startIndex, endIndex);
      const outputFile = `${outputPrefix}_${i + 1}.log`;
      
      // 一次性写入文件
      fs.writeFileSync(outputFile, fileLines.join('\n'));
      
      filesCreated++;
      totalLinesWritten += fileLines.length;
      
      console.log(`创建文件: ${outputFile} (${fileLines.length} 行)`);
    }
    
    console.log(`\n处理完成!`);
    console.log(`成功创建 ${filesCreated} 个文件`);
    console.log(`总共写入 ${totalLinesWritten} 行（原始文件 ${totalLines} 行）`);
    
    // 验证分割结果
    if (totalLinesWritten === totalLines) {
      console.log('✓ 所有行都已正确分割');
    } else {
      console.log('⚠ 行数不匹配，可能存在问题');
    }
    
  } catch (error) {
    console.error('处理过程中发生错误:', error);
  }
}

// 使用示例
const inputFile = 'test/1126.log'; // 修改为你的日志文件路径
const outputPrefix = 'test/split'; // 输出文件前缀

// 执行分割
splitLogFile(inputFile, outputPrefix);