/**
 * 搬入搬离人员接口
 */

const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");

router.prefix("/moveInout");

/**
 * 搬入搬离人员分页
 */

router.get("/page", async (ctx) => {
  try {
    const { currentPage, pageSize, startDate, endDate, community, moveType } =
      ctx.query;
    let queryData;
    if (moveType === "搬入") {
      // 构建用于获取搬入数据的基本 SQL 查询
      queryData =
        "SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedInDeail WHERE 1=1";
    } else if (moveType === "搬出") {
      // 构建用于获取搬入数据的基本 SQL 查询
      queryData =
        "SELECT DISTINCT ON (idCard) * FROM facedev.peopleMovedOutDeail WHERE 1=1";
    } else {
      // 构建用于获取总数据的基本 SQL 查询
      queryData =
        "SELECT DISTINCT ON (idCard) * FROM ( SELECT * FROM facedev.peopleMovedInDeail UNION SELECT * FROM facedev.peopleMovedOutDeail) AS combined_result WHERE 1=1";
    }

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryData += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (community) {
      queryData += ` AND community = '${community}'`;
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

    let queryCount;
    if (moveType === "搬入") {
      // 构建用于获取搬入总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedInDeail WHERE 1=1";
    } else if (moveType === "搬出") {
      // 构建用于获取搬出总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(DISTINCT idCard) FROM facedev.peopleMovedInDeail WHERE 1=1";
    } else {
      // 构建用于获取搬入搬出总记录数的基本 SQL 查询
      queryCount =
        "SELECT COUNT(DISTINCT idCard) FROM (  SELECT * FROM facedev.peopleMovedInDeail  UNION     SELECT * FROM peopleMovedOutDeail) AS combined_result";
    }

    // 添加基于日期的过滤条件
    if (startDate && endDate) {
      queryCount += ` AND timeStamp BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 添加基于类型的过滤条件
    if (community) {
      queryCount += ` AND community = '${community}'`;
    }

    // 执行获取总记录数的查询
    const resCount = await clickhouseDb.query({
      query: queryCount,
      format: "JSON"
    });

    // 解析总记录数
    const responseJson = JSON.parse(await resCount.text());
    const countValue = responseJson.data[0]["uniqExact(idCard)"];
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
