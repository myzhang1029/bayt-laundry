const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const db = cloud.database();
  try {
    await db.createCollection("usage");
  }
  catch (e) {
    if (e.errCode != -501001) /* not Table Exists */ {
      throw e;
    }
  }
  const lkup = db.collection("usage").where({
    curUid: OPENID
  });
  const datas = await lkup.get();
  return datas.data;
}
