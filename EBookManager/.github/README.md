# GitHub Actions 自动构建配置

## 🚀 已配置的工作流

### 1. `android-build.yml` - 完整Android构建
**触发条件:**
- 推送到 `main` 或 `develop` 分支
- 创建标签 (v*)
- Pull Request到 `main` 分支
- 手动触发

**功能:**
- ✅ 自动设置Android开发环境
- ✅ 构建Debug和Release APK
- ✅ 支持签名APK（需配置密钥）
- ✅ 自动上传APK到GitHub Artifacts
- ✅ 创建GitHub Release（标签推送时）

### 2. `quick-android-build.yml` - 快速构建
**触发条件:**
- 手动触发（可选择Debug/Release）

**功能:**
- ⚡ 快速构建单个APK
- 📱 支持选择构建类型
- 🔗 PR中自动评论下载链接

### 3. `deploy.yml` - 完整部署流程
**触发条件:**
- 推送到指定分支

**功能:**
- 🧪 代码质量检查
- 📱 Android和iOS构建
- 🚀 自动部署到应用商店

## 🔧 使用方法

### 方法1: 推送代码自动构建
```bash
git add .
git commit -m "feat: 新功能"
git push origin main  # 触发自动构建
```

### 方法2: 手动触发构建
1. 进入GitHub仓库
2. 点击 `Actions` 选项卡
3. 选择 `Quick Android Build`
4. 点击 `Run workflow`
5. 选择构建类型（Debug/Release）
6. 点击 `Run workflow` 开始构建

### 方法3: 标签发布
```bash
git tag v1.0.0
git push origin v1.0.0  # 触发发布构建
```

## 📁 下载APK文件

### 从GitHub Actions下载
1. 进入 `Actions` 页面
2. 选择对应的构建任务
3. 在 `Artifacts` 部分下载APK

### 从GitHub Release下载
1. 进入 `Releases` 页面
2. 选择对应版本
3. 下载 `EBookManager-vX.X.X.apk`

## 🔐 密钥配置（可选）

如需签名Release APK，在仓库设置中配置以下Secrets：

```
ANDROID_KEYSTORE_BASE64    # keystore文件的base64编码
ANDROID_KEYSTORE_PASSWORD  # keystore密码
ANDROID_KEY_ALIAS         # 密钥别名
ANDROID_KEY_PASSWORD      # 密钥密码
```

### 生成密钥步骤
```bash
# 1. 生成keystore
keytool -genkey -v -keystore release.keystore -alias my-app-key -keyalg RSA -keysize 2048 -validity 10000

# 2. 转换为base64
base64 release.keystore | tr -d '\n'

# 3. 将输出的base64字符串配置到ANDROID_KEYSTORE_BASE64
```

## 📊 构建状态

| 工作流 | 状态 | 最后构建 |
|--------|------|----------|
| Android Build | ![Build Status](../../actions/workflows/android-build.yml/badge.svg) | - |
| Quick Build | ![Build Status](../../actions/workflows/quick-android-build.yml/badge.svg) | - |
| Deploy | ![Build Status](../../actions/workflows/deploy.yml/badge.svg) | - |

## 🔧 故障排除

### 常见问题
1. **构建失败**: 检查依赖版本和Android SDK配置
2. **签名失败**: 验证密钥配置是否正确
3. **上传失败**: 检查GitHub Token权限

### 调试方法
1. 查看Actions日志获取详细错误信息
2. 本地运行 `npm run build:android` 测试
3. 检查gradle版本兼容性

## 🚀 自动化优势

✅ **零配置构建** - 推送代码即可自动构建APK
✅ **多环境支持** - Debug和Release版本
✅ **版本管理** - 自动创建GitHub Release
✅ **团队协作** - 所有成员都能访问构建产物
✅ **持续集成** - 每次代码变更都会验证构建