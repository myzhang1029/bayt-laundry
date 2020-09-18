// miniprogram/pages/controlMachine/controlMachine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "Machine Control",
    subtitle: "",
    showAfterMidnightNotice: false,
    /* TODO: Find real location for the images */
    machines: [
      /* Boy side */
      {
        name: "w1",
        location: ["10rpx", "2rpx"],
        handlerName: "w1Click"
      },
      {
        name: "w2",
        location: ["12rpx", "2rpx"],
        handlerName: "w2Click"
      },
      {
        name: "d1",
        location: ["15rpx", "2rpx"],
        handlerName: "d1Click"
      },
      {
        name: "d2",
        location: ["1rpx", "2rpx"],
        handlerName: "d2Click"
      },
      {
        name: "w3",
        location: ["13rpx", "2rpx"],
        handlerName: "w3Click"
      },
      /* Girl side */
      {
        name: "w4",
        location: ["19rpx", "2rpx"],
        handlerName: "w4Click"
      },
      {
        name: "w5",
        location: ["24rpx", "2rpx"],
        handlerName: "w5Click"
      },
      {
        name: "d3",
        location: ["45rpx", "2rpx"],
        handlerName: "d3Click"
      },
      {
        name: "d4",
        location: ["50rpx", "2rpx"],
        handlerName: "d4Click"
      },
      {
        name: "w6",
        location: ["60rpx", "2rpx"],
        handlerName: "w6Click"
      }
    ],
    buttons: [{
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
  open: function () {
    this.setData({
      showAfterMidnightNotice: true
    });
  },
  buttontap(e) {
    console.log(e.detail);
  }
});
