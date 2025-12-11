# vehicle-log-utils

日志处理工具集，用于从 ADB 日志中提取关键指标。

## 项目结构

```
src/
	cpu.js                # 提取 CPU 指标（cpu.js）
	time.js               # 提取播放起播至播放时间差（time.js）
	shared.js             # 通用工具：时间戳、结果文件名生成等（shared.js）
	massiveTools/         # 面向海量日志的批处理工具
		timeLogExtractor.js # 按 HH:MM 提取日志行（timeLogExtractor.js）
		logSplitter.js      # 将大日志文件均匀分割为多个文件（logSplitter.js）
		logFilter.js        # 在文件夹中按关键字过滤并聚合日志（logFilter.js）
```

## 工具列表

### 1. CPU 指标提取器 (cpu.js)

**作用**：从日志中提取 CPU 相关字段

**CLI 使用方式**：
```bash
node src/cpu.js <input-file> [output-file]
```

**示例**：
```bash
node src/cpu.js logs-tool/logs/20251118/cpu-tab.log result_cpu.txt
```

---

### 2. 播放时间提取器 (time.js)

**作用**：从 ADB 日志中提取视频起播至播放的时间差

**CLI 使用方式**：
```bash
node src/time.js <input-file> [output-file]
```

**示例**：
```bash
node src/time.js test/start-play-kill.log result_time.txt
```

---

## 通用说明

- **输入文件**：使用相对于项目根的路径或绝对路径
- **输出文件**：若不指定，将使用默认命名规则生成
- **输出格式**：根据文件扩展名自动判断（.csv 或制表符分隔）

---

## 海量日志工具（src/massiveTools）

项目中包含若干用于处理大批量日志文件的小工具，放在 `src/massiveTools` 目录下：

### 1. 时间日志提取器 (timeLogExtractor.js)

**作用**：从日志文件夹中提取匹配指定小时:分钟（HH:MM）的所有日志行，适用于批量按时间点筛选日志。

**CLI 使用方式**：
```bash
node src/massiveTools/timeLogExtractor.js
```

**说明**：该脚本内置示例变量（`inputFolder` / `outputFile` / `targetTime`），如需自定义参数，请编辑脚本顶部的示例变量。

---

### 2. 日志分割器 (logSplitter.js)

**作用**：将单个较大的日志文件均匀分割成多个小文件（默认分割为 3 个），便于并行分析或查看。

**CLI 使用方式**：
```bash
node src/massiveTools/logSplitter.js
```

**说明**：该脚本使用文件内示例变量控制输入与分割数，若需自定义请编辑脚本顶部的 `inputFile` / `outputPrefix` / `fileCount`。

---

### 3. 日志关键字过滤器 (logFilter.js)

**作用**：在指定日志文件夹中查找包含预定义关键字的日志行，并将匹配内容聚合到单个输出文件中（关键字可在脚本内调整）。

**CLI 使用方式**：
```bash
node src/massiveTools/logFilter.js
```

**说明**：脚本顶部包含 `inputFolder` / `outputFile` 等示例变量，运行前如需更改请在文件中进行修改。

---

以上说明保持原工具行为不变，仅补充文档与目录结构，便于快速定位和使用。

