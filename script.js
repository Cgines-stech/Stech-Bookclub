// Data (as provided)
const data = [
  { edu: "No Formal Education", openings: 70990, wage: 34466.92 },
  { edu: "High School", openings: 94270, wage: 46941.56 },
  { edu: "Some College (no degree)", openings: 6160, wage: 43364.22 },
  { edu: "Technical Degree", openings: 15720, wage: 48050.85 },
  { edu: "Associate's Degree", openings: 5170, wage: 59106.34 },
  { edu: "Bachelor's Degree", openings: 47150, wage: 118463.30 },
  { edu: "Master's Degree", openings: 3750, wage: 118504.37 },
  { edu: "Doctoral Degree", openings: 3160, wage: 159308.01 },
];

// New constant from you:
const UTAH_COST_OF_LIVING = 51027; // single adult estimate
const TOWN_SIZE = 250;

const fmtInt = (n) => n.toLocaleString("en-US");
const fmtMoney0 = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtMoney2 = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const totalOpenings = data.reduce((sum, d) => sum + d.openings, 0);

// Scale openings to a town of 250 people (rounded, and sums to 250)
function scaledTownCounts(rows, townSize) {
  const raw = rows.map(d => ({ ...d, rawPeople: (townSize * d.openings) / totalOpenings }));
  const base = raw.map(d => ({ ...d, people: Math.floor(d.rawPeople) }));
  let allocated = base.reduce((s, d) => s + d.people, 0);

  const remainders = base
    .map(d => ({ edu: d.edu, frac: d.rawPeople - d.people }))
    .sort((a, b) => b.frac - a.frac);

  let i = 0;
  while (allocated < townSize) {
    const target = remainders[i % remainders.length].edu;
    const idx = base.findIndex(d => d.edu === target);
    base[idx].people += 1;
    allocated += 1;
    i += 1;
  }

  return base.map(d => ({ edu: d.edu, people: d.people, wage: d.wage, openings: d.openings }));
}

function renderStory() {
  document.getElementById("totalOpenings").textContent = fmtInt(totalOpenings);
  const town = scaledTownCounts(data, TOWN_SIZE);

  const mostCommon = [...town].sort((a,b)=>b.people-a.people)[0];
  const highestPay = [...town].sort((a,b)=>b.wage-a.wage)[0];

  // Count how many "people" in the 250-town are in categories below cost of living
const below = town.filter(d => d.wage < UTAH_COST_OF_LIVING).reduce((s,d)=>s+d.people,0);
const above = TOWN_SIZE - below;

renderPeopleIcons(above, below);

const story = `
  Imagine a new town was settled that represents Utah as a population. <strong>${TOWN_SIZE} people</strong> where each person represents a job opening.
  Utah’s estimated cost of living for a single adult is about <strong>${fmtMoney0(UTAH_COST_OF_LIVING)}</strong>.
  In this town, about <strong>${above}</strong> people are in education groups where the wage is
  <strong>enough to meet or exceed</strong> that benchmark — while about <strong>${below}</strong> people fall
  <strong>below</strong> it.
  The chips below are highlighted: <span class="badge ok">Above COL</span> and <span class="badge no">Below COL</span>.
`;
  document.getElementById("storyText").innerHTML = story;

  const chips = document.getElementById("storyChips");
  chips.innerHTML = "";
  town
  .sort((a,b)=>b.people-a.people)
  .forEach(d => {
    const isAbove = d.wage >= UTAH_COST_OF_LIVING;

    const el = document.createElement("div");
    el.className = `chip ${isAbove ? "above" : "below"}`;

    el.innerHTML = `
      ${d.edu}: <strong>${d.people}</strong> / ${TOWN_SIZE}
      <span class="badge ${isAbove ? "ok" : "no"}">
        ${isAbove ? "Above COL" : "Below COL"}
      </span>
    `;
    chips.appendChild(el);
  });
}

function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach(d => {
    const share = (d.openings / totalOpenings) * 100;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.edu}</td>
      <td class="num">${fmtInt(d.openings)}</td>
      <td class="num">${fmtMoney2(d.wage)}</td>
      <td class="num">${share.toFixed(1)}%</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalOpeningsFoot").textContent = fmtInt(totalOpenings);
}

function renderChart(rows, metric, sortMode) {
  const chart = document.getElementById("chart");
  const note = document.getElementById("chartNote");
  chart.innerHTML = "";

  const sorted = [...rows].sort((a,b) => {
    if (sortMode === "openings") return b.openings - a.openings;
    if (sortMode === "wage") return b.wage - a.wage;
    return 0;
  });

  const maxVal = Math.max(...sorted.map(d => metric === "openings" ? d.openings : d.wage));

  sorted.forEach(d => {
    const val = metric === "openings" ? d.openings : d.wage;
    const pct = (val / maxVal) * 100;

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="label">${d.edu}</div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      <div class="value">${metric === "openings" ? fmtInt(val) : fmtMoney0(val)}</div>
    `;
    chart.appendChild(row);
  });

  note.textContent =
    metric === "openings"
      ? "Bars show total openings (largest category = 100%)."
      : "Bars show weighted average median wage (highest wage category = 100%).";
}

// B) Wage vs Cost of Living visualization
function renderWageVsCOL(rows) {
  const wrap = document.getElementById("wageColChart");
  const colNote = document.getElementById("colNote");
  wrap.innerHTML = "";

  colNote.innerHTML = `
    <span class="pill">Utah cost of living: <strong>${fmtMoney0(UTAH_COST_OF_LIVING)}</strong></span>
    <span class="pill">Red = shortfall to reach COL • Green = surplus above COL</span>
  `;

  // Scale to max wage so every row uses the same ruler
  const maxWage = Math.max(...rows.map(d => d.wage));
  const colPct = (UTAH_COST_OF_LIVING / maxWage) * 100;

  const sorted = [...rows].sort((a, b) => b.wage - a.wage);

  sorted.forEach(d => {
    const wagePct = (d.wage / maxWage) * 100;
    const diff = d.wage - UTAH_COST_OF_LIVING;
    const isAbove = diff >= 0;

    // For below COL:
    // show RED from wagePct to colPct (the missing piece)
    const shortfallLeft = wagePct;
    const shortfallWidth = Math.max(0, colPct - wagePct);

    // For above COL:
    // show GREEN from colPct to wagePct (the extra piece)
    const surplusLeft = colPct;
    const surplusWidth = Math.max(0, wagePct - colPct);

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="label">${d.edu}</div>
      <div class="track col">
        <div class="col-marker" style="left:${Math.min(colPct,100)}%"></div>

        ${
          !isAbove && shortfallWidth > 0
            ? `<div class="col-shortfall" style="left:${shortfallLeft}%; width:${shortfallWidth}%;"></div>`
            : ""
        }

        ${
          isAbove && surplusWidth > 0
            ? `<div class="col-surplus" style="left:${surplusLeft}%; width:${surplusWidth}%;"></div>`
            : ""
        }
      </div>
      <div class="value ${isAbove ? "good" : "bad"}">
        ${fmtMoney0(d.wage)} (${diff >= 0 ? "+" : "−"}${fmtMoney0(Math.abs(diff))})
      </div>
    `;
    wrap.appendChild(row);
  });
}

function init() {
  renderStory();
  renderTable(data);

  let metric = "openings";
  let sortMode = "openings";

  const sortBtn = document.getElementById("sortBtn");

  function updateSortBtnText() {
    sortBtn.textContent = `Sort: ${sortMode === "openings" ? "Openings" : "Wage"} (desc)`;
  }

  renderChart(data, metric, sortMode);
  renderWageVsCOL(data);
  updateSortBtnText();

  document.querySelectorAll('input[name="metric"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      metric = e.target.value;
      renderChart(data, metric, sortMode);
    });
  });

  sortBtn.addEventListener("click", () => {
    sortMode = sortMode === "openings" ? "wage" : "openings";
    updateSortBtnText();
    renderChart(data, metric, sortMode);
  });
}

function renderPeopleIcons(abovePeople, belowPeople) {
  // 25 icons represent the 250-person town => each icon = 10 people
  const totalIcons = 25;
  const peoplePerIcon = 10;

  // Convert people counts to icons (rounded to nearest icon)
  let greenIcons = Math.round(abovePeople / peoplePerIcon);
  greenIcons = Math.max(0, Math.min(totalIcons, greenIcons));
  let redIcons = totalIcons - greenIcons;

  // If you explicitly want 6 green / 19 red no matter what, force it:
  // const greenIcons = 6; const redIcons = 19;

  const grid = document.getElementById("peopleGrid");
  const summary = document.getElementById("iconSummary");
  if (!grid || !summary) return;

  summary.textContent = `(${greenIcons} of 25 icons green = about ${greenIcons * 10} of ${TOWN_SIZE} people)`;

  grid.innerHTML = "";

  const personSVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"></path>
    </svg>
  `;

  // Build icons (greens first, then reds)
  const icons = [
    ...Array(greenIcons).fill("ok"),
    ...Array(redIcons).fill("no"),
  ];

  icons.forEach((klass, idx) => {
    const el = document.createElement("div");
    el.className = `person ${klass}`;
    el.title = klass === "ok"
      ? "Enough (≥ cost of living)"
      : "Not enough (< cost of living)";
    el.innerHTML = personSVG;
    grid.appendChild(el);
  });
}

init();