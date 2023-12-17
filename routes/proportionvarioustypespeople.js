/**
 * 小区各类人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/proportionvarioustypespeople");

/**
 * 小区各类人员站占比
 */
router.get("/statistics", async (ctx) => {
  try {
    const res = await clickhouseDb.query({
      query: "SELECT * FROM facedev.proportion_various_types_people;",
      format: "JSONEachRow"
    });
    const data = await res.json();
    if (data) {
      ctx.body = util.success(data);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
