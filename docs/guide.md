# Pheno+: Automated Phenotype Extraction from EHR Clinical Notes
## Overview and Technical Guide
*Apr 25, 2026*

---

# The Basics About Pheno+

## What Is Pheno+?

Pheno+ is an EHR-integrated application that automates phenotype extraction from clinical notes for rare disease diagnosis. For patients with suspected rare genetic conditions, relevant phenotypic observations are typically scattered across multiple notes, recorded in narrative form, and described in language that varies from one provider to the next. Assembling a complete, precise phenotypic profile from this fragmented documentation is essential for reaching an accurate diagnosis — and translating that profile into structured Human Phenotype Ontology (HPO) terms ensures the uniformity and interoperability required by computational tools for differential diagnosis and variant prioritization. Pheno+ automates this translation and presents the results for interactive review, all within the patient chart.

Pheno+ is a SMART on FHIR application that launches directly from the patient chart in the EHR. The clinician selects one or more clinical notes, Pheno+ extracts phenotype mentions and maps them to HPO terms, and the results are displayed in context for interactive review before export.

Pheno+ is developed through a collaboration between the Marth Lab at the University of Utah, clinical partners in the NICU and CICU at Primary Children's Hospital and the University of Utah Hospital, and the Department of Biomedical Informatics. The Marth Lab maintains a portfolio of clinician-focused web applications under the IOBIO platform that make analytical methods accessible to the clinicians and researchers solving complex rare disease cases through a suite of web applications that support interactive data visualization and backend services that perform on-demand, real-time analysis.

## Who Is Pheno+ For?

Pheno+ is designed for clinical professionals involved in evaluating patients with suspected genetic conditions:

- Physicians and clinical geneticists
- Genetic counselors
- Other clinical staff involved in patient phenotyping

These users work within clinical workflows where phenotype data must be captured accurately and efficiently. Pheno+ reduces the manual effort of translating clinical observations into structured HPO terms — a task that is time-consuming and requires familiarity with a large, hierarchical ontology containing over 18,000 terms.

The HPO terms produced by clinicians using Pheno+ are passed downstream to bioinformaticians, molecular pathologists, or computational analysis pipelines that perform genetic variant prioritization, phenotype-driven gene ranking, or differential diagnosis. The accuracy of this downstream analysis depends directly on the quality of the input phenotype list, which is why Pheno+ includes a clinician review step before export.

## What Knowledge Is Needed to Use Pheno+?

Pheno+ is designed to require minimal technical expertise. Clinicians use it as a way to translate their clinical observations into standardized phenotype terms. Some background knowledge is helpful:

- Familiarity with clinical phenotyping and phenotype–genotype relationships in genetic disease.
- Awareness of how phenotype specificity affects downstream analysis. For example, "seizures" (HP:0001250) is a broad term, while "febrile seizures" (HP:0002373) is more specific and more informative for differential diagnosis.
- Understanding that the review step is a clinical judgment, not a formality. Automated extraction can introduce errors that affect downstream results.

Clinicians do not need to understand the downstream bioinformatics pipelines that consume HPO terms. Their primary responsibility is ensuring that the exported phenotype list accurately represents the patient's clinical presentation.

---

# How Does Pheno+ Work?

## Phenotype Extraction

Pheno+ currently uses ClinPhen as its phenotype extraction engine. ClinPhen is a natural language processing (NLP) tool developed at Stanford that performs two tasks: identifying phenotype descriptions in clinical text (extraction) and linking those descriptions to the corresponding HPO terms (ontology mapping). ClinPhen uses a rule-based, lexicon-matching approach rather than machine learning or large language models. This design provides fast response times and low computational requirements, making it well-suited for real-time clinical use.

## Workflow

The clinical workflow proceeds in seven steps:

1. **Launch.** The clinician opens Pheno+ from the patient chart within the EHR. The app authenticates via the SMART on FHIR launch protocol and receives a scoped access token for the active patient.
2. **Fetch notes.** Pheno+ retrieves the patient's available clinical notes from the EHR via the FHIR R4 API.
3. **Select notes.** The clinician browses and selects one or more notes to analyze.
4. **Extract phenotypes.** Selected note text is sent to the phenotype extraction service, which identifies phenotype term mentions and returns HPO term IDs, source text spans, and relevance scores.
5. **Resolve HPO terms.** The app resolves HPO term IDs to human-readable names and definitions using a bundled HPO database. This lookup happens entirely in the browser with no additional server call.
6. **Review and select.** Extracted terms are displayed highlighted within the original note text, alongside each term's HPO definition. The clinician reviews each extraction in context and deselects any terms that are not relevant to the patient.
7. **Export.** The confirmed phenotype list is copied to the clipboard for use in downstream analysis tools.

## The Review Step

The review interface is a critical component of Pheno+, not a formality. Automated phenotype extraction from clinical text is an active area of NLP research, and all current tools face inherent challenges when processing free-form clinical language:

- **Attribution ambiguity.** Clinical notes often reference family members alongside the patient. A note stating "mother has a history of cardiomyopathy" describes the mother's phenotype, not the patient's. Lexicon-based extraction cannot reliably distinguish the subject of a phenotype mention from surrounding clinical context.
- **Negation and clinical qualification.** Clinicians frequently document the absence of findings ("no hepatomegaly," "seizures were ruled out") or qualify observations ("mild intermittent tremor, now resolved"). These constructions are syntactically diverse and difficult for rule-based systems to parse reliably.
- **Context-dependent terminology.** Clinical language contains phrases that overlap with phenotype vocabulary but carry different meaning in context. Extraction systems must distinguish phenotype-relevant terms from incidental clinical language, which requires contextual understanding beyond lexical matching.

These challenges are not unique to ClinPhen; they are well-characterized limitations across the phenotype extraction field. The review interface addresses them by keeping the clinician in the loop: each extracted term is shown in its original textual context so the clinician can apply their clinical judgment to confirm or reject it.

### Current Review Interface Limitations

The current review interface supports selection and deselection of extracted terms. It does not yet support:

- Choosing an alternative HPO term (e.g., selecting a more specific or more general term than the one mapped by the extraction engine).
- Modifying the boundaries of the extracted text span.
- Annotating terms with clinical qualifiers such as diagnostic importance, severity, age of onset, or whether a phenotype is incidental rather than diagnostically relevant.
- Manual entry of phenotype terms not detected by the extraction engine.

These capabilities are planned for future releases and are discussed in the Future Directions section.

## Integration with Downstream Tools

The HPO terms produced by Pheno+ serve as input to a range of computational tools used in rare disease diagnosis:

- **Variant prioritization tools** (e.g., Exomiser, LIRICAL) use HPO terms alongside genomic variant data to rank candidate genes by phenotype–genotype concordance.
- **Phenotype-driven gene ranking tools** (e.g., Phen2Gene, Phenolyzer, AMELIE) rank candidate genes using HPO terms alone, without requiring variant data.
- **Differential diagnosis tools** (e.g., Phenomizer, PubCaseFinder) use HPO terms to generate ranked lists of candidate rare diseases.

Currently, the confirmed phenotype list is exported via clipboard copy. Direct integration with downstream tools and data management systems is a priority for future development (see EHR Integration Considerations).

## SMART on FHIR and EHR Portability

Pheno+ is built on the SMART on FHIR standard, which provides a vendor-neutral framework for launching clinical applications from within an EHR, authenticating users, and accessing patient data through standardized FHIR R4 APIs. The current reference implementation runs within Epic, which provides the SMART EHR launch, OAuth 2.0 authentication, and FHIR R4 endpoints for clinical note access. Because the app depends only on standard SMART on FHIR interfaces and FHIR R4 DocumentReference resources, it is portable to any EHR system that supports these standards.

---

# Technical Information

## Architecture

Pheno+ uses a lightweight client-server architecture with minimal external dependencies.

### Client Layer

A Vue.js web application that runs inside an iframe within the EHR. The client handles SMART authentication and token exchange (via the fhirclient.js library), retrieves clinical notes from the FHIR R4 API, sends note text to the extraction service, resolves HPO term IDs to names and definitions using a bundled SQLite database (loaded in-browser via sql.js/WebAssembly), and presents the review interface. No patient data leaves the browser except for the extraction service call.

### Extraction Service

A backend service that accepts clinical note text via a REST endpoint and returns extracted HPO term IDs, source text spans, and relevance scores. ClinPhen is invoked as a Python subprocess, matching note text against a curated HPO synonym lexicon derived from the HPO release files (hp.obo). The service is stateless and processes each request independently.

### Security

Because clinical note text is processed by the extraction service, the backend must run in a protected environment that complies with institutional data security and privacy requirements (e.g., HIPAA). The SMART on FHIR interface provides scoped, read-only access to patient data; Pheno+ does not write data back to the EHR.

### Dependencies

Pheno+ has intentionally minimal third-party dependencies:

| Component | Layer | Purpose |
|---|---|---|
| Vue.js | Client | Web application framework |
| fhirclient.js | Client | SMART on FHIR authentication and token management |
| sql.js (WebAssembly) | Client | In-browser SQLite for HPO term lookup |
| ClinPhen (Python) | Server | Phenotype extraction engine |
| Node.js / Express | Server | REST endpoint for extraction requests |

## Pilot Deployment

Pheno+ is currently piloted at Primary Children's Hospital and the University of Utah Hospital in two clinical settings: the Neonatal Intensive Care Unit (NICU) and the Cardiac Intensive Care Unit (CICU). These pilots are conducted in partnership with an implementation science team that supports the evaluation and integration of EHR-based clinical applications.

Expansion to additional institutions is underway. The SMART on FHIR architecture and minimal infrastructure requirements are designed to make adoption straightforward for hospitals with standard EHR environments.

## EHR Integration Considerations

Pheno+ currently operates in a read-only mode: it reads clinical notes from the EHR and exports confirmed HPO terms via clipboard copy. Writing structured output back to the EHR is planned for future releases and will follow each adopting institution's standard governance and approval process for clinical applications. This phased approach allows clinical teams to begin using Pheno+ immediately while write-back integration is developed in parallel.

---

# Future Directions

## LLM-Based Phenotype Extraction

Future releases may replace or augment ClinPhen with a large language model (LLM)-based extraction system. LLM-based approaches offer meaningful improvements in the areas where lexicon-based extraction is weakest: contextual understanding of attribution, negation handling, and disambiguation of clinical language. Recent published systems such as RAG-HPO (Garcia et al., Genome Medicine 2025) demonstrate that retrieval-augmented LLM architectures can achieve higher extraction accuracy (F1 0.78) while grounding outputs in structured HPO vocabulary to control hallucination.

An LLM-based extraction engine can be deployed behind the same REST API that Pheno+ currently uses, meaning the clinical interface would remain unchanged. The extraction service is modular by design: upgrading the backend engine requires no changes to the client application or the SMART on FHIR integration layer.

## Phenopackets Export

Currently, Pheno+ exports HPO terms as a text list. Future releases may support export in the Phenopackets format, a GA4GH standard for sharing patient phenotype and clinical data. Phenopackets supports structured representation of HPO terms alongside metadata such as age of onset, severity, and family member associations. This would improve interoperability with downstream computational tools and clinical data repositories.

## Phenotype Qualifiers

Future improvements may allow clinicians to annotate phenotype terms with qualifiers during the review step, including:

- Diagnostic importance (primary vs. incidental phenotypes)
- Severity
- Age of onset
- Family member attribution (proband vs. relative)

These qualifiers can improve downstream computational analyses by allowing tools to weight phenotypes by their diagnostic relevance and filter out incidental findings that may introduce noise.

## Iterative Phenotype Refinement

The diagnostic process is iterative. As new information becomes available — additional clinical encounters, laboratory results, imaging findings, or genetic test results that rule out certain conditions — clinicians may need to modify the phenotype list. Future versions of Pheno+ may support:

- Bidirectional feedback with downstream analysis tools, allowing diagnostic results to inform phenotype review.
- Iterative updates to phenotype lists as clinical presentations evolve across encounters.
- Identification and removal of non-informative phenotypes that may introduce noise into downstream analysis.

## Longitudinal Phenotype Tracking

For pediatric and genetic conditions, phenotypes often evolve over time. A phenotype present at birth may resolve, while new phenotypes emerge as the child develops. Tracking the timing of phenotype appearance and resolution can improve variant prioritization and disease interpretation. Future systems may support time-stamped phenotype records and longitudinal patient phenotype profiles.

## Phenotype List Optimization

Beyond extraction, the phenotype list itself can be evaluated for diagnostic quality. Future work will apply knowledge-graph-grounded diagnostic reasoning to assess the coherence, completeness, and granularity of a patient's phenotype set. The approach uses re-ranking of candidate genes and diseases against a biomedical knowledge graph to test whether the phenotype list reliably discriminates between candidates — and whether that discrimination is stable when individual terms are removed, replaced with broader or narrower alternatives, or supplemented with additional observations. This sensitivity analysis can identify phenotype lists that are fragile, over-reliant on a single term, or missing discriminatory phenotypes from key organ systems. The goal is to provide clinicians with actionable feedback on where refining the phenotype list would have the greatest impact on diagnostic accuracy.
