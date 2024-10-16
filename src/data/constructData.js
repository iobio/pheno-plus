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
        "<h1>Test Note One - Joe Smith MD</h1><p>MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays</p>");
    let note2 = new ClinicalNote(
        "0000002test", 
        "2019-01-03", 
        "Encounter/testid123", 
        "Binary/testid123", 
        "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", 
        "Test Note Two - Phil Parker MD",
        "<h1>Test Note Two - Phil Parker MD</h1><p>Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking</p>");
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