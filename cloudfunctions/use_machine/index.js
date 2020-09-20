const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
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
  /* Ensure the collection exists */
  try {
    await db.createCollection("usage");
  }
  catch (e) {
    if (e.errCode != -501001) /* not Table Exists */ {
      throw e;
    }
  }
  const usageDb = db.collection("usage");
  if (event.plannedEndTime) {
    return await usageDb.where({
      _id: event.machineID
    }).get().then(res => {
      const machine = res.data;
      if (machine.length == 0 || machine[0].curUid == null) {
        usageDb.doc(event.machineID).set({
          curUid: OPENID,
          curStartTime: Date(),
          curPlannedEndTime: event.plannedEndTime
        });
        return true;
      } else if (machine[0].curUid == OPENID) {
        usageDb.doc(event.machineID).set({
          curPlannedEndTime: event.plannedEndTime
        });
        return true;
      } else {
        const usingUserInfo = (await db.collection("user").where({
          _id: machine[0].curUid
        }).get()).data[0]
        return usingUserInfo + machine[0];
      }
    });
  } else {
    return await usageDb.where({
      _id: event.machineID
    }).get().then(res1 => {
      db.collection("user").where({
        _id: machine[0].curUid
      }).get().then(res2 => {
        return res2.data[0] + res1.data[0];
      });
    });
  }
}
