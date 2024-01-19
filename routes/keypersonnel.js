/**
 * 小区重点人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/keypersonnel");

/**
 * 小区重点人员统计
 */
router.get("/statistics", async (ctx) => {
  try {
    const res = await clickhouseDb.query({
      query: "SELECT * FROM facedev.key_personnel;",
      format: "JSONEachRow"
    });
    const data = await res.json();
    ctx.body = util.success(data);
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

/**
 * 按条件查询重点人员
 */
router.get("/page", async (ctx) => {
  try {
    const { currentPage, pageSize, startDate, endDate, userKeyType } =
      ctx.query;

    // 构建用于获取数据的基本 SQL 查询
    let queryData =
      "SELECT DISTINCT ON (idCard) * FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryData += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (userKeyType) {
      queryData += ` AND userKeyType = '${userKeyType}'`;
    }

    // 计算数据检索的偏移量
    const offset = (currentPage - 1) * pageSize;
    queryData += ` ORDER BY timeStamp DESC LIMIT ${pageSize} OFFSET ${offset}`;

    // 执行获取数据的查询
    const resData = await clickhouseDb.query({
      query: queryData,
      format: "JSONEachRow"
    });

    const data = await resData.json();

    // 构建用于获取总记录数的基本 SQL 查询
    let queryCount =
      "SELECT COUNT(DISTINCT idCard) FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryCount += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (userKeyType) {
      queryCount += ` AND userKeyType = '${userKeyType}'`;
    }

    // 执行获取总记录数的查询
    const resCount = await clickhouseDb.query({
      query: queryCount,
      format: "JSON"
    });

    // 解析总记录数
    const responseJson = JSON.parse(await resCount.text());
    const countValue = responseJson.data[0]["uniqExact(idCard)"];
    const totalCount = parseInt(countValue, 10);
    const pageCount = Math.ceil(totalCount / parseInt(pageSize, 10));

    ctx.body = util.success({
      data,
      pageCount: isNaN(pageCount) ? "0" : parseInt(pageCount),
      total: totalCount,
      currentPage: parseInt(currentPage, 10)
    });
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

/**
 * 按条件查询重点人员个人分页
 */
router.get("/personalPage", async (ctx) => {
  try {
    const { currentPage, pageSize, startDate, endDate, idCard } = ctx.query;

    // 构建用于获取数据的基本 SQL 查询
    let queryData = "SELECT * FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryData += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (idCard) {
      queryData += ` AND idCard = '${idCard}'`;
    }

    // 计算数据检索的偏移量
    const offset = (currentPage - 1) * pageSize;
    queryData += ` ORDER BY timeStamp DESC LIMIT ${pageSize} OFFSET ${offset}`;

    // 执行获取数据的查询
    const resData = await clickhouseDb.query({
      query: queryData,
      format: "JSONEachRow"
    });

    const data = await resData.json();

    // 构建用于获取总记录数的基本 SQL 查询
    let queryCount = "SELECT COUNT() FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryCount += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (idCard) {
      queryCount += ` AND idCard = '${idCard}'`;
    }

    // 执行获取总记录数的查询
    const resCount = await clickhouseDb.query({
      query: queryCount,
      format: "JSON"
    });

    // 解析总记录数
    const responseJson = JSON.parse(await resCount.text());
    const countValue = responseJson.data[0]["count()"];
    const totalCount = parseInt(countValue, 10);
    const pageCount = Math.ceil(totalCount / parseInt(pageSize, 10));

    ctx.body = util.success({
      data,
      pageCount: isNaN(pageCount) ? "0" : parseInt(pageCount),
      total: totalCount,
      currentPage: parseInt(currentPage, 10)
    });
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

/**
 * 小区新增重点人员
 */
router.post("/addRecord", async (ctx) => {
  const { idCard, name, userKeyType } = ctx.request.body;
  let condition = ""; //状态
  // 获取今天的日期
  let today = new Date();
  // 格式化为 YYYY-MM-DD
  let timeStamp = today.toISOString().split("T")[0];

  try {
    // 构造 JSON 字符串
    let jsonString = `{"name": "${name}", "idCard": "${idCard}", "userKeyType": "${userKeyType}", "timeStamp": "${timeStamp}"}`;

    // 构造 SQL 查询字符串
    let queryString = `INSERT INTO facedev.key_personnel FORMAT JSONEachRow ${jsonString}`;
    // 将查询字符串传递给 ClickHouse
    let params = {
      query: queryString
    };
    await clickhouseDb.exec(params);
    ctx.body = util.success("添加成功");
  } catch (error) {
    // 提供错误的摘要信息
    ctx.body = util.fail("Failed to delete record: " + error.message);
  }
});

/**
 * 小区删除重点人员
 */
router.post("/deleteRecord", async (ctx) => {
  const { idCard } = ctx.request.body;
  try {
    // 使用 DELETE 查询删除记录
    let params = {
      query: `ALTER TABLE facedev.key_personnel DELETE WHERE idCard = '${idCard}'`,
      params: {
        idCard: idCard
      }
    };
    await clickhouseDb.exec(params);
    ctx.body = util.success("删除成功");
  } catch (error) {
    // 提供错误的摘要信息
    ctx.body = util.fail("Failed to delete record: " + error.message);
  }
});

module.exports = router;
