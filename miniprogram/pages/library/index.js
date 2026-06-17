const { equipment, bodyParts } = require("../../data/equipment");

Page({
  data: {
    keyword: "",
    selectedBody: "全部",
    bodyParts,
    filtered: []
  },

  onLoad() {
    this.updateList();
  },

  onSearch(event) {
    this.setData({ keyword: event.detail.value }, () => this.updateList());
  },

  selectBody(event) {
    this.setData({ selectedBody: event.currentTarget.dataset.value }, () => this.updateList());
  },

  updateList() {
    const keyword = this.data.keyword.trim().toLowerCase();
    const selectedBody = this.data.selectedBody;
    const filtered = equipment
      .filter((item) => selectedBody === "全部" || item.bodyParts.includes(selectedBody))
      .filter((item) => {
        if (!keyword) return true;
        return [item.name, item.motion, ...item.aliases, ...item.features, ...item.bodyParts]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .map((item) => ({
        ...item,
        bodyPartsText: item.bodyParts.join(" / "),
        featuresPreview: item.features.slice(0, 4)
      }));

    this.setData({ filtered });
  },

  openDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
