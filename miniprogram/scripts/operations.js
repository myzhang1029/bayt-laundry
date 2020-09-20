/* Laundry control operations as defined in Bayt-laundry-design-paper.txt */
'use strict';

var login_openid = undefined;

function login() {
    if (login_openid === undefined) {
        wx.cloud.callFunction({
            name: "login",
            data: {},
        }).then(resp => {
            console.log("login cloudFunction returned:");
            console.log(resp);
            login_openid = resp.result.openid;
        }).catch(resp => {
            console.log("login failed:");
            console.log(resp);
        });
    }
    return login_openid;
}

/** Make sure a machine's database entry exists (done)
 * @param machineID(str) ID of the machine.
 * @return Promise
 */
async function ensureMachine(machineID) {
    const db = wx.cloud.database();
    const usageDb = db.collection("usage");
    const doc = usageDb.doc(machineID);
    /* Data to be put into an empty machine */
    const emptyMachine = {
        cur: {
            uid: null,
            startTime: null,
            plannedEndTime: null
        },
        previous: {
            uid: null,
            startTime: null,
            actualEndTime: null
        }
    };
    return doc.get().catch(error => {
        if (error.errCode == -1) {/* doc doesn't exist */
            return doc.set({
                data: emptyMachine
            });
        } else {
            throw error;
        }
    });
}

async function register(data) {
    const OPENID = login();
    /* The record to be created/updated */
    const dbData = {
        userName: data.userName,
        roomNumber: data.roomNumber,
        notify1: data.notify1,
        notify2: data.notify2
    };
    const db = wx.cloud.database()
    /* This code works for both creation and update */
    return db.collection("users").doc(OPENID).set({
        data: dbData
    });
}

async function get_my_laundries() {
    const OPENID = login();
    const db = wx.cloud.database();
    const lkup = db.collection("usage").where({
        "cur.uid": OPENID
    });
    return lkup.get().then(res => {
        return res.data
    });
}

async function is_registered() {
    const OPENID = login();
    const db = wx.cloud.database();
    const lkup = db.collection("users").where({
        _id: OPENID
    });
    return lkup.count().then(count => {
        if (count.total == 0) {
            return false;
        } else {
            return lkup.get();
        }
    }).then(datas => {
        return datas ? datas.data[0] : false;
    });
}

export { login, register, get_my_laundries, is_registered };
