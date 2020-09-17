const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const userInfo = cloud.getWXContext();
  const openid = userInfo.OPENID;
  const db = cloud.database();
  /* Ensure the collection exists */
  try {
    await db.createCollection("users");
  }
  catch (e) {
    if (e.errCode != -501001) /* not Table Exists */ {
      throw e;
    }
  }
  const count = await db.collection("users").where({
    _id: openid
  }).count();
  if (count.total == 0) {
    return false;
  } else {
    return true;
  }
}
