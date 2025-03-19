// Import jsdom
import { JSDOM } from "jsdom";

const districts = [
  "001",
  "080",
  "089",
  "093",
  "002",
  "005",
  "007",
  "003",
  "006",
  "004",
  "088",
  "094",
  "008",
  "009",
  "095",
  "012",
  "011",
  "010",
  "013",
  "014",
  "096",
  "018",
  "023",
  "015",
  "017",
  "021",
  "016",
  "019",
  "020",
  "024",
  "025",
  "026",
  "028",
  "081",
  "027",
  "097",
  "098",
  "032",
  "099",
  "033",
  "084",
  "029",
  "031",
  "030",
  "100",
  "035",
  "034",
  "037",
  "036",
  "101",
  "038",
  "039",
  "042",
  "054",
  "055",
  "040",
  "045",
  "092",
  "051",
  "047",
  "050",
  "048",
  "041",
  "044",
  "085",
  "090",
  "091",
  "086",
  "049",
  "053",
  "046",
  "103",
  "052",
  "102",
  "043",
  "087",
  "057",
  "067",
  "059",
  "063",
  "083",
  "056",
  "069",
  "104",
  "058",
  "066",
  "062",
  "060",
  "065",
  "071",
  "068",
  "070",
  "061",
  "073",
  "105",
  "074",
  "075",
  "077",
  "078",
  "079",
  "076",
];

const url = "https://www.emsd.gov.hk/beeo/en/register/search_foc.php";

// Function to search for a building
async function searchBuilding(district) {
  const formData = new URLSearchParams();
  formData.append("search_dist", district);
  formData.append("type", "search");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.text(); // Assuming the response is HTML or plain text

    // Parse the HTML string with jsdom
    const dom = new JSDOM(result);
    const document = dom.window.document;

    // Extract the value
    const valueElement = document.querySelector(".pagedisplay");
    const totalRecords = valueElement ? parseInt(valueElement.textContent, 10) : 0;

    console.log(`Results for ${district}:\n`, totalRecords);
    return totalRecords; // Return the total records for this district
  } catch (error) {
    console.error(`Failed to fetch results for ${district}:`, error);
  }
}

// Iterate over the list of buildings
async function searchAllBuildings() {
    let grandTotal = 0; // Initialize grand total

  for (const district of districts) {
    const districtTotal = await searchBuilding(district); // Fetch the total records for the district
    grandTotal += districtTotal; // Accumulate the total records
  }

  console.log(`Total Records of FOC: ${grandTotal}`);
}

// Execute the search for all buildings
searchAllBuildings();
