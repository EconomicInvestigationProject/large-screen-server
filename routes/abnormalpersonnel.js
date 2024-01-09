/**
 * 异常人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/abnormalpersonnel");

/**
 * 小区异常人员一周统计
 */
router.get("/statistics", async (ctx) => {
  try {
    const res = await clickhouseDb.query({
      query: "SELECT * FROM facedev.abnormal_personnel;",
      format: "JSONEachRow"
    });
    const data = await res.json();
    if (data) {
      data.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
      let dateArray = [];
      data.forEach((item) => {
        dateArray.push(item.cunm);
      });
      ctx.body = util.success(dateArray);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
