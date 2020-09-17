const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const userInfo = cloud.getWXContext();
  const openid = userInfo.OPENID;
  /* The record to be creaed/updated */
  const dbData = {
    userName: event.userName,
    roomNumber: event.roomNumber,
    notify1: event.notify1,
    notify2: event.notify2
  };
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
  /* This code works for both creation and update */
  await db.collection("users").doc(openid).set({
    data: dbData
  });
  return true;
}
