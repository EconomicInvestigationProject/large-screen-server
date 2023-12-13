/**
 * 人员搬入搬出接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/peopleinandout");

/**
 * 人员搬入搬出统计接口
 */
router.get("/statistics", async (ctx) => {
  try {
    const resultSet = await clickhouseDb.query({
      query:
        "SELECT(SELECT SUM(cnum) FROM facedev.peopleMovedIn) AS sumPeopleMovedIn,SELECT SUM(cnum) FROM facedev.peopleMovedOut) AS sumPeopleMovedOut;",
      format: "JSONEachRow"
    });

    ctx.body = util.success(statusPercentages);
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
