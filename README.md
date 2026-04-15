# 校园组队匹配小程序

## 接口文档
https://ffmc8ef2me.apifox.cn（密码 0413）

## 原型设计
https://modao.cc/proto/3XHskHUjtdfgtbOjIISdFW/sharing?view_mode=read_only&screen=VGfIpIzoXjiBiI #校园组队小程序原型-分享

## 项目进度
https://docs.qq.com/sheet/DYUxzcUxBTFRLVGps?tab=BB08J2

##数据库设计
https://docs.qq.com/sheet/DYWxBdXBQamRYR2du?isNewEmptyDoc=1&no_promotion=1&is_blank_or_template=blank&nlc=1&tab=BB08J2

## 后端启动
1. 导入 IDEA，等待 Maven 下载依赖
2. 创建 MySQL 数据库 team_db，执行 schema.sql
3. 修改 application.yml 中的数据库密码
4. 运行 TeamApplication.java
5. 访问 http://localhost:8080/api/team/recommend 测试

## 前端启动
1. 下载微信开发者工具
2. 导入 miniapp 文件夹
3. 在 project.config.json 中填写自己的 AppID
4. 勾选“不校验合法域名”（开发阶段）