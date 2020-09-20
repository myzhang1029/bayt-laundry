// miniprogram/pages/controlMachine/controlMachine.js

var oper = require("../../scripts/operations.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "Machine Control",
    subtitle: "",
    usageString: "Click on the machine to see who is using it, check in your own usage or check out. Click \"Settings\" to review your settings.",
    showAfterMidnightNotice: false,
    machineBaseCSS: "height:7vh;position:relative;z-index:2;",
    /* TODO: Find real location for the images */
    machines: [
      /* Boy side */
      {
        name: "w1",
        location: ["-52vh", "-14vh"]
      },
      {
        name: "w2",
        location: ["-61vh", "-14vh"]
      },
      {
        name: "d1",
        location: ["-70vh", "-14vh"]
      },
      {
        name: "d2",
        location: ["-79vh", "-14vh"]
      },
      {
        name: "w3",
        location: ["-74vh", "6vh"]
      },
      /* Girl side */
      {
        name: "w4",
        location: ["-8.5vh", "14vh"]
      },
      {
        name: "w5",
        location: ["-17.5vh", "14vh"]
      },
      {
        name: "d3",
        location: ["-26.5vh", "14vh"]
      },
      {
        name: "d4",
        location: ["-35.5vh", "14vh"]
      },
      {
        name: "w6",
        location: ["-30.5vh", "-6vh"]
      }
    ],
    buttonsSUD: [{
      type: "primary",
      className: "",
      text: "OK",
      value: 1
    }],
    buttonsSAMN: [{
      type: "default",
      className: "",
      text: "I'll use anyway",
      value: 0
    },
    {
      type: "primary",
      className: "",
      text: "Sure, I see",
      value: 1
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  gotoSettings: function () {
    /* Goto control page */
    wx.navigateTo({
      url: "/pages/alterSettings/alterSettings"
    });
  },

  showUD: function () {
    this.setData({
      showUsageDialog: true
    });
  },

  tapUD: function () {
    this.setData({
      showUsageDialog: false
    });
  },

  buttontap: function (e) {
    console.log(e.detail);
  },

  machineClick: function (cont) {
    console.log(cont);
    wx.cloud.callFunction({
      name: "is_registered",
      data: {},
      success: resp => {
        const values = resp.result;
        console.log("is_register returned:");
        console.log(resp);
        if (!values) {
          console.log("Code fault: not registered");
          this.setData({
            error: "Something unexpected happened! Please re-enter the program!"
          });
        }
        const machineID = values.roomNumber.slice(0, 2) + "-" + cont.target.id;
        console.log("Click on machine: ", machineID);
        wx.cloud.callFunction({
          name: "use_machine",
          data: {
            machineID: machineID,
            //plannedEndTime: Date()
          },
          complete: resp => {
            console.log("use_machine returned:");
            console.log(resp);
          }
        });
      },
      fail: resp => {
        console.log("is_registered failed:");
        console.log(resp);
        this.setData({
          error: "Something unexpected happened! Please try again!"
        });
      }
    });
  }
});
