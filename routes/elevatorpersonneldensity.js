/**
 * 小区最新电梯人口密度接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/elevatorpersonneldensity");

/**
 * 小区最新电梯人口密度统计
 */
router.get("/statistics", async (ctx) => {
  try {
    const res = await clickhouseDb.query({
      query: "SELECT * FROM facedev.elevator_personnel_density;",
      format: "JSONEachRow"
    });
    const data = await res.json();
    if (data) {
      data.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
      let dateArray = [];
      data.forEach((item) => {
        dateArray.push(item.density);
      });
      ctx.body = util.success(dateArray);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
