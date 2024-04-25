# pheno-plus
Phenotype gathering application for use as a component within an EHR. 

# Component Diagram
Below is the current UI with components labeled. 

<b>Data shown is only demo data.</b>

<img width="1535" alt="Screenshot 2023-09-25 at 4 29 56 PM" src="https://github.com/emersonlebleu/pheno-plus/assets/45885321/b84ea128-36da-4f72-9945-9a78d4e5e40f">

#### Dev Notes:
The urls change between prod and staging becuase of what Epic expects so the base url is configured for `/phenoplus/oauth2/redirect/` with staging and only `/launch/` for prod. This means that any static files typically at just the root url are referenced from these points if using them in the application and they differ between instances. This is mostly relevant to the whitelist as we likely won't have anything else with this issue in the app after dev is complete.