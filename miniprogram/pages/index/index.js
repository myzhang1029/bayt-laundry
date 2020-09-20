// miniprogram/pages/index/index.js

var oper = require("../../scripts/operations.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "Welcome to\nBayt Laundry Manager!",
    subtitle: "Get notified when your laundry is done or someone else is willing to use the machine!",
    showWait: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(oper);
    wx.login({
      success: res => {
        if (res.code) {
          console.log(res);
        } else {
          console.log('Login failed: ' + res.errMsg);
          this.setData({
            error: "Failed to login! Please restart program or contact developer."
          });
        }
      }
    });
    oper.is_registered().then(resp => {
      console.log("is_registered returned:");
      console.log(resp);
      if (resp) {
        /* Goto control page */
        wx.navigateTo({
          url: "/pages/controlMachine/controlMachine"
        });
      } else {
        console.log("enter");
        /* Wait for user to click register */
        this.setData({
          showWait: false
        });
      }
    }).catch(resp => {
      console.log("is_registered failed:");
      console.log(resp);
      this.setData({
        error: "Something unexpected happened! Please try again!"
      });
    });
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
  }
});
