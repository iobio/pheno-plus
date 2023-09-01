<script setup>
  // FHIR.oauth2.ready().then(function(client) {
  //   // Get encounters for the selected patient
  //   client.request("/Encounter?patient=" + client.patient.id)
  //   // Reject if no encounters are found
  //   .then(function(data) {
  //       if (!data.entry || !data.entry.length) {
  //           throw new Error("No encounters found for the selected patient");
  //       }
  //       return data.entry;
  //   })
  //   // Render the current patient's encounters (or any error)
  //   .then(
  //       function(encounters) {
  //           let numEncounters = encounters.length;
  //           let encounterContainer = document.getElementById("encounters")
  //           encounterContainer.innerText = "";

  //           let numEncountersDiv = document.createElement("div");
  //           numEncountersDiv.innerText = "Number of encounters: " + numEncounters;
  //           encounterContainer.appendChild(numEncountersDiv);
  //           //insert a break
  //           let br = document.createElement("br");
  //           encounterContainer.appendChild(br);

  //           for (let encounter of encounters) {
  //               let typeDiv = document.createElement("h3");
  //               typeDiv.className = "encounter-type";
  //               let reasonDiv = document.createElement("div");
  //               let startDiv = document.createElement("div");
  //               let endDiv = document.createElement("div");

  //               //Make sure the encounter has the required fields if not note that
  //               if (encounter.resource.type && encounter.resource.type[0] && encounter.resource.type[0].text) {
  //                   typeDiv.innerText = encounter.resource.type[0].text;
  //               } else {
  //                   typeDiv.innerText = "No type found.";
  //               }

  //               if (encounter.resource.reasonCode && encounter.resource.reasonCode[0].coding[0].display) {
  //                   reasonDiv.innerText = encounter.resource.reasonCode[0].coding[0].display;
  //                   reasonDiv.className = "reason";
  //               } else {
  //                   reasonDiv.innerText = "No reason found.";
  //               }

  //               if (encounter.resource.period.start) {
  //                   startDiv.innerText = encounter.resource.period.start;
  //               } else {
  //                   startDiv.innerText = "No start date found.";
  //               }

  //               if (encounter.resource.period.end) {
  //                   endDiv.innerText = encounter.resource.period.end;
  //               } else {
  //                   endDiv.innerText = "No end date found.";
  //               }

  //               encounterContainer.appendChild(typeDiv);
  //               encounterContainer.appendChild(reasonDiv);
  //               encounterContainer.appendChild(startDiv);
  //               encounterContainer.appendChild(endDiv);
  //               let br = document.createElement("br");
  //               encounterContainer.appendChild(br);

  //               //call the note retrieval function
  //               getClinicalNote(client, encounter.resource.id);
  //           };
  //       },
  //       function(error) {
  //           document.getElementById("encounters").innerText = error.stack;
  //       }
  //   );
  // }).catch(console.error);

  // function getClinicalNote(client, encounterId) {
  //   client.request("/DocumentReference?patient=" + client.patient.id)
  //   .then(function(data) {
  //       if (!data.entry || !data.entry.length) {
  //           console.log(data)
  //           throw new Error("No clinical notes found for the selected encounter");
  //       }
  //       return data.entry;
  //   })
  //   .then(function(note) {
  //       console.log(note);
  //   })
  // }
</script>

<template>
  <h1>Hello World</h1>
</template>

<style scoped>

</style>
