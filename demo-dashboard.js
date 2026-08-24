// Veld Analytics — interactive dashboard demo (Approach page)
// A small, self-contained "live" example of the kind of reporting we
// build for clients: a KPI strip, a hoverable trend chart with a metric
// switcher, a channel breakdown, a demographics donut, a top-pages
// table, and a channel-group-by-month stacked bar — switching between
// two sample dashboard types (GA4-style web analytics vs. a social
// dashboard). Social carries a platform filter (All platforms /
// Instagram / TikTok / Meta) that re-segments its numbers and swaps the
// breakdown to a content-type split. The data below is illustrative
// only (not wired to a backend) — the point is to give a prospective
// client something to actually click and hover, rather than a static
// screenshot.
//
// Classic (non-module) script, loaded via <script src="js/demo-dashboard.js">
// so it works the same as main.js under file:// — no ES module import
// resolution needed here, so none of the file:// CORS module-script
// restrictions that affect the WebGL effects on this site apply.

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".demo-dashboard");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- GA4 data (unified, no platform split) ----------
  const GA4_METRIC_LABELS = { users: "Users", sessions: "Sessions", clicks: "Clicks", revenue: "Revenue" };

  const GA4_DATA = {
    toolbarLabel: "Marketing overview",
    demographics: [
      { group: "18-24", pct: 14 },
      { group: "25-34", pct: 32 },
      { group: "35-44", pct: 27 },
      { group: "45-54", pct: 16 },
      { group: "55+", pct: 11 },
    ],
    channelMonths: {
      months: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      series: [
        { name: "Organic Search", values: [9656, 9933, 10624, 11098, 11850, 12644] },
        { name: "Paid Search", values: [6816, 6923, 7304, 7518, 7900, 8284] },
        { name: "Direct", values: [5396, 5418, 5644, 6086, 6320, 6540] },
        { name: "Organic Social", values: [2556, 3612, 4980, 6086, 7900, 9592] },
        { name: "Referral", values: [2556, 2709, 2656, 2864, 3160, 3488] },
        { name: "Email", values: [1420, 1505, 1992, 2148, 2370, 3052] },
      ],
    },
    ranges: {
      "7d": {
        stats: [
          { label: "Users", value: "9,850", delta: "4.6%", dir: "up" },
          { label: "Sessions", value: "12,480", delta: "5.1%", dir: "up" },
          { label: "Clicks", value: "3,120", delta: "7.8%", dir: "up" },
          { label: "Revenue", value: "£18,240", delta: "8.2%", dir: "up" },
          { label: "Conversion rate", value: "3.4%", delta: "0.6pp", dir: "up" },
          { label: "Avg. order value", value: "£64.20", delta: "1.2%", dir: "down" },
        ],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        metrics: {
          users: [7668, 8155, 7452, 9126, 9288, 10207, 9850],
          sessions: [9716, 10332, 9442, 11563, 11768, 12932, 12480],
          clicks: [2429, 2583, 2360, 2891, 2942, 3233, 3120],
          revenue: [14200, 15101, 13800, 16900, 17199, 18901, 18240],
        },
        breakdown: [
          { name: "Organic", pct: 38 },
          { name: "Paid", pct: 29 },
          { name: "Direct", pct: 21 },
          { name: "Referral", pct: 12 },
        ],
        topPages: [
          { title: "Homepage", views: 3707 },
          { title: "Shop All Products", views: 2696 },
          { title: "Product: Aurora Desk Lamp", views: 2022 },
          { title: "Pricing", views: 1685 },
          { title: "Blog: 10 Ways to Improve Your Workflow", views: 1516 },
          { title: "About Us", views: 1348 },
          { title: "Contact", views: 1179 },
          { title: "Product: Nomad Backpack", views: 1011 },
          { title: "FAQ", views: 842 },
          { title: "Careers", views: 842 },
        ],
      },
      "30d": {
        stats: [
          { label: "Users", value: "39,600", delta: "8.9%", dir: "up" },
          { label: "Sessions", value: "51,200", delta: "9.8%", dir: "up" },
          { label: "Clicks", value: "12,850", delta: "11.4%", dir: "up" },
          { label: "Revenue", value: "£74,900", delta: "14.7%", dir: "up" },
          { label: "Conversion rate", value: "3.1%", delta: "0.3pp", dir: "up" },
          { label: "Avg. order value", value: "£61.80", delta: "2.4%", dir: "up" },
        ],
        labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        metrics: {
          users: [27493, 30665, 32251, 29079, 33837, 35952, 37538, 36481, 38860, 39600],
          sessions: [35546, 39648, 41698, 37597, 43749, 46483, 48534, 47167, 50243, 51200],
          clicks: [8921, 9951, 10465, 9436, 10980, 11666, 12181, 11838, 12610, 12850],
          revenue: [52000, 58001, 61000, 55000, 64000, 68000, 71000, 69000, 73500, 74900],
        },
        breakdown: [
          { name: "Organic", pct: 41 },
          { name: "Paid", pct: 26 },
          { name: "Direct", pct: 19 },
          { name: "Referral", pct: 14 },
        ],
        topPages: [
          { title: "Homepage", views: 15207 },
          { title: "Shop All Products", views: 11059 },
          { title: "Product: Aurora Desk Lamp", views: 8294 },
          { title: "Pricing", views: 6912 },
          { title: "Blog: 10 Ways to Improve Your Workflow", views: 6221 },
          { title: "About Us", views: 5530 },
          { title: "Contact", views: 4838 },
          { title: "Product: Nomad Backpack", views: 4147 },
          { title: "FAQ", views: 3456 },
          { title: "Careers", views: 3456 },
        ],
      },
      "90d": {
        stats: [
          { label: "Users", value: "112,400", delta: "15.9%", dir: "up" },
          { label: "Sessions", value: "148,900", delta: "17.2%", dir: "up" },
          { label: "Clicks", value: "37,200", delta: "19.6%", dir: "up" },
          { label: "Revenue", value: "£218,600", delta: "22.3%", dir: "up" },
          { label: "Conversion rate", value: "3.6%", delta: "0.9pp", dir: "up" },
          { label: "Avg. order value", value: "£66.50", delta: "4.1%", dir: "up" },
        ],
        labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        metrics: {
          users: [77127, 81241, 83298, 87925, 92038, 95123, 98723, 101808, 105407, 107978, 110035, 112400],
          sessions: [102173, 107622, 110347, 116477, 121926, 126013, 130781, 134868, 139636, 143042, 145767, 148900],
          clicks: [25526, 26887, 27568, 29100, 30461, 31482, 32673, 33694, 34886, 35736, 36417, 37200],
          revenue: [150000, 158000, 162000, 171000, 178999, 185000, 192000, 198000, 205000, 210000, 214000, 218600],
        },
        breakdown: [
          { name: "Organic", pct: 44 },
          { name: "Paid", pct: 24 },
          { name: "Direct", pct: 18 },
          { name: "Referral", pct: 14 },
        ],
        topPages: [
          { title: "Homepage", views: 44223 },
          { title: "Shop All Products", views: 32162 },
          { title: "Product: Aurora Desk Lamp", views: 24122 },
          { title: "Pricing", views: 20102 },
          { title: "Blog: 10 Ways to Improve Your Workflow", views: 18091 },
          { title: "About Us", views: 16081 },
          { title: "Contact", views: 14071 },
          { title: "Product: Nomad Backpack", views: 12061 },
          { title: "FAQ", views: 10051 },
          { title: "Careers", views: 10051 },
        ],
      },
    },
  };

  // ---------- Social platform data ----------
  // "all" = whole social presence. instagram/tiktok/meta are that
  // platform's slice, with its own content-type breakdown in place of
  // the "all" view's platform-mix breakdown.
  const SOCIAL_PLATFORMS = {
    all: {
      label: "All platforms",
      breakdownLabel: "Platform breakdown",
      ranges: {
        "7d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "24,180", delta: "3.8%", dir: "up" },
            { label: "Engagement rate", value: "4.7%", delta: "0.4pp", dir: "up" },
            { label: "Impressions", value: "186,400", delta: "11.2%", dir: "up" },
            { label: "Link clicks", value: "2,340", delta: "6.5%", dir: "up" },
            { label: "Reach", value: "121,200", delta: "9.8%", dir: "up" },
            { label: "Profile visits", value: "1,180", delta: "8.4%", dir: "up" },
          ],
          trend: [22400, 24100, 21600, 27300, 29800, 31200, 30000],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          breakdown: [
            { name: "Instagram", pct: 46 },
            { name: "TikTok", pct: 28 },
            { name: "LinkedIn", pct: 17 },
            { name: "X", pct: 9 },
          ],
        },
        "30d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "24,180", delta: "9.1%", dir: "up" },
            { label: "Engagement rate", value: "4.4%", delta: "0.2pp", dir: "down" },
            { label: "Impressions", value: "742,900", delta: "18.6%", dir: "up" },
            { label: "Link clicks", value: "9,120", delta: "14.3%", dir: "up" },
            { label: "Reach", value: "483,000", delta: "16.2%", dir: "up" },
            { label: "Profile visits", value: "4,650", delta: "15.9%", dir: "up" },
          ],
          trend: [58000, 64000, 71000, 68000, 79000, 85000, 91000, 88000, 96000, 102000],
          labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
          breakdown: [
            { name: "Instagram", pct: 44 },
            { name: "TikTok", pct: 31 },
            { name: "LinkedIn", pct: 16 },
            { name: "X", pct: 9 },
          ],
        },
        "90d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "24,180", delta: "21.4%", dir: "up" },
            { label: "Engagement rate", value: "5.1%", delta: "0.6pp", dir: "up" },
            { label: "Impressions", value: "2.1M", delta: "34.7%", dir: "up" },
            { label: "Link clicks", value: "28,600", delta: "29.8%", dir: "up" },
            { label: "Reach", value: "1.4M", delta: "31.5%", dir: "up" },
            { label: "Profile visits", value: "14,200", delta: "27.3%", dir: "up" },
          ],
          trend: [140000, 152000, 161000, 175000, 183000, 196000, 208000, 219000, 231000, 244000, 256000, 268000],
          labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
          breakdown: [
            { name: "Instagram", pct: 42 },
            { name: "TikTok", pct: 34 },
            { name: "LinkedIn", pct: 15 },
            { name: "X", pct: 9 },
          ],
        },
      },
    },
    instagram: {
      label: "Instagram",
      breakdownLabel: "Content type breakdown",
      contentBreakdown: [
        { name: "Reels", pct: 52 },
        { name: "Feed posts", pct: 31 },
        { name: "Stories", pct: 17 },
      ],
      ranges: {
        "7d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "11,123", delta: "12.4%", dir: "up" },
            { label: "Engagement rate", value: "5.4%", delta: "0.5pp", dir: "up" },
            { label: "Impressions", value: "85,744", delta: "16.8%", dir: "up" },
            { label: "Link clicks", value: "1,076", delta: "14.2%", dir: "up" },
            { label: "Reach", value: "55,752", delta: "15.1%", dir: "up" },
            { label: "Profile visits", value: "543", delta: "13.6%", dir: "up" },
          ],
          trend: [10304, 11086, 9936, 12558, 13708, 14352, 13800],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        "30d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "10,639", delta: "12.4%", dir: "up" },
            { label: "Engagement rate", value: "5.1%", delta: "0.5pp", dir: "up" },
            { label: "Impressions", value: "326,876", delta: "16.8%", dir: "up" },
            { label: "Link clicks", value: "4,013", delta: "14.2%", dir: "up" },
            { label: "Reach", value: "212,520", delta: "15.1%", dir: "up" },
            { label: "Profile visits", value: "2,046", delta: "13.6%", dir: "up" },
          ],
          trend: [25520, 28160, 31240, 29920, 34760, 37400, 40040, 38720, 42240, 44880],
          labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        },
        "90d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "10,156", delta: "12.4%", dir: "up" },
            { label: "Engagement rate", value: "5.9%", delta: "0.5pp", dir: "up" },
            { label: "Impressions", value: "882,000", delta: "16.8%", dir: "up" },
            { label: "Link clicks", value: "12,012", delta: "14.2%", dir: "up" },
            { label: "Reach", value: "588,000", delta: "15.1%", dir: "up" },
            { label: "Profile visits", value: "5,964", delta: "13.6%", dir: "up" },
          ],
          trend: [58800, 63840, 67620, 73500, 76860, 82320, 87360, 91980, 97020, 102480, 107520, 112560],
          labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        },
      },
    },
    tiktok: {
      label: "TikTok",
      breakdownLabel: "Content type breakdown",
      contentBreakdown: [
        { name: "Video", pct: 68 },
        { name: "LIVE", pct: 19 },
        { name: "Photos", pct: 13 },
      ],
      ranges: {
        "7d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "6,770", delta: "28.9%", dir: "up" },
            { label: "Engagement rate", value: "4.2%", delta: "1.1pp", dir: "up" },
            { label: "Impressions", value: "52,192", delta: "33.4%", dir: "up" },
            { label: "Link clicks", value: "655", delta: "36.7%", dir: "up" },
            { label: "Reach", value: "33,936", delta: "31.9%", dir: "up" },
            { label: "Profile visits", value: "330", delta: "29.4%", dir: "up" },
          ],
          trend: [6272, 6748, 6048, 7644, 8344, 8736, 8400],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        "30d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "7,496", delta: "28.9%", dir: "up" },
            { label: "Engagement rate", value: "4.0%", delta: "1.1pp", dir: "up" },
            { label: "Impressions", value: "230,299", delta: "33.4%", dir: "up" },
            { label: "Link clicks", value: "2,827", delta: "36.7%", dir: "up" },
            { label: "Reach", value: "149,730", delta: "31.9%", dir: "up" },
            { label: "Profile visits", value: "1,442", delta: "29.4%", dir: "up" },
          ],
          trend: [17980, 19840, 22010, 21080, 24490, 26350, 28210, 27280, 29760, 31620],
          labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        },
        "90d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "8,221", delta: "28.9%", dir: "up" },
            { label: "Engagement rate", value: "4.6%", delta: "1.1pp", dir: "up" },
            { label: "Impressions", value: "714,000", delta: "33.4%", dir: "up" },
            { label: "Link clicks", value: "9,724", delta: "36.7%", dir: "up" },
            { label: "Reach", value: "476,000", delta: "31.9%", dir: "up" },
            { label: "Profile visits", value: "4,828", delta: "29.4%", dir: "up" },
          ],
          trend: [47600, 51680, 54740, 59500, 62220, 66640, 70720, 74460, 78540, 82960, 87040, 91120],
          labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        },
      },
    },
    meta: {
      label: "Meta",
      breakdownLabel: "Content type breakdown",
      contentBreakdown: [
        { name: "Feed posts", pct: 44 },
        { name: "Video", pct: 33 },
        { name: "Stories", pct: 23 },
      ],
      ranges: {
        "7d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "2,418", delta: "1.6%", dir: "up" },
            { label: "Engagement rate", value: "3.8%", delta: "0.2pp", dir: "up" },
            { label: "Impressions", value: "18,640", delta: "2.3%", dir: "up" },
            { label: "Link clicks", value: "234", delta: "3.1%", dir: "up" },
            { label: "Reach", value: "12,120", delta: "1.9%", dir: "up" },
            { label: "Profile visits", value: "118", delta: "2.6%", dir: "up" },
          ],
          trend: [2240, 2410, 2160, 2730, 2980, 3120, 3000],
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        "30d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "2,297", delta: "1.6%", dir: "up" },
            { label: "Engagement rate", value: "3.5%", delta: "0.2pp", dir: "up" },
            { label: "Impressions", value: "70,576", delta: "2.3%", dir: "up" },
            { label: "Link clicks", value: "866", delta: "3.1%", dir: "up" },
            { label: "Reach", value: "45,885", delta: "1.9%", dir: "up" },
            { label: "Profile visits", value: "442", delta: "2.6%", dir: "up" },
          ],
          trend: [5510, 6080, 6745, 6460, 7505, 8075, 8645, 8360, 9120, 9690],
          labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        },
        "90d": {
          chartLabel: "Impressions trend",
          stats: [
            { label: "Followers", value: "2,176", delta: "1.6%", dir: "up" },
            { label: "Engagement rate", value: "4.1%", delta: "0.2pp", dir: "up" },
            { label: "Impressions", value: "189,000", delta: "2.3%", dir: "up" },
            { label: "Link clicks", value: "2,574", delta: "3.1%", dir: "up" },
            { label: "Reach", value: "126,000", delta: "1.9%", dir: "up" },
            { label: "Profile visits", value: "1,278", delta: "2.6%", dir: "up" },
          ],
          trend: [12600, 13680, 14490, 15750, 16470, 17640, 18720, 19710, 20790, 21960, 23040, 24120],
          labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        },
      },
    },
  };

  const PIE_COLORS = ["#82A7FF", "#DFF7FF", "#2457FF", "#5C7FE0", "#3D4E8C"];

  const typeToggle = root.querySelector(".demo-type-toggle");
  const rangeToggle = root.querySelector(".demo-range-toggle");
  const platformRow = root.querySelector("#demo-platform-row");
  const platformToggle = root.querySelector(".demo-platform-toggle");
  const metricToggle = root.querySelector("#demo-metric-toggle");
  const toolbarLabel = root.querySelector("#demo-toolbar-label");
  const chartLabel = root.querySelector("#demo-chart-label");
  const breakdownLabel = root.querySelector("#demo-breakdown-label");
  const extraRow = root.querySelector("#demo-extra-row");
  const stackbarSection = root.querySelector("#demo-stackbar-section");
  const pieSegments = root.querySelector("#demo-pie-segments");
  const pieLegend = root.querySelector("#demo-pie-legend");
  const tableBody = root.querySelector("#demo-table-body");
  const stackbarBars = root.querySelector("#demo-stackbar-bars");
  const stackbarLabels = root.querySelector("#demo-stackbar-labels");
  const stackbarLegend = root.querySelector("#demo-stackbar-legend");

  const statEls = [0, 1, 2, 3, 4, 5].map((i) => ({
    label: root.querySelector(`[data-label="${i}"]`),
    num: root.querySelector(`[data-stat="${i}"]`),
    delta: root.querySelector(`[data-delta="${i}"]`),
  }));

  const channelsEl = root.querySelector("#demo-channels");
  const svg = root.querySelector("#demo-chart");
  const areaPath = root.querySelector("#demo-chart-area");
  const linePath = root.querySelector("#demo-chart-line");
  const dotsGroup = root.querySelector("#demo-chart-dots");
  const hoverLine = root.querySelector("#demo-hover-line");
  const hoverDot = root.querySelector("#demo-hover-dot");
  const overlay = root.querySelector("#demo-chart-overlay");
  const tooltip = root.querySelector("#demo-tooltip");
  const chartWrap = root.querySelector(".demo-chart-wrap");

  if (!typeToggle || !rangeToggle || !svg || !areaPath || !linePath || !overlay || !tooltip) return;

  const VB_W = 900,
    VB_H = 300,
    PAD_TOP = 16,
    PAD_BOTTOM = 34,
    CHART_H = VB_H - PAD_TOP - PAD_BOTTOM;

  let currentType = "ga4";
  let currentRange = "7d";
  let currentPlatform = "all";
  let currentMetric = "sessions";
  let currentPoints = [];

  // Resolve the active chart trend + labels regardless of type/platform nesting.
  function activeRangeData() {
    if (currentType === "ga4") {
      const data = GA4_DATA.ranges[currentRange];
      return {
        data,
        trend: data.metrics[currentMetric],
        chartLabel: `${GA4_METRIC_LABELS[currentMetric]} trend`,
        breakdownLabel: "Traffic channels",
        unit: currentMetric === "revenue" ? "currency" : "number",
      };
    }
    const platform = SOCIAL_PLATFORMS[currentPlatform] || SOCIAL_PLATFORMS.all;
    const data = platform.ranges[currentRange];
    return {
      data,
      trend: data.trend,
      chartLabel: data.chartLabel,
      breakdownLabel: platform.breakdownLabel,
      unit: "number",
    };
  }

  function buildPoints(trend) {
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min || 1;
    const padVal = range * 0.15;
    const lo = min - padVal;
    const hi = max + padVal;
    const n = trend.length;
    return trend.map((v, i) => {
      const x = n === 1 ? 0 : (i / (n - 1)) * VB_W;
      const y = PAD_TOP + (1 - (v - lo) / (hi - lo)) * CHART_H;
      return { x, y, v };
    });
  }

  function smoothPath(points) {
    if (!points.length) return "";
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  }

  function formatTooltipValue(v, unit) {
    return unit === "currency" ? `£${v.toLocaleString("en-GB")}` : v.toLocaleString("en-GB");
  }

  function renderBreakdownBars(list) {
    if (!channelsEl) return;
    channelsEl.innerHTML = "";
    list.forEach((item) => {
      const div = document.createElement("div");
      div.className = "demo-channel";
      div.innerHTML =
        `<div class="demo-channel-top"><span>${item.name}</span><span class="pct">${item.pct}%</span></div>` +
        `<div class="demo-channel-bar"><div class="demo-channel-fill" style="width:${
          reduceMotion ? item.pct : 0
        }%;"></div></div>`;
      channelsEl.appendChild(div);
    });
    if (!reduceMotion) {
      requestAnimationFrame(() => {
        channelsEl.querySelectorAll(".demo-channel-fill").forEach((fill, i) => {
          fill.style.width = list[i].pct + "%";
        });
      });
    }
  }

  function renderPie(list) {
    if (!pieSegments || !pieLegend) return;
    pieSegments.innerHTML = "";
    pieLegend.innerHTML = "";
    const r = 90;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    list.forEach((item, i) => {
      const color = PIE_COLORS[i % PIE_COLORS.length];
      const len = (item.pct / 100) * circumference;
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", "100");
      c.setAttribute("cy", "100");
      c.setAttribute("r", String(r));
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", color);
      c.setAttribute("stroke-width", "20");
      c.setAttribute("stroke-dasharray", `${reduceMotion ? len : 0} ${circumference}`);
      c.setAttribute("stroke-dashoffset", String(-offset));
      pieSegments.appendChild(c);
      if (!reduceMotion) {
        requestAnimationFrame(() => {
          c.setAttribute("stroke-dasharray", `${len} ${circumference}`);
        });
      }
      offset += len;

      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML =
        `<span class="swatch" style="background:${color};"></span><span>${item.group || item.name}</span>` +
        `<span class="pct">${item.pct}%</span>`;
      pieLegend.appendChild(row);
    });
  }

  function renderTopPages(rows) {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.title}</td><td>${row.views.toLocaleString("en-GB")}</td>`;
      tableBody.appendChild(tr);
    });
  }

  function renderStackbar(monthsData) {
    if (!stackbarBars || !stackbarLabels || !stackbarLegend) return;
    stackbarBars.innerHTML = "";
    stackbarLabels.innerHTML = "";
    stackbarLegend.innerHTML = "";

    const { months, series } = monthsData;
    const totals = months.map((_, mi) => series.reduce((sum, s) => sum + s.values[mi], 0));
    const maxTotal = Math.max(...totals);

    const svgW = 900,
      svgH = 260,
      padTop = 10,
      padBottom = 28,
      barAreaH = svgH - padTop - padBottom;
    const n = months.length;
    const gap = 28;
    const barW = (svgW - gap * (n + 1)) / n;

    months.forEach((m, mi) => {
      const x = gap + mi * (barW + gap);
      let yCursor = padTop + barAreaH;
      series.forEach((s, si) => {
        const val = s.values[mi];
        const h = (val / maxTotal) * barAreaH;
        const y = yCursor - h;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("width", String(barW));
        rect.setAttribute("fill", PIE_COLORS[si % PIE_COLORS.length]);
        rect.setAttribute("rx", "2");
        if (reduceMotion) {
          rect.setAttribute("y", String(y));
          rect.setAttribute("height", String(h));
        } else {
          rect.setAttribute("y", String(yCursor));
          rect.setAttribute("height", "0");
        }
        stackbarBars.appendChild(rect);
        if (!reduceMotion) {
          requestAnimationFrame(() => {
            rect.setAttribute("y", String(y));
            rect.setAttribute("height", String(h));
          });
        }
        yCursor = y;
      });

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(x + barW / 2));
      text.setAttribute("y", String(svgH - 8));
      text.setAttribute("text-anchor", "middle");
      text.textContent = m;
      stackbarLabels.appendChild(text);
    });

    series.forEach((s, si) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<span class="swatch" style="background:${PIE_COLORS[si % PIE_COLORS.length]};"></span><span>${s.name}</span>`;
      stackbarLegend.appendChild(row);
    });
  }

  function render() {
    const isGa4 = currentType === "ga4";
    const { data, trend, chartLabel: chartLbl, breakdownLabel: breakdownLbl, unit } = activeRangeData();
    if (!data) return;
    currentPoints = buildPoints(trend);

    typeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.demoType === currentType);
    });
    rangeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.range === currentRange);
    });

    if (platformRow) platformRow.classList.toggle("visible", !isGa4);
    if (platformToggle) {
      platformToggle.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.platform === currentPlatform);
      });
    }

    if (metricToggle) {
      metricToggle.style.display = isGa4 ? "inline-flex" : "none";
      metricToggle.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.metric === currentMetric);
      });
    }
    if (extraRow) extraRow.style.display = isGa4 ? "grid" : "none";
    if (stackbarSection) stackbarSection.style.display = isGa4 ? "block" : "none";

    if (toolbarLabel) {
      toolbarLabel.textContent = isGa4
        ? GA4_DATA.toolbarLabel
        : "Social overview" + (currentPlatform !== "all" ? ` — ${SOCIAL_PLATFORMS[currentPlatform].label}` : "");
    }
    if (chartLabel) chartLabel.textContent = chartLbl;
    if (breakdownLabel) breakdownLabel.textContent = breakdownLbl;

    statEls.forEach(({ label, num, delta }, i) => {
      const stat = data.stats[i];
      if (!label || !num || !delta || !stat) return;
      label.textContent = stat.label;
      num.textContent = stat.value;
      delta.textContent = (stat.dir === "up" ? "▲ " : "▼ ") + stat.delta;
      delta.classList.remove("up", "down");
      delta.classList.add(stat.dir);
    });

    const smoothed = smoothPath(currentPoints);
    linePath.setAttribute("d", smoothed);
    const last = currentPoints[currentPoints.length - 1];
    const first = currentPoints[0];
    const floorY = PAD_TOP + CHART_H;
    areaPath.setAttribute("d", `${smoothed} L${last.x},${floorY} L${first.x},${floorY} Z`);

    if (dotsGroup) {
      dotsGroup.innerHTML = "";
      currentPoints.forEach((p) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", p.x);
        c.setAttribute("cy", p.y);
        c.setAttribute("r", 3);
        c.setAttribute("class", "demo-chart-dot");
        dotsGroup.appendChild(c);
      });
    }

    // Breakdown row: GA4 traffic channels, Social "all" platform mix, or a
    // specific Social platform's content-type split.
    if (isGa4) {
      renderBreakdownBars(data.breakdown);
    } else if (currentPlatform === "all") {
      renderBreakdownBars(data.breakdown);
    } else {
      renderBreakdownBars(SOCIAL_PLATFORMS[currentPlatform].contentBreakdown);
    }

    if (isGa4) {
      renderPie(GA4_DATA.demographics);
      renderTopPages(data.topPages);
      renderStackbar(GA4_DATA.channelMonths);
    }

    hideTooltip();
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
    if (hoverLine) hoverLine.style.opacity = 0;
    if (hoverDot) hoverDot.style.opacity = 0;
  }

  function svgSpaceFromClient(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }

  function onMove(clientX, clientY) {
    if (!currentPoints.length) return;
    const { x } = svgSpaceFromClient(clientX, clientY);

    let nearest = currentPoints[0];
    let nearestDist = Infinity;
    let nearestIdx = 0;
    currentPoints.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = p;
        nearestIdx = i;
      }
    });

    if (hoverLine) {
      hoverLine.setAttribute("x1", nearest.x);
      hoverLine.setAttribute("x2", nearest.x);
      hoverLine.style.opacity = 1;
    }
    if (hoverDot) {
      hoverDot.setAttribute("cx", nearest.x);
      hoverDot.setAttribute("cy", nearest.y);
      hoverDot.style.opacity = 1;
    }

    const { data, unit } = activeRangeData();
    const label = (data.labels && data.labels[nearestIdx]) || "";
    const valueText = formatTooltipValue(nearest.v, unit);
    tooltip.innerHTML = `${label ? label + " &middot; " : ""}<span class="val">${valueText}</span>`;
    tooltip.classList.add("visible");

    if (chartWrap) {
      const wrapRect = chartWrap.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const scaleX = svgRect.width / VB_W;
      const scaleY = svgRect.height / VB_H;
      const px = svgRect.left - wrapRect.left + nearest.x * scaleX;
      const py = svgRect.top - wrapRect.top + nearest.y * scaleY;
      tooltip.style.left = px + "px";
      tooltip.style.top = py + "px";
    }
  }

  overlay.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  overlay.addEventListener("mouseleave", hideTooltip);
  overlay.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    },
    { passive: true }
  );
  overlay.addEventListener("touchend", hideTooltip);

  typeToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.demoType === currentType) return;
      currentType = btn.dataset.demoType;
      if (currentType === "ga4") currentPlatform = "all";
      render();
    });
  });

  rangeToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.range === currentRange) return;
      currentRange = btn.dataset.range;
      render();
    });
  });

  if (platformToggle) {
    platformToggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.platform === currentPlatform) return;
        currentPlatform = btn.dataset.platform;
        render();
      });
    });
  }

  if (metricToggle) {
    metricToggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.metric === currentMetric) return;
        currentMetric = btn.dataset.metric;
        render();
      });
    });
  }

  render();
});
