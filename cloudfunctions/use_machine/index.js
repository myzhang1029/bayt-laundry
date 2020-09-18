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
  const self_lkup = usageDb.where({
    machineID: event.machineID
  });
  const count = await self_lkup.count();
  if (count.total == 0)
  {
    /* doesn't exist */
    const data = {
      curUid: OPENID,
      curStartTime: Date(),
      curPlannedEndTime: event.plannedEndTime
    }
    usageDb.doc(event.)
  }
  const datas = await lkup.get();
  return datas.data[0];
}
