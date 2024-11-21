import ClinicalNote from "../models/ClinicalNote.js"

export default function constructData() {
    let data = [];

    let note1 = new ClinicalNote(
        "0000001test", 
        "2019-01-01", 
        "Encounter/testid123", 
        "Binary/testid123", 
        "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", 
        "Test Note One - Joe Smith MD",
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Medical Syndromes and Anomalies</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 20px;
                }
                h1, h2, h3 {
                    color: #2c3e50;
                }
                ul {
                    margin: 10px 0;
                }
                li {
                    margin: 5px 0;
                }
                .highlight {
                    background-color: #f0f8ff;
                    padding: 5px;
                    border-left: 3px solid #3498db;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Overview of Rare Syndromes and Associated Anomalies</h1>
                <p>This document provides an overview of complex syndromes, including detailed descriptions of symptoms, associated conditions, and key characteristics for better understanding.</p>
            </header>

            <main>
                <section>
                    <h2>Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus (MPPH) Syndrome</h2>
                    <p class="highlight">
                        MPPH syndrome is a complex condition involving various congenital anomalies and developmental issues. Key characteristics include:
                    </p>
                    <ul>
                        <li>Bilateral polymicrogyria and cortical dysplasia</li>
                        <li>Post-axial polysyndactyly of hands and feet</li>
                        <li>Macrosomia affecting both head size and overall length</li>
                        <li>Hypotonia and global developmental delays</li>
                        <li>Hydrocephalus contributing to increased head size</li>
                    </ul>
                </section>

                <section>
                    <h2>Multiple Congenital Anomalies</h2>
                    <p>This term refers to the presence of multiple birth defects involving different organ systems. Commonly associated conditions include:</p>
                    <ul>
                        <li>Tetralogy of Fallot, a complex congenital heart defect</li>
                        <li>Brain anomalies, including polymicrogyria and hydrocephalus</li>
                        <li>Post-axial polydactyly and syndactyly</li>
                        <li>Macrocephaly and disproportionate growth patterns</li>
                    </ul>
                    <p>Management often requires a multidisciplinary approach involving cardiology, neurology, orthopedics, and genetic counseling.</p>
                </section>

                <section>
                    <h2>Detailed Case Study: Tetralogy of Fallot</h2>
                    <p>Tetralogy of Fallot is characterized by four distinct cardiac anomalies:</p>
                    <ol>
                        <li>Ventricular septal defect (VSD)</li>
                        <li>Pulmonary stenosis</li>
                        <li>Overriding aorta</li>
                        <li>Right ventricular hypertrophy</li>
                    </ol>
                    <p>Early surgical intervention is critical for survival and improving long-term outcomes.</p>
                </section>

                <section>
                    <h2>Associated Brain Anomalies</h2>
                    <p>In MPPH syndrome, brain anomalies are a hallmark feature, including:</p>
                    <ul>
                        <li>Polymicrogyria: An abnormal organization of the brain's cortical layers</li>
                        <li>Hydrocephalus: Excess cerebrospinal fluid (CSF) within the brain's ventricles</li>
                        <li>Cortical dysplasia: Disruption of normal brain structure and function</li>
                    </ul>
                    <p>These anomalies contribute to cognitive and developmental delays, as well as seizures in some cases.</p>
                </section>

                <section>
                    <h2>Macrosomia and Growth Patterns</h2>
                    <p>Macrosomia in MPPH syndrome is defined by:</p>
                    <ul>
                        <li>Significant enlargement of the head circumference (macrocephaly)</li>
                        <li>Increased body length relative to age-matched peers</li>
                        <li>Disproportionate growth patterns affecting overall symmetry</li>
                    </ul>
                    <p>Monitoring growth is critical for early intervention and management of associated complications.</p>
                </section>

                <section>
                    <h2>Developmental Delays and Hypotonia</h2>
                    <p>Children with MPPH syndrome often exhibit:</p>
                    <ul>
                        <li>Global developmental delays impacting motor and cognitive milestones</li>
                        <li>Hypotonia, resulting in reduced muscle strength and tone</li>
                        <li>Speech and language delays requiring therapy</li>
                    </ul>
                    <p>Intervention programs, including physical and occupational therapy, are vital to support development.</p>
                </section>
            </main>
        </body>
        </html>
        `);
    let note2 = new ClinicalNote(
        "0000002test", 
        "2019-01-03", 
        "Encounter/testid123", 
        "Binary/testid123", 
        "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", 
        "Test Note Two - Phil Parker MD",
        `<h1>Test Note Two - Phil Parker MD</h1><p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        <p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>
        `);
    let note3 = new ClinicalNote(
        "0000003test", 
        "2019-01-01", 
        "Encounter/testid123", 
        "Binary/testid123", 
        "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", 
        "Test Note Three - Sara Kahal MD",
        "<h1>Test Note Three - Sara Kahal MD</h1><p>MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays</p>");
    let note4 = new ClinicalNote(
        "0000004test", 
        "2019-01-03", 
        "Encounter/testid123", 
        "Binary/testid123", 
        "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", 
        "Clinical Summary - Blake Null NP",
        "<h1>Test Note Four - Blake Null NP</h1><p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>");

    data.push(note1);
    data.push(note2);
    data.push(note3);
    data.push(note4);

    return data;
}