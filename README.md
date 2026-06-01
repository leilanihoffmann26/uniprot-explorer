# UniProt Explorer

A small static web app for learning computational biology APIs. It accepts a protein name, gene name, or UniProt accession, sends a request to the UniProtKB REST API, and displays useful protein annotations.

## What it shows

- Protein name
- UniProt accession
- Gene name
- Organism
- Sequence length
- Reviewed or unreviewed status
- Function annotation
- Sequence preview
- Link to the UniProt entry

## Run locally

```bash
python3 -m http.server 9000
```

Then open:

```text
http://localhost:9000
```

## API endpoint

This project uses the UniProtKB search endpoint:

```text
https://rest.uniprot.org/uniprotkb/search
```

Example query:

```text
https://rest.uniprot.org/uniprotkb/search?query=(BRCA1)%20AND%20organism_id:9606%20AND%20reviewed:true&format=json&fields=accession,id,protein_name,gene_primary,organism_name,length,reviewed,cc_function,sequence&size=9
```

## How APIs work

An **API** (Application Programming Interface) is a way for one program to ask another program for data. This app uses UniProt's REST API — REST is a style of API that communicates over the web using plain URLs.

### The request

When you click Search, the app builds a URL like this:

```
https://rest.uniprot.org/uniprotkb/search
  ?query=(BRCA1) AND organism_id:9606 AND reviewed:true
  &format=json
  &fields=accession,id,protein_name,...
  &size=9
```

The part after `?` is called **query parameters** — `key=value` pairs joined by `&` that tell the server what you want. JavaScript's `fetch()` sends this as an HTTP GET request, which means "give me data" — nothing on the server is changed.

### The response

The server replies with:

- A **status code** — `200` means OK, `404` means not found, `429` means too many requests.
- A **response body** — in this case, a JSON string.

### What is JSON?

JSON (JavaScript Object Notation) is a text format for structured data:

```json
{
  "results": [
    {
      "primaryAccession": "P38398",
      "genes": [{"geneName": {"value": "BRCA1"}}],
      "sequence": {"length": 1863}
    }
  ]
}
```

`response.json()` converts that text into a JavaScript object. The app then reads specific fields — like `results[0].genes[0].geneName.value` — to populate each result card.

### See it live in the app

After every search, two tutorial panels appear below the status bar:

- **How this URL was built** — the endpoint and each query parameter, with explanations.
- **Raw JSON response** — the exact payload UniProt sent back, before it was parsed into cards.

## Ideas to add next

- Add Ensembl or NCBI lookups for gene-level metadata.
- Add a FASTA download button.
- Show domains, PDB cross-references, or Gene Ontology terms.
- Save recent searches in local storage.
- Add a detail view for one selected protein.
