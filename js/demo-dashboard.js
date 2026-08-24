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
  const GA4_DATA = {
    toolbarLabel: "Website overview",
    breakdownLabel: "Traffic channels",
    pieLabel: "Audience by age",
    tableLabel: "Top pages by views",
    tableCol1: "Page title",
    tableCol2: "Views",
    stackbarLabel: "First user channel group, by month",
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
          users: [7960, 7717, 8005, 9570, 9483, 8970, 9850],
          sessions: [8998, 10010, 10918, 10051, 11046, 12931, 12480],
          clicks: [2421, 2524, 2840, 2768, 3010, 3203, 3120],
          revenue: [15365, 15101, 16004, 16231, 16313, 16467, 18240],
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
          users: [31985, 31920, 35768, 33210, 35435, 35197, 36498, 41141, 35990, 39600],
          sessions: [40621, 44639, 39351, 42418, 49090, 47873, 44485, 47516, 53444, 51200],
          clicks: [9753, 10101, 9806, 11409, 10591, 11581, 12724, 11937, 13559, 12850],
          revenue: [65049, 62251, 72934, 65111, 68987, 75571, 69757, 72816, 69309, 74900],
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
          users: [83553, 81354, 94218, 92087, 90333, 93802, 100062, 98751, 108482, 99873, 107084, 112400],
          sessions: [115699, 125794, 118501, 114845, 127159, 136162, 138108, 126105, 139770, 135044, 133659, 148900],
          clicks: [28448, 29029, 30295, 28623, 31643, 35090, 33597, 34133, 36630, 35295, 34931, 37200],
          revenue: [175402, 169279, 198197, 191741, 194195, 210500, 184326, 213587, 196512, 201307, 207761, 218600],
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
          trend: [9820, 9540, 10680, 11750, 12980, 14120, 13640],
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
          trend: [24800, 27100, 29600, 28200, 32500, 35800, 38900, 37600, 41200, 43700],
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
          trend: [48200, 51600, 49800, 55400, 59200, 63800, 68100, 65900, 71400, 76800, 82100, 88600],
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
          trend: [6120, 7380, 6540, 8460, 7720, 9180, 8560],
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
          trend: [18400, 20900, 19600, 23800, 22100, 26400, 24700, 28900, 27300, 31600],
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
          trend: [47200, 50800, 54600, 52100, 58900, 63400, 60700, 67200, 72500, 69800, 76400, 82900],
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
          trend: [2280, 2410, 2340, 2560, 2690, 2750, 2980],
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
          trend: [5620, 5980, 6340, 6180, 6890, 7420, 7180, 7960, 8540, 9280],
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
          trend: [12800, 13600, 14400, 13900, 15600, 16800, 16200, 17900, 19100, 20400, 21800, 23400],
          labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        },
      },
    },
  };

  // ---------- PPC (Google Ads) data ----------
  const PPC_DATA = {
    toolbarLabel: "Google Ads overview",
    breakdownLabel: "Campaign type breakdown",
    pieLabel: "Clicks by device",
    tableLabel: "Top campaigns by conversions",
    tableCol1: "Campaign",
    tableCol2: "Conversions",
    stackbarLabel: "Spend by campaign type, by month",
    demographics: [
      { group: "Mobile", pct: 54 },
      { group: "Desktop", pct: 38 },
      { group: "Tablet", pct: 8 },
    ],
    channelMonths: {
      months: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      series: [
        { name: "Search", values: [3200, 3450, 3680, 3920, 4180, 4450] },
        { name: "Shopping", values: [1900, 2050, 2240, 2410, 2600, 2790] },
        { name: "Performance Max", values: [1100, 1250, 1380, 1520, 1650, 1800] },
        { name: "Display", values: [520, 560, 600, 640, 680, 720] },
      ],
    },
    ranges: {
      "7d": {
        stats: [
          { label: "Clicks", value: "1,840", delta: "6.8%", dir: "up" },
          { label: "Impressions", value: "42,600", delta: "4.5%", dir: "up" },
          { label: "Cost", value: "£1,251", delta: "3.9%", dir: "up" },
          { label: "Conversions", value: "96", delta: "11.2%", dir: "up" },
          { label: "CTR", value: "4.3%", delta: "0.2pp", dir: "up" },
          { label: "Avg. CPC", value: "£0.68", delta: "3.1%", dir: "down" },
        ],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        metrics: {
          clicks: [1480, 1512, 1596, 1668, 1734, 1789, 1840],
          impressions: [34200, 35800, 37100, 38600, 39900, 41200, 42600],
          cost: [1010, 1042, 1088, 1131, 1172, 1213, 1251],
          conversions: [70, 74, 79, 84, 88, 92, 96],
        },
        breakdown: [
          { name: "Search", pct: 46 },
          { name: "Shopping", pct: 28 },
          { name: "Performance Max", pct: 18 },
          { name: "Display", pct: 8 },
        ],
        topPages: [
          { title: "Brand Search - Exact", views: 22 },
          { title: "Generic Search - Broad", views: 17 },
          { title: "Shopping - Best Sellers", views: 14 },
          { title: "Performance Max - Full Catalog", views: 11 },
          { title: "Shopping - Clearance", views: 9 },
          { title: "Display - Remarketing", views: 7 },
          { title: "Search - Competitor Terms", views: 6 },
          { title: "Performance Max - New Customers", views: 4 },
          { title: "Display - Prospecting", views: 3 },
          { title: "Search - Local Intent", views: 3 },
        ],
      },
      "30d": {
        stats: [
          { label: "Clicks", value: "7,920", delta: "12.4%", dir: "up" },
          { label: "Impressions", value: "178,300", delta: "9.8%", dir: "up" },
          { label: "Cost", value: "£5,415", delta: "10.6%", dir: "up" },
          { label: "Conversions", value: "412", delta: "17.9%", dir: "up" },
          { label: "CTR", value: "4.4%", delta: "0.3pp", dir: "up" },
          { label: "Avg. CPC", value: "£0.68", delta: "1.8%", dir: "down" },
        ],
        labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        metrics: {
          clicks: [6180, 6410, 6690, 6850, 7040, 7190, 7350, 7530, 7710, 7920],
          impressions: [141000, 146500, 151800, 155900, 160200, 164100, 168300, 171900, 175200, 178300],
          cost: [4290, 4460, 4650, 4790, 4930, 5040, 5150, 5250, 5330, 5415],
          conversions: [305, 320, 335, 348, 360, 372, 384, 395, 404, 412],
        },
        breakdown: [
          { name: "Search", pct: 44 },
          { name: "Shopping", pct: 30 },
          { name: "Performance Max", pct: 19 },
          { name: "Display", pct: 7 },
        ],
        topPages: [
          { title: "Brand Search - Exact", views: 94 },
          { title: "Generic Search - Broad", views: 71 },
          { title: "Shopping - Best Sellers", views: 58 },
          { title: "Performance Max - Full Catalog", views: 47 },
          { title: "Shopping - Clearance", views: 38 },
          { title: "Display - Remarketing", views: 29 },
          { title: "Search - Competitor Terms", views: 24 },
          { title: "Performance Max - New Customers", views: 18 },
          { title: "Display - Prospecting", views: 14 },
          { title: "Search - Local Intent", views: 12 },
        ],
      },
      "90d": {
        stats: [
          { label: "Clicks", value: "24,150", delta: "21.6%", dir: "up" },
          { label: "Impressions", value: "542,800", delta: "18.3%", dir: "up" },
          { label: "Cost", value: "£16,890", delta: "15.4%", dir: "up" },
          { label: "Conversions", value: "1,268", delta: "26.7%", dir: "up" },
          { label: "CTR", value: "4.5%", delta: "0.4pp", dir: "up" },
          { label: "Avg. CPC", value: "£0.70", delta: "2.4%", dir: "up" },
        ],
        labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        metrics: {
          clicks: [17800, 18400, 19100, 19700, 20300, 20900, 21500, 22100, 22700, 23200, 23700, 24150],
          impressions: [412000, 424000, 436000, 448000, 460000, 472000, 484000, 496000, 508000, 519000, 531000, 542800],
          cost: [12700, 13100, 13500, 13900, 14300, 14700, 15100, 15450, 15800, 16150, 16500, 16890],
          conversions: [890, 925, 960, 995, 1030, 1065, 1100, 1135, 1165, 1195, 1230, 1268],
        },
        breakdown: [
          { name: "Search", pct: 42 },
          { name: "Shopping", pct: 32 },
          { name: "Performance Max", pct: 20 },
          { name: "Display", pct: 6 },
        ],
        topPages: [
          { title: "Brand Search - Exact", views: 285 },
          { title: "Generic Search - Broad", views: 215 },
          { title: "Shopping - Best Sellers", views: 178 },
          { title: "Performance Max - Full Catalog", views: 142 },
          { title: "Shopping - Clearance", views: 115 },
          { title: "Display - Remarketing", views: 89 },
          { title: "Search - Competitor Terms", views: 72 },
          { title: "Performance Max - New Customers", views: 56 },
          { title: "Display - Prospecting", views: 44 },
          { title: "Search - Local Intent", views: 36 },
        ],
      },
    },
  };

  // ---------- SEO (Search Console) data ----------
  const SEO_DATA = {
    toolbarLabel: "SEO overview",
    breakdownLabel: "Query type breakdown",
    pieLabel: "Clicks by device",
    tableLabel: "Top queries by clicks",
    tableCol1: "Query",
    tableCol2: "Clicks",
    stackbarLabel: "Clicks by query type, by month",
    demographics: [
      { group: "Mobile", pct: 61 },
      { group: "Desktop", pct: 33 },
      { group: "Tablet", pct: 6 },
    ],
    channelMonths: {
      months: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      series: [
        { name: "Non-branded", values: [5200, 5680, 6150, 6700, 7300, 7950] },
        { name: "Branded", values: [2100, 2280, 2450, 2650, 2850, 3080] },
        { name: "Local", values: [1050, 1150, 1260, 1380, 1500, 1640] },
        { name: "Informational", values: [480, 520, 570, 620, 670, 730] },
      ],
    },
    ranges: {
      "7d": {
        stats: [
          { label: "Clicks", value: "3,120", delta: "8.9%", dir: "up" },
          { label: "Impressions", value: "84,600", delta: "5.2%", dir: "up" },
          { label: "CTR", value: "3.7%", delta: "0.2pp", dir: "up" },
          { label: "Avg. position", value: "8.4", delta: "0.6", dir: "up" },
          { label: "Indexed pages", value: "342", delta: "1.2%", dir: "up" },
          { label: "Top 3 rankings", value: "28", delta: "9.6%", dir: "up" },
        ],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        metrics: {
          clicks: [2480, 2560, 2650, 2780, 2890, 2990, 3120],
          impressions: [69800, 72100, 74600, 77300, 79800, 82100, 84600],
          ctr: [3.35, 3.42, 3.48, 3.55, 3.6, 3.65, 3.7],
          position: [9.6, 9.4, 9.2, 9.0, 8.8, 8.6, 8.4],
        },
        breakdown: [
          { name: "Non-branded", pct: 58 },
          { name: "Branded", pct: 24 },
          { name: "Local", pct: 12 },
          { name: "Informational", pct: 6 },
        ],
        topPages: [
          { title: "veld analytics", views: 412 },
          { title: "google analytics 4 reporting agency", views: 298 },
          { title: "how to fix ga4 conversion tracking", views: 245 },
          { title: "seo reporting dashboard example", views: 210 },
          { title: "ppc reporting agency uk", views: 186 },
          { title: "google ads reporting tool", views: 164 },
          { title: "organic social reporting dashboard", views: 142 },
          { title: "manchester analytics consultant", views: 118 },
          { title: "looker studio ga4 template", views: 96 },
          { title: "google search console reporting", views: 84 },
        ],
      },
      "30d": {
        stats: [
          { label: "Clicks", value: "13,850", delta: "19.4%", dir: "up" },
          { label: "Impressions", value: "356,200", delta: "14.7%", dir: "up" },
          { label: "CTR", value: "3.9%", delta: "0.3pp", dir: "up" },
          { label: "Avg. position", value: "7.9", delta: "0.9", dir: "up" },
          { label: "Indexed pages", value: "348", delta: "1.7%", dir: "up" },
          { label: "Top 3 rankings", value: "34", delta: "21.4%", dir: "up" },
        ],
        labels: ["Wk 1", "", "Wk 2", "", "Wk 3", "", "Wk 4", "", "", "Now"],
        metrics: {
          clicks: [10200, 10800, 11300, 11700, 12100, 12500, 12900, 13250, 13550, 13850],
          impressions: [278000, 289000, 299000, 308000, 317000, 325000, 333000, 341000, 349000, 356200],
          ctr: [3.55, 3.6, 3.65, 3.68, 3.72, 3.76, 3.8, 3.84, 3.87, 3.9],
          position: [9.4, 9.2, 9.0, 8.9, 8.7, 8.5, 8.3, 8.1, 8.0, 7.9],
        },
        breakdown: [
          { name: "Non-branded", pct: 56 },
          { name: "Branded", pct: 25 },
          { name: "Local", pct: 13 },
          { name: "Informational", pct: 6 },
        ],
        topPages: [
          { title: "veld analytics", views: 1680 },
          { title: "google analytics 4 reporting agency", views: 1240 },
          { title: "how to fix ga4 conversion tracking", views: 1010 },
          { title: "seo reporting dashboard example", views: 860 },
          { title: "ppc reporting agency uk", views: 760 },
          { title: "google ads reporting tool", views: 670 },
          { title: "organic social reporting dashboard", views: 580 },
          { title: "manchester analytics consultant", views: 480 },
          { title: "looker studio ga4 template", views: 390 },
          { title: "google search console reporting", views: 340 },
        ],
      },
      "90d": {
        stats: [
          { label: "Clicks", value: "42,700", delta: "38.2%", dir: "up" },
          { label: "Impressions", value: "1.05M", delta: "29.6%", dir: "up" },
          { label: "CTR", value: "4.1%", delta: "0.5pp", dir: "up" },
          { label: "Avg. position", value: "7.2", delta: "1.8", dir: "up" },
          { label: "Indexed pages", value: "356", delta: "4.4%", dir: "up" },
          { label: "Top 3 rankings", value: "41", delta: "31.3%", dir: "up" },
        ],
        labels: ["Mo 1", "", "", "Mo 2", "", "", "Mo 3", "", "", "", "", "Now"],
        metrics: {
          clicks: [28900, 30200, 31600, 33000, 34400, 35800, 37200, 38500, 39700, 40800, 41800, 42700],
          impressions: [740000, 767000, 795000, 822000, 850000, 877000, 905000, 932000, 960000, 987000, 1015000, 1050000],
          ctr: [3.6, 3.65, 3.7, 3.75, 3.8, 3.85, 3.9, 3.95, 3.98, 4.02, 4.06, 4.1],
          position: [9.0, 8.85, 8.7, 8.55, 8.4, 8.25, 8.1, 7.95, 7.8, 7.65, 7.5, 7.2],
        },
        breakdown: [
          { name: "Non-branded", pct: 54 },
          { name: "Branded", pct: 26 },
          { name: "Local", pct: 14 },
          { name: "Informational", pct: 6 },
        ],
        topPages: [
          { title: "veld analytics", views: 4850 },
          { title: "google analytics 4 reporting agency", views: 3620 },
          { title: "how to fix ga4 conversion tracking", views: 2960 },
          { title: "seo reporting dashboard example", views: 2510 },
          { title: "ppc reporting agency uk", views: 2210 },
          { title: "google ads reporting tool", views: 1950 },
          { title: "organic social reporting dashboard", views: 1690 },
          { title: "manchester analytics consultant", views: 1400 },
          { title: "looker studio ga4 template", views: 1140 },
          { title: "google search console reporting", views: 980 },
        ],
      },
    },
  };

  const DATA_BY_TYPE = { ga4: GA4_DATA, ppc: PPC_DATA, seo: SEO_DATA };

  const METRIC_SETS = {
    ga4: [
      { key: "users", label: "Users", unit: "number" },
      { key: "sessions", label: "Sessions", unit: "number" },
      { key: "clicks", label: "Clicks", unit: "number" },
      { key: "revenue", label: "Revenue", unit: "currency" },
    ],
    ppc: [
      { key: "clicks", label: "Clicks", unit: "number" },
      { key: "impressions", label: "Impressions", unit: "number" },
      { key: "cost", label: "Cost", unit: "currency" },
      { key: "conversions", label: "Conversions", unit: "number" },
    ],
    seo: [
      { key: "clicks", label: "Clicks", unit: "number" },
      { key: "impressions", label: "Impressions", unit: "number" },
      { key: "ctr", label: "CTR", unit: "percent" },
      { key: "position", label: "Avg. position", unit: "position" },
    ],
  };
  const TYPE_DEFAULT_METRIC = { ga4: "sessions", ppc: "clicks", seo: "clicks" };

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
  const pieLabelEl = root.querySelector("#demo-pie-label");
  const tableLabelEl = root.querySelector("#demo-table-label");
  const tableCol1El = root.querySelector("#demo-table-col1");
  const tableCol2El = root.querySelector("#demo-table-col2");
  const stackbarTitleEl = root.querySelector("#demo-stackbar-title");

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
    if (currentType !== "social") {
      const typeData = DATA_BY_TYPE[currentType];
      const data = typeData.ranges[currentRange];
      const set = METRIC_SETS[currentType] || [];
      const metricDef = set.find((m) => m.key === currentMetric) || set[0];
      return {
        data,
        trend: data.metrics[metricDef.key],
        chartLabel: `${metricDef.label} trend`,
        breakdownLabel: typeData.breakdownLabel,
        unit: metricDef.unit,
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
    if (unit === "currency") return `£${Math.round(v).toLocaleString("en-GB")}`;
    if (unit === "percent") return `${v.toFixed(1)}%`;
    if (unit === "position") return `#${v.toFixed(1)}`;
    return Math.round(v).toLocaleString("en-GB");
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
    const isFullType = currentType !== "social";
    const { data, trend, chartLabel: chartLbl, breakdownLabel: breakdownLbl, unit } = activeRangeData();
    if (!data) return;
    currentPoints = buildPoints(trend);

    typeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.demoType === currentType);
    });
    rangeToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.range === currentRange);
    });

    if (platformRow) platformRow.classList.toggle("visible", currentType === "social");
    if (platformToggle) {
      platformToggle.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.platform === currentPlatform);
      });
    }

    if (metricToggle) {
      if (isFullType) {
        metricToggle.style.display = "inline-flex";
        const set = METRIC_SETS[currentType] || [];
        metricToggle.innerHTML = set
          .map(
            (m) =>
              `<button type="button" data-metric="${m.key}" class="${m.key === currentMetric ? "active" : ""}">${m.label}</button>`
          )
          .join("");
      } else {
        metricToggle.style.display = "none";
      }
    }
    if (extraRow) extraRow.style.display = isFullType ? "grid" : "none";
    if (stackbarSection) stackbarSection.style.display = isFullType ? "block" : "none";

    if (toolbarLabel) {
      toolbarLabel.textContent = isFullType
        ? DATA_BY_TYPE[currentType].toolbarLabel
        : "Social overview" + (currentPlatform !== "all" ? ` — ${SOCIAL_PLATFORMS[currentPlatform].label}` : "");
    }
    if (chartLabel) chartLabel.textContent = chartLbl;
    if (breakdownLabel) breakdownLabel.textContent = breakdownLbl;

    if (isFullType) {
      const typeData = DATA_BY_TYPE[currentType];
      if (pieLabelEl) pieLabelEl.textContent = typeData.pieLabel;
      if (tableLabelEl) tableLabelEl.textContent = typeData.tableLabel;
      if (tableCol1El) tableCol1El.textContent = typeData.tableCol1;
      if (tableCol2El) tableCol2El.textContent = typeData.tableCol2;
      if (stackbarTitleEl) stackbarTitleEl.textContent = typeData.stackbarLabel;
    }

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

    // Breakdown row: GA4/PPC/SEO's own breakdown, Social "all" platform mix,
    // or a specific Social platform's content-type split.
    if (isFullType) {
      renderBreakdownBars(data.breakdown);
    } else if (currentPlatform === "all") {
      renderBreakdownBars(data.breakdown);
    } else {
      renderBreakdownBars(SOCIAL_PLATFORMS[currentPlatform].contentBreakdown);
    }

    if (isFullType) {
      const typeData = DATA_BY_TYPE[currentType];
      renderPie(typeData.demographics);
      renderTopPages(data.topPages);
      renderStackbar(typeData.channelMonths);
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
      if (currentType !== "social") {
        currentPlatform = "all";
        currentMetric = TYPE_DEFAULT_METRIC[currentType] || (METRIC_SETS[currentType] && METRIC_SETS[currentType][0].key);
      }
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

  // Metric-toggle buttons are rebuilt on every render() call (their set
  // depends on the active dashboard type), so listen via delegation on the
  // container rather than binding to individual buttons.
  if (metricToggle) {
    metricToggle.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-metric]");
      if (!btn || btn.dataset.metric === currentMetric) return;
      currentMetric = btn.dataset.metric;
      render();
    });
  }

  render();
});
