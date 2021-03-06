// miniprogram/pages/alterSettings/alterSettings.js

var oper = require("../../scripts/operations.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "Settings",
    subtitle: "Almost there!",
    showWait: false,
    checkboxItems: [{
      name: "Notification when my laundry is done.",
      value: "0",
      checked: true
    }, {
      name: "Notification when you might use a washing machine (feature in progress).",
      value: "1",
      checked: true
    }],
    formData: {

    },
    rules: [{
      name: "userName",
      rules: [{
        required: true,
        message: "Name is required."
      }]
    }, {
      name: "roomNumber",
      rules: [{
        required: true,
        message: "Room number is required."
      }, {
        minlength: 4,
        message: "Room number is invalid."
      }, {
        maxlength: 4,
        message: "Room number is invalid."
      }]
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    oper.is_registered().then(res => {
      console.log("is_registered returned:");
      console.log(res);
      if (res) {
        /* Pre-fill the form */
        this.setData({
          subtitle: "",
          formData: {
            userName: res.userName,
            roomNumber: res.roomNumber
          },
          checkboxItems: [{
            name: "Notification when my laundry is done.",
            value: "0",
            checked: res.notify1
          }, {
            name: "Notification when you might use a washing machine (feature in progress).",
            value: "1",
            checked: res.notify2
          }]
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

  checkboxChange: function (e) {
    console.log("Checkbox changed to:", e.detail.value);

    var checkboxItems = this.data.checkboxItems,
      values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems,
      [`formData.checkbox`]: e.detail.value
    });
  },

  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  submitForm: function () {
    this.selectComponent("#form").validate((valid, errors) => {
      console.log("Form validity is", valid, "reason is", errors);
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          });
        } else {
          this.setData({
            error: "Something unexpected happened! Please try again!"
          });
        }
        return;
      }
      this.setData({
        showWait: true
      });
      oper.register({
        userName: this.data.formData.userName,
        roomNumber: this.data.formData.roomNumber,
        notify1: this.data.checkboxItems[0].checked,
        notify2: this.data.checkboxItems[1].checked
      }).then(resp => {
        console.log("Register succeeded:");
        console.log(resp);
        // Goto control page
        wx.navigateTo({
          url: "/pages/controlMachine/controlMachine"
        });
      }).catch(resp => {
        console.log("Register failed:");
        console.log(resp);
        this.setData({
          error: "Register failed! Please try again!"
        });
      }).finally(() => {
        this.setData({
          showWait: false
        });
      });
    });
  }
});
