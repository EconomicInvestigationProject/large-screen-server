const { createClient } = require("@clickhouse/client");
const config = require("./index");
const log4js = require("./../utils/log4j");

// 创建 ClickHouse 数据库连接
const clickhouseDb = createClient(config.clickhouseDbConfig);

const queryall = async () => {
  let resultSet; // 定义 resultSet 变量

  try {
    resultSet = await clickhouseDb.query({
      query: "SELECT * FROM face",
      format: "JSONEachRow"
    });
    const dataset = await resultSet.json();
    log4js.info("ClickHouse查询连接成功:", dataset);
  } catch (error) {
    log4js.error("ClickHouse查询连接失败:", resultSet, error);
  }
};

queryall();

module.exports = clickhouseDb;
