/**
 * 小区各类人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/proportionvarioustypespeople");

/**
 * 小区各类人员站占比
 * 各类人 weekSummary 视图
 */
router.get("/statistics", async (ctx) => {
  try {
    const res = await clickhouseDb.query({
      query: "SELECT * FROM facedev.weekSummary;",
      format: "JSONEachRow"
    });
    const data = await res.json();
    if (data) {
      // 遍历数组并修改对象中的属性
      let dataArray = data.map((item) => {
        if (item.type === "CurrentPeople") {
          return {
            name: "实有人口",
            value: item.cnum
          };
        } else if (item.type === "MovedOut") {
          return {
            name: "搬出人口",
            value: item.cnum
          };
        } else if (item.type === "MovedIn") {
          return {
            name: "搬入人口",
            value: item.cnum
          };
        } else if (item.type === "Stranger") {
          return {
            name: "陌生人口",
            value: item.cnum
          };
        }
      });
      ctx.body = util.success(dataArray);
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
