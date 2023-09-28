import Encounter from "./models/Encounter.js"

export default function constructData() {
    let data = [];

    let encounter1 = new Encounter("Note-0000001", "Encounter for symptom", "MPPH; Megalencephaly-Polymicrogyria-Polydactyly-Hydrocephalus syndrome; multiple congenital anomalies; tetralogy of fallot; brain anomalies consisting of bilateral polymicrogyria and cortical dysplasia; post axial polysyndactyly of hand and feet; macrosomia affecting head and length; hypotonic with global developmental delays", "2019-01-01", "2019-01-02");
    let encounter2 = new Encounter("Note-0000002", "Encounter for symptom", "HP:0005321; Charcot-Marie-Tooth disease; demyelination; Dejerine sottas disease possibly; sensory neuropathy; hammertoes; difficulty walking, HP:0005317;", "2019-01-01", "2019-01-02");
    let encounter3 = new Encounter("Note-0000003", "Encounter for symptom", "This patient could have Angelman syndrome, or Sickle cell anemia.", "2019-01-01", "2019-01-02");
    let encounter4 = new Encounter("Note-0000004", "Encounter for symptom", "Patient has Down syndrome and difficulty swallowing. The patient also may have difficulty walking.", "2019-01-01", "2019-01-02");
    let encounter5 = new Encounter("Note-0000005", "Encounter for symptom", "Patient has a structural heart abnormality and Cystic fibrosis.", "2019-01-01", "2019-01-02");

    data.push(encounter1);
    data.push(encounter2);
    data.push(encounter3);
    data.push(encounter4);
    data.push(encounter5);

    return data;
}