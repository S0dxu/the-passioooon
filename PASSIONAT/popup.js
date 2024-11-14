document.getElementById("countButton").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: countWordsOnPage,
        },
        (results) => {
          if (results && results[0].result) {
            updateCounts(results[0].result);
          }
        }
      );
    });
  });
  
  function countWordsOnPage() {
    const targetWords = ["passion", "passionate"];
    const text = document.body.innerText || "";
  
    function countWords(text, words) {
      const wordCounts = {};
      words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        wordCounts[word] = (text.match(regex) || []).length;
      });
      return wordCounts;
    }
  
    return countWords(text, targetWords);
  }
  
  function updateCounts(currentCounts) {
    chrome.storage.local.get("wordCounts", (data) => {
      let totalCounts = data.wordCounts || {};
      for (const word in currentCounts) {
        if (!totalCounts[word]) totalCounts[word] = 0;
        totalCounts[word] += currentCounts[word];
      }
      chrome.storage.local.set({ wordCounts: totalCounts }, () => {
        displayCounts(currentCounts, totalCounts);
      });
    });
  }
  
  function displayCounts(currentCounts, totalCounts) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    resultsDiv.innerHTML += "<h4>This page:</h4>";
    for (const word in currentCounts) {
      resultsDiv.innerHTML += `<div class="result-line">${word}: ${currentCounts[word]}</div>`;
    }
    resultsDiv.innerHTML += "<h4>Total:</h4>";
    for (const word in totalCounts) {
      resultsDiv.innerHTML += `<div class="result-line">${word}: ${totalCounts[word]}</div>`;
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("wordCounts", (data) => {
      const totalCounts = data.wordCounts || {};
      displayCounts({}, totalCounts);
    });
  });
  