/**
 * 日志过滤器 - 在日志文件夹中查找包含指定关键字的日志行并聚合输出
 *
 * 使用方式：node logFilter.js
 *
 * @module logFilter
 * @exports {Function} filterLogsByKeywords
 */

const fs = require('fs');
const path = require('path');

// 支持的日志文件扩展名
const SUPPORTED_LOG_EXTENSIONS = ['.log', '.txt'];

// 要查找的关键字（小写匹配）
const KEYWORDS = ['iqiyi', 'seek', 'timeupdate', 'iqp-progress', 'event_', 'touch', 'mouse', 'slider'];
// const KEYWORDS = ['memory', 'time out'];

/**
 * 从指定文件夹读取所有日志文件，过滤包含关键字的行并写入输出文件
 * @param {string} inputFolder - 输入文件夹路径
 * @param {string} outputFile - 输出文件路径
 */
async function filterLogsByKeywords(inputFolder, outputFile) {
    try {
        console.log(`开始处理文件夹: ${inputFolder}`);
        
        // 读取文件夹中的所有文件
        const files = fs.readdirSync(inputFolder);
        
        // 过滤出支持的日志文件
        function isSupportedLogFile(filename) {
            const ext = path.extname(filename).toLowerCase();
            return SUPPORTED_LOG_EXTENSIONS.includes(ext);
        }

        const logFiles = files.filter(isSupportedLogFile);
        
        console.log(`找到 ${logFiles.length} 个log文件`);
        
        if (logFiles.length === 0) {
            console.log('未找到任何log文件');
            return;
        }
        
        // 创建输出内容缓存（最后一次性写入以减少 I/O）
        let outputContent = '';
        let totalMatchedLines = 0;

        // 逐个处理 log 文件
        for (const logFile of logFiles) {
            const filePath = path.join(inputFolder, logFile);
            console.log(`正在处理文件: ${logFile}`);

            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');

                // 过滤包含关键字的行（不区分大小写）
                const matchedLines = lines.filter(line => {
                    const lower = line.toLowerCase();
                    return KEYWORDS.some(k => lower.includes(k));
                });

                const fileMatchedLines = matchedLines.length;
                totalMatchedLines += fileMatchedLines;

                if (fileMatchedLines > 0) {
                    outputContent += `\n=== 来自文件: ${logFile} ===\n`;
                    outputContent += matchedLines.join('\n') + '\n';
                }

                console.log(`  ${logFile}: 找到 ${fileMatchedLines} 个匹配行`);
            } catch (error) {
                console.error(`  处理文件 ${logFile} 时出错:`, error.message);
            }
        }

        // 将累积内容写入输出文件（覆盖或创建）
        fs.writeFileSync(outputFile, outputContent);

        console.log(`\n处理完成! 总共找到 ${totalMatchedLines} 个包含关键字的日志行`);
        console.log(`结果已保存到: ${outputFile}`);
        
    } catch (error) {
        console.error('处理过程中发生错误:', error);
    }
}

// 使用示例
const inputFolder = './test';        // 修改为你的log文件夹路径
const outputFile = './drug-result2.log';   // 修改为你想要的输出文件路径

// 执行处理
filterLogsByKeywords(inputFolder, outputFile);