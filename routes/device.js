const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/device");

router.get("/list", async (ctx) => {
  try {
    const resultSet = await clickhouseDb.query({
      query: "SELECT status FROM facedev.viid_device;",
      format: "JSONEachRow"
    });

    const dataset = await resultSet.json();

    let countStatus1 = 0;
    let countStatus2 = 0;
    let countStatus3 = 0;

    // Count occurrences for each status
    dataset.forEach((entry) => {
      const status = entry.status;
      if (status === 1) {
        countStatus1++;
      } else if (status === 2) {
        countStatus2++;
      } else if (status === 3) {
        countStatus3++;
      }
    });

    // Calculate the total count
    const totalCount = countStatus1 + countStatus2 + countStatus3;

    // Calculate percentages
    const percentageStatus1 =  Math.round((countStatus1 / totalCount) * 100);
    const percentageStatus2 =  Math.round((countStatus2 / totalCount) * 100);
    const percentageStatus3 =  Math.round((countStatus3 / totalCount) * 100);

    const statusPercentages = [
      { value: percentageStatus1, name: "正常" },
      { value: percentageStatus2, name: "离线" },
      { value: percentageStatus3, name: "损坏" }
    ];

    ctx.body = util.success(statusPercentages);
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
