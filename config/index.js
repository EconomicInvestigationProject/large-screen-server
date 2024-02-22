/**
 * 配置文件
 */

// 配置公司 ClickHouse 数据库连接 数据库配置
// const clickhouseDbConfig = {
//   host: "http://218.56.104.54:8123",
//   user: "default",
//   password: "Welcome1",
//   database: "facedev"
// };

// 配置公安服务器 ClickHouse 数据库连接 数据库配置
// const clickhouseDbConfig = {
//   host: "http://192.168.6.111:8123",
//   user: "default",
//   password: "Welcome1",
//   database: "facedev"
// };

const clickhouseDbConfig = {
  host: "http://127.0.0.1:8123",
  user: "default",
  password: "Welcome1",
  database: "facedev"
};

module.exports = {
  URL,
  clickhouseDbConfig
};
