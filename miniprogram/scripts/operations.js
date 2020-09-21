/* Laundry control operations as defined in Bayt-laundry-design-paper.txt */
/* This is ES2018 code */
/*
   Copyright 2020 Zhang Maiyun.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
"use strict";

var login_openid = undefined;

/** Receive openid (done).
 * @return openid
 */
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
            throw resp;
        });
    }
    return login_openid;
}

/** Make sure a machine's database entry exists (done).
 * @param db(Database) The database to operate.
 * @param machineID(str) ID of the machine.
 * @return Promise that resolves to the doc of the machine.
 */
async function ensure_machine(db, machineID) {
    if (!machineID) {
        throw `machineID cannot be ${machineID}`;
    }
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
    }).then(() => doc);
}

/** Look up userInfo by uid (done).
 * @param uid(str) The uid to look up.
 * @return userInfo if found, null otherwise.
 */
async function lookup_user_info(uid) {
    if (!uid) {
        return uid;
    }
    const db = wx.cloud.database();
    return db.collection("users")
        .doc(uid)
        .get()
        .then(resp => resp.data)
        .catch(() => null);
}

/** Register/Update user info assosiated to the Wechat openid (done).
 * @param data userInfo Object (see design paper).
*/
async function register(data) {
    const openid = login();
    /* The record to be created/updated */
    const dbData = {
        userName: data.userName,
        roomNumber: data.roomNumber,
        notify1: data.notify1,
        notify2: data.notify2
    };
    const db = wx.cloud.database();
    /* This code works for both creation and update */
    return db.collection("users").doc(openid).set({
        data: dbData
    });
}

/** Check if the current user is registered (done).
 * @return userInfo if registered, false otherwise.
 */
async function is_registered() {
    const openid = login();
    const db = wx.cloud.database();
    const lkup = db.collection("users").where({
        _id: openid
    });
    return lkup.count()
        .then(count => count.total == 0 ? false : lkup.get())
        .then(datas => datas ? datas.data[0] : false);
}

/** Check who is using/used the machine (done).
 * @param machineID(str) Id of the machine to look up.
 * @param allow_prev(bool) Whether I should return the previous usage if the current one is null.
 * @return The usageInfo of the current usage if currently someone is using it;
 *         the usageInfo of the previous usage if currently no one is using it and @p allow_prev is true.
 *         null otherwise.
 */
async function whos_using(machineID, allow_prev) {
    const db = wx.cloud.database();
    return ensure_machine(db, machineID).then(resp => resp.get())
        .then(resp => {
            if (resp.data.cur.uid) {
                return resp.data.cur.uid;
            } else if (allow_prev) {
                /* No need to test whether resp.previous.uid is null here */
                return resp.data.previous.uid;
            } else {
                return null;
            }
        }).then(lookup_user_info);
}

/** Machine Check-in or check-out.
 * @param machineID ID of the machine to operate.
 * @param[optional] plannedEndTime Planned end time of the laundry.
 * @return true if succeeded, {code:1, ...usageInfo}  if
 *         someone else is using it, {code:2, errMsg} if failed.
 * @note If an entry by the user him/herself exists and @p plannedEndTime
 *       is unspecified, the usage is ended; if @p plannedEndTime exists,
 *       the usage is extended, if the new value has passed, a code of 2 is
 *       returned.
 */
async function use_machine(machineID, plannedEndTime) {
    const openid = login();
    const db = wx.cloud.database();
    var machineDoc;
    return ensure_machine(db, machineID).then(resp => {
        /* Get the current info of the machine. */
        machineDoc = resp;
        return resp.get();
    }).then(resp => {
        /* Create data to be updaed into machineDoc. */
        if (resp.cur.uid == null && plannedEndTime) {
            return {
                cur: {
                    uid: openid,
                    startTime: Date(),
                    plannedEndTime: plannedEndTime
                }
            };
        } else if (resp.cur.uid == openid && plannedEndTime) {
            return {
                cur: {
                    plannedEndTime: plannedEndTime
                }
            };
        } else if (resp.cur.uid == openid) {
            return {
                previous: {
                    uid: resp.cur.uid,
                    startTime: resp.cur.startTime,
                    actualEndTime: Date()
                },
                cur: {
                    uid: null,
                    startTime: null,
                    plannedEndTime: null
                }
            };
        } else {
            return {...whos_using(machineID, true), code: 1 };
        }
    }).then(data => {
        /* Update machineInfo with provided data */
        if (data.code == 1) {
            /* Don't pass userInfo into .update() */
            return data;
        }
        return machineDoc.update({
            data: data
        });
    }).catch(resp => ({...resp, code: 2 }));
}

/** Get a list of usageInfos related to the current user (done).
 * @return List of usageInfos.
 */
async function get_my_laundries() {
    const openid = login();
    const db = wx.cloud.database();
    const lkup = db.collection("usage").where({
        "cur.uid": openid
    });
    return lkup.get().then(resp => resp.data.map(async item => {
        var userInfo = await is_registered();
        return {...item.cur, ...userInfo};
    }));
}

export { login, ensure_machine, lookup_user_info, register, is_registered, whos_using, use_machine, get_my_laundries };
