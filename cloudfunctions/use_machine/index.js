const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  console.log("Enter");
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
    console.log("Has plannedEndTime!");
    return await usageDb.where({
      _id: event.machineID
    }).get().then(async res => {
      const machine = res.data;
      if (machine.length == 0 || machine[0].curUid == null) {
        console.log("No original entry!");
        usageDb.doc(event.machineID).set({
          data: {
            curUid: OPENID,
            curStartTime: Date(),
            plannedEndTime: event.plannedEndTime
          }
        });
        return true;
      } else if (machine[0].curUid == OPENID) {
        console.log("Has my entry!");
        usageDb.doc(event.machineID).set({
          data: {
            plannedEndTime: event.plannedEndTime
          }
        });
        return true;
      } else {
        console.log("Has others' entry!");
        return await db.collection("user").where({
          _id: machine[0].curUid
        }).get().then(res2 => {
          return res2.data[0] + machine[0];
        });
      }
    });
  } else {
    console.log("No plannedEndTime!");
    return await usageDb.where({
      _id: event.machineID
    }).get().then(async res1 => {
      if (res1.data[0].curUid == OPENID) {
        usageDb.doc(event.machineID).set({
          data: {
            curUid: null,
            oldUid: OPENID,
            curStartTime: null,
            oldStartTime: res1.data[0].curStartTime,
            plannedEndTime: null,
            actualEndTime: Date()
          }
        });
      }
      /* else: look up userInfo */
      return await db.collection("user").where({
        _id: res1.data[0].curUid
      }).get().then(res2 => {
        return res2.data[0] + res1.data[0];
      });
    });
  }
}
