## 一、项目介绍
```js


```
## 二、使用项目

- 1、本项目仅仅是实现了`rbac`的权限系统，对于其他的功能需要自己基于这个基础上去扩展

- 2、先在本地创建数据库

- 3、在项目的根目录的`.env`文件修改为你自己的数据库基本配置(地址、用户名、密码、数据库)

  ```properties
  DB_HOST=localhost
  DB_USERNAME=root
  DB_PASSWORD=123456
  DB_DATABASE=nestjs-mysql
  ```

- 4、安装依赖包
   ```js
    yarn install
   ```
   
   window环境 务必将项目下的oracle的bin添加进环境变量
- 5、启动项目

  ```shell
  yarn run dev
  ```
- 6、更新同步项目

  ```shell
  yarn run update
  ```


- 7、如果你想初始化别的数据,可以在`src/services/init-db`中写上你要初始化的数据

## 二、主要实现功能

- [x] 实现用户的登录、登录鉴权、多点登录限制、菜单权限、接口权限

- [x] 基于`RBAC`实现权限控制

- [x] 集成`swagger`文档

- [x] `ecosystem.config.js`是采用`PM2`的配置文件,项目开发完后直接运行命令一键部署

  ```shell
  npm run build
  # 开发环境
  npm run pm2:dev
  # 生产环境
  npm run pm2:prod
  ```

- [x] `winston`日志系统根据小时来划分日志管理,如果要实时查看日志，直接使用`PM2`查看日志

  ```shell
  pm2 log
  ```

- [x] 自定义装饰器，被装饰器装饰的接口会自动进行入库操作

