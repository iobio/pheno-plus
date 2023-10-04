import ClinicalNote from "./models/ClinicalNote.js"

export default function constructData() {
    let data = [];

    let note1 = new ClinicalNote("0000001test", "2019-01-01", "Encounter/testid123", "Binary/testid123", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays");
    let note2 = new ClinicalNote("0000002test", "2019-01-03", "Encounter/testid123", "Binary/testid123", "HP:0005321; Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking, HP:0005317;");

    data.push(note1);
    data.push(note2);

    return data;
}