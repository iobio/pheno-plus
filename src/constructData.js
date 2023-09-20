import Encounter from "./models/encounter"

export default function constructData() {
    let data = [];

    let encounter1 = new Encounter("0000001", "Encounter for symptom", "This patient might have some demyelination, a club foot, and difficulty walking.", "2019-01-01", "2019-01-02");
    let encounter2 = new Encounter("0000002", "Encounter for symptom", "This patient might have hammertoes.", "2019-01-01", "2019-01-02");
    let encounter3 = new Encounter("0000003", "Encounter for symptom", "This patient could have Angelman syndrome, or Sickle cell anemia.", "2019-01-01", "2019-01-02");
    let encounter4 = new Encounter("0000004", "Encounter for symptom", "Patient has Down syndrome and difficulty swallowing.", "2019-01-01", "2019-01-02");
    let encounter5 = new Encounter("0000005", "Encounter for symptom", "Patient has a structural heart abnormality and Cystic fibrosis.", "2019-01-01", "2019-01-02");

    data.push(encounter1);
    data.push(encounter2);
    data.push(encounter3);
    data.push(encounter4);
    data.push(encounter5);

    return data;
}