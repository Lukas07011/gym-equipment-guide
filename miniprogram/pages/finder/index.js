const { equipment, bodyParts, featureOptions } = require("../../data/equipment");

Page({
  data: {
    bodyParts,
    featureOptions,
    selectedBody: "全部",
    selectedFeatures: [],
    selectedFeaturesMap: {},
    matches: []
  },

  onLoad() {
    this.updateMatches();
  },

  selectBody(event) {
    this.setData({ selectedBody: event.currentTarget.dataset.value }, () => this.updateMatches());
  },

  toggleFeature(event) {
    const value = event.currentTarget.dataset.value;
    const selected = new Set(this.data.selectedFeatures);
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      selected.add(value);
    }

    const selectedFeatures = Array.from(selected);
    const selectedFeaturesMap = selectedFeatures.reduce((map, item) => {
      map[item] = true;
      return map;
    }, {});

    this.setData({ selectedFeatures, selectedFeaturesMap }, () => this.updateMatches());
  },

  updateMatches() {
    const { selectedBody, selectedFeatures } = this.data;
    const matches = equipment
      .map((item) => {
        const bodyScore = selectedBody === "全部" || item.bodyParts.includes(selectedBody) ? 2 : 0;
        const matchedFeatures = selectedFeatures.filter((feature) => item.features.includes(feature));
        const score = bodyScore + matchedFeatures.length;
        return {
          ...item,
          score,
          matchedTags: [
            ...(bodyScore ? [selectedBody === "全部" ? "全部部位" : selectedBody] : []),
            ...matchedFeatures
          ].slice(0, 4)
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    this.setData({ matches });
  },

  resetFilters() {
    this.setData({
      selectedBody: "全部",
      selectedFeatures: [],
      selectedFeaturesMap: {}
    }, () => this.updateMatches());
  },

  goLibrary() {
    wx.switchTab({ url: "/pages/library/index" });
  },

  openDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
