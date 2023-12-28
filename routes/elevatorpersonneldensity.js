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
    const res = await clickhouseDb.query({
      query:
        "SELECT * from facedev.deviceThroughputDaily dtd WHERE (Date > (now() + toIntervalDay(-7)))",
      format: "JSONEachRow"
    });
    const data = await res.json();
    if (data) {
      // 使用对象存储日期和对应的 cnum 值
      const dateMap = {};

      data.forEach((item) => {
        const date = item.Date;
        const cnum = item.cnum;

        // 如果日期已存在，累加 cnum
        if (dateMap[date]) {
          dateMap[date] += cnum;
        } else {
          // 否则，添加新的日期并设置 cnum 值
          dateMap[date] = cnum;
        }
      });

      // 将对象转换为数组
      const resultArray = Object.keys(dateMap).map((date) => ({
        Date: date,
        cnum: dateMap[date]
      }));

      // 按日期排序
      resultArray.sort((a, b) => new Date(a.Date) - new Date(b.Date));

      let dataArray = [];
      resultArray.forEach((item) => {
        dataArray.push(item.cnum);
      });
      ctx.body = util.success(dataArray);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
