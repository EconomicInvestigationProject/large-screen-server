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
