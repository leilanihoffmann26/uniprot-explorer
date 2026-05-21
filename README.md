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
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
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

## Ideas to add next

- Add Ensembl or NCBI lookups for gene-level metadata.
- Add a FASTA download button.
- Show domains, PDB cross-references, or Gene Ontology terms.
- Save recent searches in local storage.
- Add a detail view for one selected protein.
