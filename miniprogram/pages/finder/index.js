const { equipment, bodyParts, featureOptions } = require("../../data/equipment");

Page({
  data: {
    bodyParts,
    featureOptions,
    selectedBody: "全部",
    selectedFeatures: [],
    selectedFeaturesMap: {},
    matches: [],
    progressTitle: "先观察器械",
    progressPercent: 20,
    progressCopy: "选一个训练部位，再勾选 1-3 个明显特征，结果会更准。",
    resultTitle: "先给你一些常见器械",
    isFocused: false
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
    const hasBody = selectedBody !== "全部";
    const selectedCount = selectedFeatures.length;
    const matches = equipment
      .map((item) => {
        const bodyScore = selectedBody === "全部" || item.bodyParts.includes(selectedBody) ? (hasBody ? 2 : 1) : 0;
        const matchedFeatures = selectedFeatures.filter((feature) => item.features.includes(feature));
        const score = bodyScore + matchedFeatures.length;
        const confidence = score >= 4 ? "高" : score >= 2 ? "中" : "低";
        return {
          ...item,
          score,
          confidence,
          matchedTags: [
            ...(bodyScore ? [selectedBody === "全部" ? "常见" : selectedBody] : []),
            ...matchedFeatures
          ].slice(0, 4)
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const progressPercent = Math.min(100, 20 + (hasBody ? 35 : 0) + Math.min(selectedCount, 3) * 15);
    const isFocused = hasBody || selectedCount > 0;
    const progressTitle = progressPercent >= 80 ? "可以确认了" : isFocused ? "正在缩小范围" : "先观察器械";
    const progressCopy = progressPercent >= 80
      ? "现在可以点开最可能的器械，对照详情确认是不是眼前这台。"
      : isFocused
        ? "继续补充一个最明显的外观特征，结果会更靠近真实器械。"
        : "选一个训练部位，再勾选 1-3 个明显特征，结果会更准。";
    const resultTitle = isFocused ? "可能是这些" : "先给你一些常见器械";

    this.setData({ matches, progressPercent, progressTitle, progressCopy, resultTitle, isFocused });
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
