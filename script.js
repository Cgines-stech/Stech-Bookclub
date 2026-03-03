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

const TOWN_SIZE = 250;

const fmtInt = (n) => n.toLocaleString("en-US");
const fmtMoney = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtMoney2 = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const totalOpenings = data.reduce((sum, d) => sum + d.openings, 0);

// Scale openings to a town of 250 people (rounded, and sums to 250)
function scaledTownCounts(rows, townSize) {
  // initial rounded allocation
  const raw = rows.map(d => ({ ...d, rawPeople: (townSize * d.openings) / totalOpenings }));
  const base = raw.map(d => ({ ...d, people: Math.floor(d.rawPeople) }));
  let allocated = base.reduce((s, d) => s + d.people, 0);

  // distribute remaining by largest fractional parts
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

  // Build a simple narrative: who is most common + what pays the most
  const mostCommon = [...town].sort((a,b)=>b.people-a.people)[0];
  const highestPay = [...town].sort((a,b)=>b.wage-a.wage)[0];

  const story = `
    Imagine a town of <strong>${TOWN_SIZE} people</strong> where each person represents a job opening.
    In that town, the biggest group is <strong>${mostCommon.edu}</strong> with about
    <strong>${mostCommon.people} people</strong>. The highest typical pay shows up at the top education level:
    <strong>${highestPay.edu}</strong>, where the typical median wage is about <strong>${fmtMoney(highestPay.wage)}</strong>.
    The chart below helps you see both the “how many” (openings) and the “how much” (wages).
  `;
  document.getElementById("storyText").innerHTML = story;

  // Chips
  const chips = document.getElementById("storyChips");
  chips.innerHTML = "";
  town
    .sort((a,b)=>b.people-a.people)
    .forEach(d => {
      const el = document.createElement("div");
      el.className = "chip";
      el.innerHTML = `${d.edu}: <strong>${d.people}</strong> / ${TOWN_SIZE}`;
      chips.appendChild(el);
    });
}

function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach(d => {
    const tr = document.createElement("tr");
    const share = (d.openings / totalOpenings) * 100;

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
      <div class="value">${metric === "openings" ? fmtInt(val) : fmtMoney(val)}</div>
    `;
    chart.appendChild(row);
  });

  note.textContent =
    metric === "openings"
      ? "Bars show total openings (largest category = 100%)."
      : "Bars show weighted average median wage (highest wage category = 100%).";
}

function init() {
  renderStory();
  renderTable(data);

  // UI state
  let metric = "openings";
  let sortMode = "openings"; // default

  const sortBtn = document.getElementById("sortBtn");

  function updateSortBtnText() {
    sortBtn.textContent = `Sort: ${sortMode === "openings" ? "Openings" : "Wage"} (desc)`;
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
    sortMode = sortMode === "openings" ? "wage" : "openings";
    updateSortBtnText();
    renderChart(data, metric, sortMode);
  });
}

init();