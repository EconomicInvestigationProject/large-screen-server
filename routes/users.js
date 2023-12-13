/**
 * 用户管理模块
 */
const router = require("koa-router")();
const util = require("./../utils/util");
const clickhouseDb = require("../config/clickhouse");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
router.prefix("/users");

// 用户登录
router.post("/login", async (ctx) => {
  try {
    const { userName, userPwd } = ctx.request.body;
    /**
     * 返回数据库指定字段，有三种方式
     * 1. 'userId userName userEmail state role deptId roleList'
     * 2. {userId:1,_id:0}
     * 3. select('userId')
     */
    let res = await clickhouseDb.query({
      query: `
       SELECT userName, userPwd FROM facedev.users
        WHERE userName = '${userName}' AND userPwd = '${md5(userPwd)}';
      `,
      format: "JSONEachRow"
    });
    const dataset = await res.json();
    if (dataset) {
      const data = dataset[0];

      const token = jwt.sign(
        {
          data
        },
        "imooc",
        { expiresIn: "1h" }
      );
      data.token = token;
      ctx.body = util.success(data);
    } else {
      ctx.body = util.fail("账号或密码不正确");
    }
  } catch (error) {
    ctx.body = util.fail(error.msg);
  }
});

module.exports = router;
