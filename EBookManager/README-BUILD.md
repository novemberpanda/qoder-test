## 🚀 快速开始

### 自动构建Android APK

1. **推送代码触发构建**
   ```bash
   git add .
   git commit -m "更新功能"
   git push origin main
   ```

2. **手动触发构建**
   - 进入 [Actions页面](../../actions)
   - 选择 "Quick Android Build"
   - 点击 "Run workflow"

3. **下载APK**
   - 构建完成后在Actions页面下载
   - 或从Releases页面获取正式版本

### 📱 支持的构建类型
- **Debug APK**: 用于开发测试
- **Release APK**: 用于生产发布

### 🔧 环境要求
所有构建都在GitHub的云端环境中进行，无需本地配置Android开发环境。

---
📖 详细说明请查看 [GitHub Actions配置文档](.github/README.md)