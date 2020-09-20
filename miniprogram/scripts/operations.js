/* Laundry control operations as defined in Bayt-laundry-design-paper.txt */
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
 * @param machineID(str) ID of the machine.
 * @return Promise that resolves to the doc of the machine.
 */
async function ensure_machine(machineID) {
    if (!machineID) {
        throw `machineID cannot be ${machineID}`;
    }
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
    }).then(() => {
        return doc;
    })
}

/** Look up userInfo by uid (done).
 * @param uid(str) The uid to look up.
 * @return userInfo if found, null otherwise.
 */
async function lookup_user_info(uid) {
    if (!uid) {
        return uid;
    }
    const db = wx.cloud.database()
    return db.collection("users").doc(uid).get().then(resp => {
        return resp.data;
    }).catch(resp => {
        return false;
    });
}

/** Register/Update user info assosiated to the Wechat openid (done).
 * @param data userInfo Object (see design paper).
*/
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

/** Check if the current user is registered (done).
 * @return userInfo if registered, false otherwise.
 */
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

/** Check who is using/used the machine (done).
 * @param machineID(str) Id of the machine to look up.
 * @param allow_prev(bool) Whether I should return the previous usage if the current one is null.
 * @return The usageInfo of the current usage if currently someone is using it;
 *         the usageInfo of the previous usage if currently no one is using it and @p allow_prev is true.
 *         null otherwise.
 */
async function whos_using(machineID, allow_prev) {
    const db = wx.cloud.database();
    return ensure_machine(machineID).then(resp => {
        return resp.get()
    }).then(resp => {
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

/** Get a list of usageInfos related to the current user
 * @return List of usageInfos
 */
async function get_my_laundries() {
    const OPENID = login();
    const db = wx.cloud.database();
    const lkup = db.collection("usage").where({
        "cur.uid": OPENID
    });
    return lkup.get().then(resp => {
        return resp.data /* TODO Convert to usageInfo */
    });
}

export { login, ensure_machine, lookup_user_info, register, is_registered, whos_using, get_my_laundries };
