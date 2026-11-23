// Get the message passed from Apple Shortcuts
// const message = String(args.shortcutParameter || "");
const hardCodedMessage = `
(4144556)
**08/17**
17 MO --OFF--
18 TU 6:00A-1:00P
19 WE 6:00A-1:00P
20 TH 12:00P-8:30P
21 FR 12:00P-8:30P
22 SA --OFF--
23 SU 12:00P-8:30P
**08/24**
24 MO --OFF--
25 TU 6:00A-1:30P
26 WE 12:00P-8:30P
27 TH 12:00P-8:30P
28 FR --OFF--
29 SA 6:00A-1:30P
30 SU 6:00A-1:30P
**08/31**
31 MO 3:00P-8:30P
01 TU --OFF--
02 WE 12:00P-8:30P
03 TH 3:00P-8:30P
04 FR --OFF--
05 SA 6:00A-1:00P
06 SU 6:00A-1:00P`;

// BLOCK 1

// Weekly header -> **MM/DD**


// Matches week headers such as:
// **08/31**
// **09/07**
const weekRegex = /\*\*(\d{2})\/(\d{2})\*\*/g;

// Matches shifts such as:
// 31 MO 3:00P-8:30P
// 01 TU --OFF--
const shiftRegex =
    /^\s*(\d{2})\s+\w{2}\s+(--OFF--|\d{1,2}:\d{2}[AP]-\d{1,2}:\d{2}[AP])\s*$/gm;

// Get today's year
const today = new Date(); // Create JS Object
let baseYear = today.getFullYear(); // Extracts year from today Date Object

// Find all week headers
const weeks = [...hardCodedMessage.matchAll(weekRegex)]; // Searches message for each occurence of weekly header Regex. 
//matchAll returns an iterator containing all matches and their capture group
// The spread operator ... takes the iterable results from matchAll() and expands them into individual elements inside an array.

// weeks[0][0] -> Entire object match
// weeks[0][1] -> MM from MM/DD match
// weeks[0][2] -> DD from MM/DD match

// BLOCK 2
const schedule = {};

console.log("Number of weeks: " + weeks.length + "\n")
for (let i = 0; i < weeks.length; i++) {

    const weekMatch = weeks[i]; // Get i-th match
    console.log("Week header: " + weeks[i]);

    // Get the month and day from the week header
    // parseInt() converts "08" -> 8
    const weekMonth = parseInt(weekMatch[1]);
    const weekStartDay = parseInt(weekMatch[2]);

    console.log("Month: " + weekMonth);
    console.log("Week Start Day: " + weekStartDay)
    console.log(weekMatch.index)
    // Determine where this week's section starts in the original text message string using the index property from our RegExp object array
    // In short: weekMatch.index tells you where the header starts, weekMatch[0].length tells you how long the header is, and adding them together tells you where the weekly schedule text begins.
    const startIndex =
        weekMatch.index + weekMatch[0].length;

    // Determine where this week's section ends
    const endIndex =
        i + 1 < weeks.length
            ? weeks[i + 1].index
            : hardCodedMessage.length;

    const weekText = hardCodedMessage.substring(startIndex, endIndex);

    // Start with the month/year from the week header
    let currentMonth = weekMonth;
    let currentYear = baseYear;
    let previousDay = weekStartDay;

    // Find all shifts in this week
    const shifts = [...weekText.matchAll(shiftRegex)];

    for (const shift of shifts) {

        const day = parseInt(shift[1]);
        const time = shift[2];

        // Detect month rollover
        //
        // Example:
        // 12/28
        // 12/29
        // 12/30
        // 12/31
        // 01/01  <-- rollover
        //
        if (day < previousDay) {
            currentMonth++;

            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }
        }

        previousDay = day;

        // Create YYYY-MM-DD key
        const dateKey =
            `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        // Only add if it doesn't already exist
        if (!(dateKey in schedule)) {
            schedule[dateKey] = time;
        }
    }
}