# 电子书管理器 (EBook Manager)

一个基于React Native开发的跨平台移动端电子书管理与阅读应用，支持Android和iOS系统。

## 功能特性

### 🚀 核心功能
- **书籍管理**: 本地电子书文件的统一管理
- **多格式支持**: 支持EPUB、PDF、TXT等主流电子书格式
- **阅读体验**: 提供沉浸式的移动阅读体验
- **个性化设置**: 丰富的阅读个性化设置选项

### 📱 界面特性
- **书架界面**: 网格布局展示书籍封面，支持排序和搜索
- **阅读器**: 全屏阅读模式，支持手势翻页和进度跳转
- **设置界面**: 完整的阅读设置和应用配置
- **响应式设计**: 适配不同屏幕尺寸和方向

### ⚡ 技术特性
- **本地存储**: 所有数据本地化存储，确保隐私和离线可用
- **高性能**: 优化的渲染和内存管理
- **跨平台**: 单一代码库支持iOS和Android
- **现代架构**: 基于Redux的状态管理和模块化设计

## 技术栈

### 核心框架
- **React Native**: 跨平台移动应用开发框架
- **TypeScript**: 类型安全的开发语言
- **React Navigation**: 应用导航管理

### 状态管理
- **Redux Toolkit**: 现代Redux状态管理
- **React Redux**: React与Redux的绑定

### 数据存储
- **SQLite**: 本地关系型数据库
- **React Native FS**: 文件系统操作

### UI/UX
- **React Native Reanimated**: 高性能动画
- **React Native Gesture Handler**: 手势处理
- **React Native WebView**: Web内容渲染

## 项目结构

```
EBookManager/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── BookShelf/       # 书架相关组件
│   │   ├── Reader/          # 阅读器组件
│   │   ├── Settings/        # 设置组件
│   │   └── Import/          # 导入组件
│   ├── screens/             # 页面组件
│   │   ├── BookShelf/       # 书架页面
│   │   ├── Reader/          # 阅读器页面
│   │   └── Settings/        # 设置页面
│   ├── services/            # 业务服务
│   │   ├── database/        # 数据库服务
│   │   ├── fileSystem/      # 文件系统服务
│   │   └── bookParser/      # 书籍解析服务
│   ├── stores/              # Redux状态管理
│   │   └── slices/          # Redux切片
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── constants/           # 应用常量
│   └── navigation/          # 导航配置
├── App.tsx                  # 应用入口
├── package.json             # 项目配置
└── README.md               # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 16
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发)

### 安装依赖
```bash
npm install
```

### iOS运行
```bash
npm run ios
```

### Android运行
```bash
npm run android
```

### 开发模式
```bash
npm start
```

## 数据模型

### 书籍信息模型
- 书籍ID、标题、作者
- 文件路径、格式、大小
- 封面路径、总页数
- 创建和更新时间

### 阅读进度模型
- 当前阅读位置和进度百分比
- 最后阅读时间和累计阅读时长
- 书签和笔记信息

### 用户设置模型
- 阅读器设置（字体、主题、亮度等）
- 应用配置（排序方式、显示选项等）

## 支持的文件格式

| 格式 | 支持状态 | 功能特性 |
|------|----------|----------|
| EPUB | ✅ 支持 | 目录、封面、元数据 |
| PDF | ✅ 支持 | 页面渲染、书签 |
| TXT | ✅ 支持 | 自动分章、格式化 |
| MOBI | 🔄 计划中 | Kindle格式支持 |

## 开发指南

### 代码规范
- 使用TypeScript进行类型安全的开发
- 遵循ESLint和Prettier代码格式规范
- 采用模块化和组件化的架构设计

### 测试策略
- 单元测试：Jest + React Native Testing Library
- 集成测试：端到端功能测试
- 性能测试：内存和渲染性能监控

### 构建部署
- 开发环境：热重载和调试支持
- 生产环境：代码压缩和优化
- 发布：自动化CI/CD流程

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 更新日志

### v1.0.0 (开发中)
- ✅ 基础项目架构搭建
- ✅ 数据库和文件系统服务
- ✅ Redux状态管理
- ✅ 书架和阅读器界面
- ✅ 基础书籍解析支持
- 🔄 电子书导入功能
- 🔄 完整的阅读器功能
- 🔄 主题和设置系统

## 联系方式

- 项目维护者：电子书管理器开发团队
- 问题反馈：通过GitHub Issues提交
- 功能建议：通过GitHub Discussions讨论

---

**注意**: 本项目目前处于开发阶段，部分功能可能还不完整。欢迎贡献代码和提供反馈！