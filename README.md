# vehicle-log-utils

日志处理工具集，用于从 ADB 日志中提取关键指标。

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

