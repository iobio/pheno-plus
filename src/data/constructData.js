import ClinicalNote from "../models/ClinicalNote.js"

export default function constructData() {
    let data = [];

    let note1 = new ClinicalNote("0000001test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Title One");
    let note2 = new ClinicalNote("0000002test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Title Two");
    let note3 = new ClinicalNote("0000003test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Title One");
    let note4 = new ClinicalNote("0000004test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Title Two");
    let note5 = new ClinicalNote("0000005test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Title One");
    let note6 = new ClinicalNote("0000006test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Title Two");
    let note7 = new ClinicalNote("0000007test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "Test Title One");
    let note8 = new ClinicalNote("0000008test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking", "Test Title Two");

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