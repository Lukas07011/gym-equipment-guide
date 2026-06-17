const { equipment } = require("../../data/equipment");

Page({
  data: {
    item: null,
    isFavorite: false
  },

  onLoad(options) {
    const item = equipment.find((entry) => entry.id === options.id);
    const favorites = wx.getStorageSync("favoriteEquipment") || [];

    if (item) {
      this.setData({
        item: {
          ...item,
          bodyPartsText: item.bodyParts.join(" / ")
        },
        isFavorite: favorites.includes(item.id)
      });
    }
  },

  toggleFavorite() {
    if (!this.data.item) return;
    const favorites = wx.getStorageSync("favoriteEquipment") || [];
    const id = this.data.item.id;
    const exists = favorites.includes(id);
    const next = exists ? favorites.filter((item) => item !== id) : [...favorites, id];

    wx.setStorageSync("favoriteEquipment", next);
    this.setData({ isFavorite: !exists });
    wx.showToast({
      title: exists ? "已取消收藏" : "已收藏",
      icon: "success"
    });
  }
});
