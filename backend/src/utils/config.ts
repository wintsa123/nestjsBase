import { parse } from 'yaml';
import * as path from 'path';
import * as fs from 'fs';

// 获取项目运行环境
export const getEnv = () => {
  return process.env.RUNNING_ENV;
};

export const IS_DEV = getEnv() === 'dev';
// 读取项目配置
export const getConfig = () => {
  const environment = getEnv();
  console.log(environment, '当前运行的环境');
  const yamlPath = path.join(process.cwd(), `./application.${environment}.yml`);
  const file = fs.readFileSync(yamlPath, 'utf8');
  const config = parse(file);
  return config;
};

//获取指定后缀文件
export const traverseDirectory = (currentPath, suffix) => {
  const files = fs.readdirSync(currentPath);
  let pdfFiles: Array<any> = []
  console.log(files)
  files.forEach(file => {
    const filePath = path.join(currentPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 如果是目录，则递归遍历子目录
      const tmp = traverseDirectory(filePath, suffix);
      pdfFiles = pdfFiles.concat(tmp);

    } else if (path.extname(filePath).toLowerCase() === suffix) {
      // 如果是 PDF 文件，则将其路径添加到数组中
      pdfFiles.push({
        filePath:filePath.replace(/\\/g, "/"), name: path.parse(filePath).name, path: (path.dirname(filePath).replace(/\\/g, "/")
        )
      });
    }
  })
  return pdfFiles
}