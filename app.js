const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const organismInput = document.querySelector("#organism");
const reviewedInput = document.querySelector("#reviewed");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
const apiLink = document.querySelector("#api-link");
const template = document.querySelector("#result-template");

const SEARCH_ENDPOINT = "https://rest.uniprot.org/uniprotkb/search";
const RESULT_FIELDS = [
  "accession",
  "id",
  "protein_name",
  "gene_primary",
  "organism_name",
  "length",
  "reviewed",
  "cc_function",
  "sequence",
].join(",");

function buildQuery(searchTerm, organismId, reviewedOnly) {
  const clauses = [`(${searchTerm.trim()})`];

  if (organismId.trim()) {
    clauses.push(`organism_id:${organismId.trim()}`);
  }

  if (reviewedOnly) {
    clauses.push("reviewed:true");
  }

  return clauses.join(" AND ");
}

function buildUrl(searchTerm, organismId, reviewedOnly) {
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("query", buildQuery(searchTerm, organismId, reviewedOnly));
  url.searchParams.set("format", "json");
  url.searchParams.set("fields", RESULT_FIELDS);
  url.searchParams.set("size", "9");
  return url;
}

function getProteinName(entry) {
  return (
    entry.proteinDescription?.recommendedName?.fullName?.value ||
    entry.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
    entry.uniProtkbId ||
    "Unnamed protein"
  );
}

function getGeneName(entry) {
  return entry.genes?.[0]?.geneName?.value || "Not listed";
}

function getFunction(entry) {
  const functionComment = entry.comments?.find((comment) => comment.commentType === "FUNCTION");
  return functionComment?.texts?.map((item) => item.value).join(" ") || "No function comment returned.";
}

function formatSequence(sequence) {
  if (!sequence?.value) {
    return "No sequence returned.";
  }

  const preview = sequence.value.slice(0, 240);
  const chunks = preview.match(/.{1,60}/g) || [];
  const suffix = sequence.value.length > preview.length ? "\n..." : "";
  return chunks.join("\n") + suffix;
}

function renderEmpty(message, isError = false) {
  resultsEl.innerHTML = "";
  const node = document.createElement("p");
  node.className = `empty-state${isError ? " error" : ""}`;
  node.textContent = message;
  resultsEl.append(node);
}

function renderResults(entries) {
  resultsEl.innerHTML = "";

  if (!entries.length) {
    renderEmpty("No UniProt entries matched this search. Try removing the organism ID or reviewed-only filter.");
    return;
  }

  entries.forEach((entry) => {
    const card = template.content.cloneNode(true);
    const accession = entry.primaryAccession;
    const reviewed = entry.entryType?.includes("Swiss-Prot");

    card.querySelector(".accession").textContent = accession;
    card.querySelector("h2").textContent = getProteinName(entry);
    card.querySelector(".badge").textContent = reviewed ? "Reviewed" : "Unreviewed";
    card.querySelector(".gene").textContent = getGeneName(entry);
    card.querySelector(".organism").textContent = entry.organism?.scientificName || "Unknown organism";
    card.querySelector(".length").textContent = entry.sequence?.length ? `${entry.sequence.length} aa` : "Unknown";
    card.querySelector(".function").textContent = getFunction(entry);
    card.querySelector(".sequence").textContent = formatSequence(entry.sequence);

    const entryLink = card.querySelector(".entry-link");
    entryLink.href = `https://www.uniprot.org/uniprotkb/${accession}/entry`;
    entryLink.textContent = `Open ${accession}`;

    resultsEl.append(card);
  });
}

async function searchUniProt(event) {
  event.preventDefault();

  const searchTerm = queryInput.value.trim();
  if (!searchTerm) {
    renderEmpty("Type a protein name, gene name, or UniProt accession to search.");
    return;
  }

  const url = buildUrl(searchTerm, organismInput.value, reviewedInput.checked);
  apiLink.href = url.toString();
  statusEl.textContent = "Searching UniProtKB...";
  resultsEl.innerHTML = "";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`UniProt returned ${response.status}`);
    }

    const data = await response.json();
    const entries = data.results || [];
    statusEl.textContent = `Showing ${entries.length} result${entries.length === 1 ? "" : "s"} from UniProtKB.`;
    renderResults(entries);
  } catch (error) {
    statusEl.textContent = "Search failed.";
    renderEmpty(`${error.message}. Check the API link or try again later.`, true);
  }
}

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.query;
    if ("organism" in button.dataset) {
      organismInput.value = button.dataset.organism;
    }
    form.requestSubmit();
  });
});

form.addEventListener("submit", searchUniProt);
form.requestSubmit();
