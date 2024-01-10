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
 * 小区新增重点人员
 */
router.post("/addRecord", async (ctx) => {
  const { idCard, name, status } = ctx.request.body;
  let condition = ""; //状态
  // 获取今天的日期
  let today = new Date();
  // 格式化为 YYYY-MM-DD
  let timeStamp = today.toISOString().split("T")[0];

  try {
    if (status) {
      condition = "in";
    } else {
      condition = "out";
    }
    // 构造 JSON 字符串
    let jsonString = `{"name": "${name}", "idCard": "${idCard}", "status": "${condition}", "timeStamp": "${timeStamp}"}`;

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
