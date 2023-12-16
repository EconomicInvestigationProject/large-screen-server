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

module.exports = router;
