# 项目名称: 全栈基础模板

## 简介
本项目是一个基于现代技术栈构建的前后端分离应用模板，旨在为开发者提供一个快速启动新项目的基础。后端使用NestJS 10框架结合PostgreSQL数据库和Prisma ORM，前端则采用Vue 3、TypeScript、Element Plus以及alovaJs v3。
此模板已经实现了用户登录、注册、退出和JWT验证等基础功能，可以帮助开发者节省数天的开发时间。

## 技术栈
- **后端**
  - <img src="https://nestjs.com/img/logo-small.svg" width="20" alt="NestJS Logo"> [NestJS 10](https://nestjs.com/)
  - <img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="20" alt="PostgreSQL Logo"> [PostgreSQL](https://www.postgresql.org/)
  - <img src="https://www.prisma.io/docs/img/favicon.png" width="20" alt="Prisma Logo"> [Prisma ORM](https://www.prisma.io/)
  - <img src="https://jwt.io/img/pic_logo.svg" width="20" alt="JWT Logo"> [JWT (JSON Web Tokens)](https://jwt.io/) 验证

- **前端**
  - <img src="https://vuejs.org/images/logo.png" width="20" alt="Vue Logo"> [Vue 3](https://vuejs.org/)
  - <img src="https://www.typescriptlang.org/favicon-32x32.png" width="20" alt="TypeScript Logo"> [TypeScript](https://www.typescriptlang.org/)
  - <img src="https://element-plus.org/images/element-plus-logo-small.svg" width="20" alt="Element Plus Logo"> [Element Plus](https://element-plus.org/)
  - <img src="https://alova.js.org/img/favicon.ico" width="20" alt="alovaJs Logo"> [alovaJs v3](https://alova.js.org/)

## 功能特性
- 用户注册与登录与退出
- JWT 验证
- 前后端分离架构
- 使用Prisma ORM进行数据库操作
- 响应式前端设计
- 使用alovaJs v3进行请求管理
- 后端接口统一部署到api文件夹，方便管理，并且使用swagger进行接口文档生成
- 使用该模板可以快速搭建基础后端和前端项目，并且前后端已经适配了用户jwt验证和无感刷新。
- 使用pnpm管理

## 快速开始

### 环境要求
- Node.js (推荐版本 >= 16.x)
- PostgreSQL
- pnpm或者yarn

### 安装步骤
1. **克隆仓库**
- git clone xxx.git && cd ..
- cd backend
- pnpm install

- cd frontend
- pnpm install

2. **配置环境变量**
-  配置数据库
- 复制.env.example文件为.env，并填写你的PostgreSQL数据库连接信息。

3. **运行项目**
-  在backend运行 `npx prisma migrate dev --name init` 命令初始化数据库
-  在backend和frontend目录 运行 `pnpm run dev` 命令启动前后端应用。
