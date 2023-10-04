import Encounter from "./models/Encounter.js"

export default function constructData() {
    let data = [];

    let encounter1 = new Encounter("0000001test", "Encounter for symptom", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "2019-01-01", "2019-01-02");
    let encounter2 = new Encounter("0000002test", "Encounter for symptom", "HP:0005321; Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking, HP:0005317;", "2019-01-01", "2019-01-02");

    data.push(encounter1);
    data.push(encounter2);

    return data;
}