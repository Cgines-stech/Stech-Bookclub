const data = [
  { category: "Mining", jobs: 6327, growth: -137, wage: 3191.00, impact: 20189457.00 },
  { category: "Construction", jobs: 3444, growth: 963, wage: 5248.00, impact: 18074112.00 },
  { category: "Manufacturing", jobs: 2757, growth: 227, wage: 5360.00, impact: 14777520.00 },
  { category: "Trade/Transport/Util", jobs: 3776, growth: 90, wage: 3532.00, impact: 13336832.00 },
  { category: "Information", jobs: 143, growth: -33, wage: 5799.00, impact: 829257.00 },
  { category: "Financial Activities", jobs: 1162, growth: 71, wage: 5530.00, impact: 6425860.00 },
  { category: "Prof/Business Svcs", jobs: 1873, growth: -158, wage: 4057.00, impact: 7598761.00 },
  { category: "Ed/Health/Social Svcs", jobs: 3248, growth: 133, wage: 3559.00, impact: 11559632.00 },
  { category: "Leisure/Hospitality", jobs: 3240, growth: 43, wage: 1796.00, impact: 5819040.00 },
  { category: "Other Services", jobs: 637, growth: -12, wage: 3284.00, impact: 2091908.00 },
  { category: "Government", jobs: 6782, growth: 35, wage: 4552.00, impact: 30871664.00 }
];

const totalJobs = 33389;
const totalGrowth = 1222;
const totalImpact = 131574043.00;
const weightedAverageWage = 3940.64;

const fmtInt = (n) => n.toLocaleString("en-US");
const fmtMoney0 = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtMoney2 = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function renderSummary() {
  const summaryGrid = document.getElementById("summaryGrid");

  const topGrowth = [...data].sort((a, b) => b.growth - a.growth)[0];
  const topWage = [...data].sort((a, b) => b.wage - a.wage)[0];
  const largestSector = [...data].sort((a, b) => b.jobs - a.jobs)[0];
  const biggestDecline = [...data].sort((a, b) => a.growth - b.growth)[0];

  summaryGrid.innerHTML = `
    <div class="summary-card">
      <span class="summary-label">Total Jobs</span>
      <strong>${fmtInt(totalJobs)}</strong>
    </div>
    <div class="summary-card">
      <span class="summary-label">September Growth</span>
      <strong>${fmtInt(totalGrowth)}</strong>
    </div>
    <div class="summary-card">
      <span class="summary-label">Weighted Avg. Monthly Wage</span>
      <strong>${fmtMoney2(weightedAverageWage)}</strong>
    </div>
    <div class="summary-card">
      <span class="summary-label">Fastest Growth</span>
      <strong>${topGrowth.category}</strong>
      <span class="muted small">+${fmtInt(topGrowth.growth)} jobs</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">Highest Wage</span>
      <strong>${topWage.category}</strong>
      <span class="muted small">${fmtMoney0(topWage.wage)}/month</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">Largest Sector</span>
      <strong>${largestSector.category}</strong>
      <span class="muted small">${fmtInt(largestSector.jobs)} jobs</span>
    </div>
    <div class="summary-card">
      <span class="summary-label">Biggest Decline</span>
      <strong>${biggestDecline.category}</strong>
      <span class="muted small">${biggestDecline.growth} jobs</span>
    </div>
  `;
}

function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.category}</td>
      <td class="num">${fmtInt(d.jobs)}</td>
      <td class="num ${d.growth >= 0 ? "pos" : "neg"}">${d.growth >= 0 ? "+" : ""}${fmtInt(d.growth)}</td>
      <td class="num">${fmtMoney2(d.wage)}</td>
      <td class="num">${fmtMoney2(d.impact)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalJobsFoot").textContent = fmtInt(totalJobs);
  document.getElementById("totalGrowthFoot").textContent = fmtInt(totalGrowth);
  document.getElementById("totalImpactFoot").textContent = fmtMoney2(totalImpact);
  document.getElementById("weightedWageFooter").textContent = fmtMoney2(weightedAverageWage);
}

function renderChart(rows, metric, sortMode) {
  const chart = document.getElementById("chart");
  const note = document.getElementById("chartNote");
  chart.innerHTML = "";

  const sorted = [...rows].sort((a, b) => {
    if (sortMode === "growth") return b.growth - a.growth;
    if (sortMode === "wage") return b.wage - a.wage;
    return 0;
  });

  const maxVal = Math.max(...sorted.map(d => metric === "growth" ? Math.abs(d.growth) : d.wage));

  sorted.forEach(d => {
    const val = metric === "growth" ? d.growth : d.wage;
    const pct = (Math.abs(val) / maxVal) * 100;
    const fillClass = metric === "growth"
      ? (val >= 0 ? "fill positive" : "fill negative")
      : "fill";

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="label">${d.category}</div>
      <div class="track">
        <div class="${fillClass}" style="width:${pct}%"></div>
      </div>
      <div class="value ${metric === "growth" ? (val >= 0 ? "good" : "bad") : ""}">
        ${metric === "growth"
          ? `${val >= 0 ? "+" : ""}${fmtInt(val)}`
          : fmtMoney0(val)}
      </div>
    `;
    chart.appendChild(row);
  });

  note.textContent =
    metric === "growth"
      ? "Bars show monthly job growth by industry. Positive growth is highlighted separately from decline."
      : "Bars show average monthly wages by industry.";
}

function renderImpactChart(rows) {
  const wrap = document.getElementById("impactChart");
  wrap.innerHTML = "";

  const sorted = [...rows].sort((a, b) => b.impact - a.impact);
  const maxImpact = Math.max(...sorted.map(d => d.impact));

  sorted.forEach(d => {
    const pct = (d.impact / maxImpact) * 100;

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="label">${d.category}</div>
      <div class="track">
        <div class="fill impact" style="width:${pct}%"></div>
      </div>
      <div class="value">${fmtMoney0(d.impact)}</div>
    `;
    wrap.appendChild(row);
  });
}

function renderStory() {
  const topGrowth = [...data].sort((a, b) => b.growth - a.growth)[0];
  const topWage = [...data].sort((a, b) => b.wage - a.wage)[0];
  const biggestDecline = [...data].sort((a, b) => a.growth - b.growth)[0];
  const largestSector = [...data].sort((a, b) => b.jobs - a.jobs)[0];

  document.getElementById("storyText").innerHTML = `
    Iron County added <strong>${fmtInt(totalGrowth)} jobs</strong> in September 2025 across
    <strong>${fmtInt(totalJobs)}</strong> total jobs. The strongest growth came from
    <strong>${topGrowth.category}</strong>, which added <strong>${fmtInt(topGrowth.growth)}</strong> jobs.
    The highest-paying industry was <strong>${topWage.category}</strong> at
    <strong>${fmtMoney2(topWage.wage)}</strong> per month, while
    <strong>${largestSector.category}</strong> remained the county’s largest employment base.
    Not every industry moved upward: <strong>${biggestDecline.category}</strong> saw the largest decline at
    <strong>${biggestDecline.growth}</strong> jobs.
  `;

  const chips = document.getElementById("storyChips");
  chips.innerHTML = `
    <div class="chip above">Top Growth: <strong>${topGrowth.category}</strong> (+${fmtInt(topGrowth.growth)})</div>
    <div class="chip above">Top Wage: <strong>${topWage.category}</strong> (${fmtMoney0(topWage.wage)})</div>
    <div class="chip">Largest Sector: <strong>${largestSector.category}</strong> (${fmtInt(largestSector.jobs)} jobs)</div>
    <div class="chip below">Largest Decline: <strong>${biggestDecline.category}</strong> (${biggestDecline.growth})</div>
    <div class="chip">Weighted Avg Wage: <strong>${fmtMoney2(weightedAverageWage)}</strong></div>
  `;
}

function init() {
  renderSummary();
  renderTable(data);
  renderImpactChart(data);
  renderStory();

  let metric = "growth";
  let sortMode = "growth";

  const sortBtn = document.getElementById("sortBtn");

  function updateSortBtnText() {
    sortBtn.textContent = `Sort: ${sortMode === "growth" ? "Growth" : "Wage"}`;
  }

  renderChart(data, metric, sortMode);
  updateSortBtnText();

  document.querySelectorAll('input[name="metric"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      metric = e.target.value;
      renderChart(data, metric, sortMode);
    });
  });

  sortBtn.addEventListener("click", () => {
    sortMode = sortMode === "growth" ? "wage" : "growth";
    updateSortBtnText();
    renderChart(data, metric, sortMode);
  });
}

init();