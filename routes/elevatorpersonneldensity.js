/**
 * 小区最新电梯人口密度接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/elevatorpersonneldensity");

/**
 * 小区最新电梯人口密度统计
 * deviceThroughputDaily 视图
 */
router.get("/statistics", async (ctx) => {
  try {
    // Assuming your SQL query aggregates the data on the database side
    const res = await clickhouseDb.query({
      query:
        "SELECT Date, SUM(cnum) as total_cnum from facedev.deviceThroughputDaily WHERE (Date > (now() + toIntervalDay(-7))) GROUP BY Date",
      format: "JSONEachRow"
    });

    const data = await res.json();
    if (data) {
      const dataArray = data.map((item) => item.total_cnum);
      ctx.body = util.success(dataArray);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
