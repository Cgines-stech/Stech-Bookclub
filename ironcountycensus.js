const censusData = [
  { fact: "Population estimates, July 1, 2025, (V2025)", value: "NA" },
  { fact: "Population estimates, July 1, 2024, (V2024)", value: "65,936" },
  { fact: "Population estimates base, April 1, 2020, (V2025)", value: "NA" },
  { fact: "Population estimates base, April 1, 2020, (V2024)", value: "57,281" },
  { fact: "Population, percent change - April 1, 2020 (estimates base) to July 1, 2025, (V2025)", value: "NA" },
  { fact: "Population, percent change - April 1, 2020 (estimates base) to July 1, 2024, (V2024)", value: "15.10%" },
  { fact: "Population, Census, April 1, 2020", value: "57,289" },
  { fact: "Population, Census, April 1, 2010", value: "46,163" },
  { fact: "Persons under 5 years, percent", value: "6.20%" },
  { fact: "Persons under 18 years, percent", value: "25.80%" },
  { fact: "Persons 65 years and over, percent", value: "14.50%" },
  { fact: "Female persons, percent", value: "49.70%" },
  { fact: "White alone, percent", value: "92.40%" },
  { fact: "Black alone, percent", value: "1.00%" },
  { fact: "American Indian and Alaska Native alone, percent", value: "2.30%" },
  { fact: "Asian alone, percent", value: "1.30%" },
  { fact: "Native Hawaiian and Other Pacific Islander alone, percent", value: "0.50%" },
  { fact: "Two or More Races, percent", value: "2.50%" },
  { fact: "Hispanic or Latino, percent", value: "11.20%" },
  { fact: "White alone, not Hispanic or Latino, percent", value: "82.90%" },
  { fact: "Veterans, 2020-2024", value: "2,591" },
  { fact: "Foreign-born persons, percent, 2020-2024", value: "4.30%" },
  { fact: "Housing Units, July 1, 2024, (V2024)", value: "25,055" },
  { fact: "Owner-occupied housing unit rate, 2020-2024", value: "68.30%" },
  { fact: "Median value of owner-occupied housing units, 2020-2024", value: "$379,000" },
  { fact: "Median selected monthly owner costs - with a mortgage, 2020-2024", value: "$1,589" },
  { fact: "Median selected monthly owner costs - without a mortage, 2020-2024", value: "$427" },
  { fact: "Median gross rent, 2020-2024", value: "$1,065" },
  { fact: "Building Permits, 2024", value: "655" },
  { fact: "Households, 2020-2024", value: "20,157" },
  { fact: "Persons per household, 2020-2024", value: "3.03" },
  { fact: "Living in the same house 1 year ago, percent of persons age 1 year+, 2020-2024", value: "82.70%" },
  { fact: "Language other than English spoken at home, percent of persons age 5 years+, 2020-2024", value: "8.60%" },
  { fact: "Households with a computer, percent, 2020-2024", value: "98.40%" },
  { fact: "Households with a broadband Internet subscription, percent, 2020-2024", value: "91.50%" },
  { fact: "High school graduate or higher, percent of persons age 25 years+, 2020-2024", value: "93.20%" },
  { fact: "Bachelor's degree or higher, percent of persons age 25 years+, 2020-2024", value: "31.60%" },
  { fact: "With a disability, under age 65 years, percent, 2020-2024", value: "10.00%" },
  { fact: "Persons without health insurance, under age 65 years, percent", value: "10.40%" },
  { fact: "In civilian labor force, total, percent of population age 16 years+, 2020-2024", value: "64.00%" },
  { fact: "In civilian labor force, female, percent of population age 16 years+, 2020-2024", value: "59.20%" },
  { fact: "Total accommodation and food services sales, 2022 ($1,000)", value: "157,503" },
  { fact: "Total health care and social assistance receipts/revenue, 2022 ($1,000)", value: "292,504" },
  { fact: "Total transportation and warehousing receipts/revenue, 2022 ($1,000)", value: "83,207" },
  { fact: "Total retail sales, 2022 ($1,000)", value: "1,161,920" },
  { fact: "Total retail sales per capita, 2022", value: "$18,588" },
  { fact: "Mean travel time to work (minutes), workers age 16 years+, 2020-2024", value: "16.9" },
  { fact: "Median households income (in 2024 dollars), 2020-2024", value: "$66,247" },
  { fact: "Per capita income in past 12 months (in 2024 dollars), 2020-2024", value: "$30,186" },
  { fact: "Persons in poverty, percent", value: "12.60%" },
  { fact: "Total employer establishments, 2023", value: "1,935" },
  { fact: "Total employment, 2023", value: "18,547" },
  { fact: "Total annual payroll, 2023 ($1,000)", value: "792,497" },
  { fact: "Total employment, percent change, 2022-2023", value: "5.00%" },
  { fact: "Total nonemployer establishments, 2023", value: "5,337" },
  { fact: "All employer firms, Reference year 2022", value: "1,795" },
  { fact: "Men-owned employer firms, Reference year 2022", value: "1,066" },
  { fact: "Women-owned employer firms, Reference year 2022", value: "317" },
  { fact: "Minority-owned employer firms, Reference year 2022", value: "144" },
  { fact: "Nonminority-owned employer firms, Reference year 2022", value: "1,507" },
  { fact: "Veteran-owned employer firms, Reference year 2022", value: "106" },
  { fact: "Nonveteran-owned employer firms, Reference year 2022", value: "1,530" },
  { fact: "Population per square mile, 2020", value: "17.4" },
  { fact: "Population per square mile, 2010", value: "14" },
  { fact: "Land area in square miles, 2020", value: "3,296.34" },
  { fact: "Land area in square miles, 2010", value: "3,296.68" }
];

let promptGenerated = false;
const usableFacts = censusData.filter(item => item.value !== "NA");

let factA = null;
let factB = null;

function renderTable() {
  const tbody = document.querySelector("#censusTable tbody");
  tbody.innerHTML = "";

  censusData.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.fact}</td>
      <td class="num">${item.value}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getRandomFact(excludeFact = null) {
  let pool = usableFacts;
  if (excludeFact) {
    pool = usableFacts.filter(item => item.fact !== excludeFact);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function generatePrompt() {
  return `One interesting comparison in Iron County is that ${factA.fact} is ${factA.value}, while ${factB.fact} is ${factB.value}.

This could mean that...`;
}

function renderFactA() {
  factA = getRandomFact(factB?.fact);
  document.getElementById("factATitle").textContent = factA.fact;
  document.getElementById("factAValue").textContent = factA.value;

  if (promptGenerated) {
    document.getElementById("comparisonBox").value = generatePrompt();
  }
}

function renderFactB() {
  factB = getRandomFact(factA?.fact);
  document.getElementById("factBTitle").textContent = factB.fact;
  document.getElementById("factBValue").textContent = factB.value;

  if (promptGenerated) {
    document.getElementById("comparisonBox").value = generatePrompt();
  }
}

function init() {
  renderTable();
  renderFactA();
  renderFactB();

  document.getElementById("rerollA").addEventListener("click", renderFactA);
  document.getElementById("rerollB").addEventListener("click", renderFactB);

  document.getElementById("copyPromptBtn").addEventListener("click", () => {
    const box = document.getElementById("comparisonBox");
    box.value = generatePrompt();
    box.focus();
    promptGenerated = true;
  });

  document.getElementById("comparisonBox").addEventListener("input", () => {
    promptGenerated = false;
  });
}

init();