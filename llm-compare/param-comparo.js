// set up defaults so we can reset the form
const formDefaults = {
  maxtokens: 256,
  topk: 50,
  temp: 0,
  repetition: 1.1,
  topp: 0.95,
  output: "",
};

// helper function to reset the form
function updateForm(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
    element.textContent = value;
  }
}

// actual reset function
function resetForm() {
  aValue = "A";
  bValue = "B";
  updateForm("tempValue" + aValue, formDefaults.temp);
  updateForm("tempValue" + bValue, formDefaults.temp);
  updateForm("temperature" + aValue, formDefaults.temp);
  updateForm("temperature" + bValue, formDefaults.temp);

  updateForm("repPenValue" + aValue, formDefaults.repetition);
  updateForm("repPenValue" + bValue, formDefaults.repetition);
  updateForm("repetitionPenalty" + aValue, formDefaults.repetition);
  updateForm("repetitionPenalty" + bValue, formDefaults.repetition);

  updateForm("topPValue" + aValue, formDefaults.topp);
  updateForm("topPValue" + bValue, formDefaults.topp);
  updateForm("topP" + aValue, formDefaults.topp);
  updateForm("topP" + bValue, formDefaults.topp);

  updateForm("maxTokens" + aValue, formDefaults.maxtokens);
  updateForm("maxTokens" + bValue, formDefaults.maxtokens);

  updateForm("topK" + aValue, formDefaults.topk);
  updateForm("topK" + bValue, formDefaults.topk);
  document.getElementById("resultA").innerHTML = "";
  document.getElementById("resultB").innerHTML = "";
}

resetForm(); // call after page loads

let selected_providerA = 0; // for calling later
let selected_providerB = 0; // for calling later

// yeah, sometimes CORS stops everything from working,
// so I have a CORS proxy installed to handle this if needed
// use the following line if going through CORS proxy
// const CORS_PROXY = "http://localhost:8080/";
// or just an empty string otherwise
const CORS_PROXY = "";

// populate the options list with all of our providers
// let element = document.getElementById("provider");
let elementA = document.getElementById("providerA");
let elementB = document.getElementById("providerB");
let i = 0;
for (const provider of providers) {
  elementA.add(new Option(provider.name, i));
  elementB.add(new Option(provider.name, i));
  i++;
}

// function to retrieve LLM models

async function getLLMsFromEndpoint(provider_number, AorB) {
  let OPTIONS = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + providers[provider_number].api_key,
    },
  };

  let url_to_call =
    CORS_PROXY + providers[provider_number].endpoint + "/models?model_type=llm";
  let response = await fetch(url_to_call, OPTIONS);
  data = await response.json();

  // sort models from large to small Billion parameters

  data.llm.sort((a, b) => {
    const getNumberBeforeB = (str) => {
      const match = str.match(/(\d+(?:\.\d+)?)B/);
      return match ? parseFloat(match[1]) : Infinity;
    };
    return getNumberBeforeB(a) - getNumberBeforeB(b);
  });

  const element = document.getElementById("model" + AorB);
  element.innerHTML = ""; // reset the list before filling
  let i = 0;
  for (const model of data.llm) {
    element.add(new Option(model, i));
    i++;
  }
}

// retrieve and store the models for each provider

getLLMsFromEndpoint(0, "A");
getLLMsFromEndpoint(0, "B");

// Helper that formats the raw LLM text (unchanged from original)
function formatResult(raw) {
  let temp = "";
  temp = JSON.stringify(raw)
    .replace(/\\n\\n/g, "</p>&nbsp;</p>")
    .replace(/"/g, "")
    .replace(/\\n/g, "</p>&nbsp;</p>")
    .replace(/(What[^?]+\?)/g, "<strong>$1</strong>")
    .replace(/^/, "<p>")
    .concat("</p>");
  return temp.replace(/\\/g, " ");
}

async function runCompare() {
  // This is the section that does inference your Configuration A

  let prompt_val = document.getElementById("prompt").value;
  let model_val =
    document.getElementById("modelA").options[
      document.getElementById("modelA").selectedIndex
    ].text;
  let max_tokens_valA = document.getElementById("maxTokensA").value;
  let top_KA = document.getElementById("topKA").value;
  let top_PA = document.getElementById("topPA").value;
  let temperatureA = document.getElementById("temperatureA").value;
  let rep_penaltyA = document.getElementById("repetitionPenaltyA").value;

  let optionsA = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + providers[selected_providerA].api_key,
    },
    body: JSON.stringify({
      prompt: prompt_val,
      model: model_val,
      stream: false,
      max_tokens: Number(max_tokens_valA),
      top_k: Number(top_KA),
      top_p: Number(top_PA),
      temperature: Number(temperatureA),
      repetition_penalty: Number(rep_penaltyA),
    }),
  };
  console.log("-----CONFIG A-------");
  console.log(JSON.stringify(optionsA));

  let url_to_call =
    CORS_PROXY + providers[selected_providerA].endpoint + "/completions";
  console.log(url_to_call);

  // let the user know that their request has fired off
  document.getElementById("resultA").innerHTML = "Fetching answer...";

  let response = await fetch(url_to_call, optionsA);

  if (response.status === 500) {
    // put error in field
    document.getElementById("resultA").innerHTML = response.message;
  } else {
    data = await response.json();
  }

  let rawText = JSON.stringify(data.choices[0].text);

  let cleanedText = formatResult(rawText);

  document.getElementById("resultA").innerHTML = cleanedText;

  //  Now onto Configuration B
  model_val =
    document.getElementById("modelB").options[
      document.getElementById("modelB").selectedIndex
    ].text;
  let max_tokens_valB = document.getElementById("maxTokensB").value;
  let top_KB = document.getElementById("topKB").value;
  let top_PB = document.getElementById("topPB").value;
  let temperatureB = document.getElementById("temperatureB").value;
  let rep_penaltyB = document.getElementById("repetitionPenaltyB").value;

  let optionsB = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + providers[selected_providerB].api_key,
    },
    body: JSON.stringify({
      prompt: prompt_val,
      model: model_val,
      stream: false,
      max_tokens: Number(max_tokens_valB),
      top_k: Number(top_KB),
      top_p: Number(top_PB),
      temperature: Number(temperatureB),
      repetition_penalty: Number(rep_penaltyB),
    }),
  };
  console.log("-----CONFIG B-------");
  console.log(JSON.stringify(optionsB));

  url_to_call =
    CORS_PROXY + providers[selected_providerB].endpoint + "/completions";
  console.log(url_to_call);

  // let the user know that their request has fired off
  document.getElementById("resultB").innerHTML = "Fetching answer...";

  response = await fetch(url_to_call, optionsB);

  if (response.status === 500) {
    // put error in field
    document.getElementById("resultB").innerHTML = response.message;
  } else {
    data = await response.json();
  }

  rawText = JSON.stringify(data.choices[0].text);

  cleanedText = formatResult(rawText);

  document.getElementById("resultB").innerHTML = cleanedText;
} // end of runCompare()

function clearResults() {
  document.getElementById("resultA").innerHTML = "";
  document.getElementById("resultB").innerHTML = "";
}
