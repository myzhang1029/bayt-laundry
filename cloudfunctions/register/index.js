const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const userInfo = cloud.getWXContext();
  const openid = userInfo.OPENID;
  /* The record to be creaed/updated */
  const dbData = {
    name: event.username,
    roomNumber: event.roomnumber,
    notify1: event.notify1,
    notify2: event.notify2
  };
  var retvalue = {
    dbData: dbData
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
  var usersColl = db.collection("users");
  /* This code works for both creation and update */
  try {
    await usersColl.doc(openid).set({
      data: dbData
    });
  } catch (e) {
    retvalue.error = e;
  }
  return retvalue;
}
