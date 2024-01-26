/**
 * 搬入搬离人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/moveInout");

/**
 * 获取搬入和搬离人员总数
 */
router.get("/getTotal", async (ctx) => {
  let queryData;
  const { community } = ctx.query;
  try {
    // 构建用于获取数据的基本 SQL 查询
    if (community === "") {
      queryData = `SELECT 
      (SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedInDeail) AS TotalMovedInCount,
      (SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedOutDeail) AS TotalMovedOutCount;`;
    } else {
      queryData = `SELECT 
      (SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedInDeail WHERE community = '${community}') AS TotalMovedInCount,
      (SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedOutDeail WHERE community = '${community}') AS TotalMovedOutCount;`;
    }
    // 执行获取数据的查询
    const resData = await clickhouseDb.query({
      query: queryData,
      format: "JSONEachRow"
    });

    const data = await resData.json();
    let TotalMovedInCount = 0;
    let TotalMovedOutCount = 0;
    if (data) {
      TotalMovedInCount = data[0].TotalMovedInCount;
      TotalMovedOutCount = data[0].TotalMovedOutCount;
    }
    ctx.body = util.success({
      TotalMovedInCount: TotalMovedInCount,
      TotalMovedOutCount: TotalMovedOutCount
    });
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

/**
 * 搬入搬离按条件查询所有人员分页
 */
router.get("/page", async (ctx) => {
  try {
    const { currentPage, pageSize, startDate, endDate, community, moveType } =
      ctx.query;
    let queryData;
    if (moveType === "搬入") {
      // 构建用于获取搬入数据的基本 SQL 查询
      queryData =
        "SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedInDeail";
    } else if (moveType === "搬离") {
      // 构建用于获取搬入数据的基本 SQL 查询
      queryData =
        "SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedOutDeail";
    } else {
      // 构建用于获取总数据的基本 SQL 查询
      queryData =
        "SELECT * FROM ( SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedInDeail WHERE 1=1 UNION ALL SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedOutDeail WHERE 1=1) AS combined_result";
    }

    // 添加基于日期的过滤条件
    if (startDate && endDate && !community) {
      queryData += ` WHERE timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于社区的过滤条件
    if (community && !startDate && !endDate) {
      queryData += ` WHERE community = '${community}'`;
    }
    // 添加基于日期和社区的过滤条件
    if (startDate && endDate && community) {
      queryData += ` WHERE timeStamp BETWEEN '${startDate}' AND '${endDate}' AND community = '${community}'`;
    }

    // 计算数据检索的偏移量
    const offset = (currentPage - 1) * pageSize;
    queryData += ` ORDER BY timeStamp DESC LIMIT ${pageSize} OFFSET ${offset}`;
    console.log("queryData", queryData);
    // 执行获取数据的查询
    const resData = await clickhouseDb.query({
      query: queryData,
      format: "JSONEachRow"
    });

    const data = await resData.json();

    let queryCount;
    if (moveType === "搬入") {
      // 构建用于获取搬入总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedInDeail";
    } else if (moveType === "搬离") {
      // 构建用于获取搬离总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedOutDeail";
    } else {
      // 构建用于获取搬入搬离总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(idCard) FROM ( SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedInDeail WHERE 1=1 UNION ALL SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedOutDeail WHERE 1=1 ) AS combined_result";
    }

    // 添加基于日期的过滤条件
    if (startDate && endDate && !community) {
      queryCount += ` WHERE timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于社区的过滤条件
    if (community && !startDate && !endDate) {
      queryCount += ` WHERE community = '${community}'`;
    }

    // 添加基于日期的过滤条件
    if (startDate && endDate && community) {
      queryCount += ` WHERE timeStamp BETWEEN '${startDate}' AND '${endDate}' AND community = '${community}'`;
    }

    // 执行获取总记录数的查询
    const resCount = await clickhouseDb.query({
      query: queryCount,
      format: "JSON"
    });
    // 解析总记录数
    const responseJson = JSON.parse(await resCount.text());
    const countValue =
      responseJson.data[0]["uniqExact(idCard)"] ||
      responseJson.data[0]["count(idCard)"];
    const totalCount = parseInt(countValue, 10);
    const pageCount = Math.ceil(totalCount / parseInt(pageSize, 10));

    ctx.body = util.success({
      data,
      pageCount: isNaN(pageCount) ? "0" : parseInt(pageCount),
      total: totalCount,
      currentPage: parseInt(currentPage, 10)
    });
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

/**
 * 按条件查询搬入搬离人员个人分页
 */
router.get("/personalPage", async (ctx) => {
  try {
    const { currentPage, pageSize, startDate, endDate, idCard } = ctx.query;

    // 构建用于获取数据的基本 SQL 查询
    let queryData = "SELECT * FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryData += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (idCard) {
      queryData += ` AND idCard = '${idCard}'`;
    }

    // 计算数据检索的偏移量
    const offset = (currentPage - 1) * pageSize;
    queryData += ` ORDER BY timeStamp DESC LIMIT ${pageSize} OFFSET ${offset}`;

    // 执行获取数据的查询
    const resData = await clickhouseDb.query({
      query: queryData,
      format: "JSONEachRow"
    });

    const data = await resData.json();

    // 构建用于获取总记录数的基本 SQL 查询
    let queryCount = "SELECT COUNT() FROM facedev.kePersonnel WHERE 1=1";

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryCount += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (idCard) {
      queryCount += ` AND idCard = '${idCard}'`;
    }

    // 执行获取总记录数的查询
    const resCount = await clickhouseDb.query({
      query: queryCount,
      format: "JSON"
    });

    // 解析总记录数
    const responseJson = JSON.parse(await resCount.text());
    const countValue = responseJson.data[0]["count()"];
    const totalCount = parseInt(countValue, 10);
    const pageCount = Math.ceil(totalCount / parseInt(pageSize, 10));

    ctx.body = util.success({
      data,
      pageCount: isNaN(pageCount) ? "0" : parseInt(pageCount),
      total: totalCount,
      currentPage: parseInt(currentPage, 10)
    });
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
