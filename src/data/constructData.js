import ClinicalNote from "../models/ClinicalNote.js"

export default function constructData() {
    let data = [];

    let note1 = new ClinicalNote("0000001test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Note One - Joe Smith MD");
    let note2 = new ClinicalNote("0000002test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Note Two - Phil Parker MD");
    let note3 = new ClinicalNote("0000003test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Note Three - Sara Kahal MD");
    let note4 = new ClinicalNote("0000004test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Clinical Summary - Blake Null NP");
    let note5 = new ClinicalNote("0000005test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Note Five - Jane Doe MD");
    let note6 = new ClinicalNote("0000006test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Clinical Note - Sally Saltz DO");
    let note7 = new ClinicalNote("0000007test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Note Seven - Karen Smith MD");
    let note8 = new ClinicalNote("0000008test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Note Eight - Faith Blue MD");

    data.push(note1);
    data.push(note2);
    data.push(note3);
    data.push(note4);
    data.push(note5);
    data.push(note6);
    data.push(note7);
    data.push(note8);

    return data;
}