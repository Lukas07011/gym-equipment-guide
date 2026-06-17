const { equipment } = require("../../data/equipment");

Page({
  data: {
    favorites: [],
    favoriteItems: [],
    equipmentCount: equipment.length,
    featuredItems: equipment.slice(0, 4).map((item) => ({
      ...item,
      bodyPartsText: item.bodyParts.join(" / ")
    }))
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    const favorites = wx.getStorageSync("favoriteEquipment") || [];
    const favoriteItems = equipment
      .filter((item) => favorites.includes(item.id))
      .map((item) => ({
        ...item,
        bodyPartsText: item.bodyParts.join(" / ")
      }));

    this.setData({ favorites, favoriteItems });
  },

  goFinder() {
    wx.switchTab({ url: "/pages/finder/index" });
  },

  goLibrary() {
    wx.switchTab({ url: "/pages/library/index" });
  },

  openDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
