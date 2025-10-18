function enterData() {
    let input = document.getElementById("input").value;
    document.getElementById("result").value = input;
}

function toUppercase() {
    let input = document.getElementById("input").value;
    document.getElementById("result").value = input.toUpperCase();
}

function toLowercase() {
    let input = document.getElementById("input").value;
    document.getElementById("result").value = input.toLowerCase();
}

function countUppercase() {
    let input = document.getElementById("input").value;
    let count = (input.match(/[A-Z]/g) || []).length;
    document.getElementById("result").value = "Number of uppercase letters: " + count;
}

function countLowercase() {
    let input = document.getElementById("input").value;
    let count = (input.match(/[a-z]/g) || []).length;
    document.getElementById("result").value = "Number of lowercase letters: " + count;
}

function wordCount() {
    let input = document.getElementById("input").value.trim();
    if (input === "") {
        document.getElementById("result").value = "Word count: 0";
        return;
    }
    let count = input.split(/\s+/).length;
    document.getElementById("result").value = "Word count: " + count;
}

function oneWordPerLine() {
    let input = document.getElementById("input").value.trim();
    let words = input.split(/\s+/);
    document.getElementById("result").value = words.join("\n");
}

function printVowelsConsonants() {
    let input = document.getElementById("input").value.toLowerCase();
    let vowels = (input.match(/[aeiou]/g) || []).length;
    let consonants = (input.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    document.getElementById("result").value = "Vowels: " + vowels + "\nConsonants: " + consonants;
}

function saveToLocalAndOpenW3C() {
    let input = document.getElementById("input").value.trim();
    if (input === "") {
        alert("Input is empty. Nothing to save!");
        return;
    }
    // Lưu chuỗi vào localStorage
    localStorage.setItem("stringData", input);
    alert("Saved to localStorage as 'stringData'. Opening W3C page...");
    let data = localStorage.getItem(input);
    // Mở trang học W3C
    window.open("https://www.w3schools.com/jsref/prop_win_localstorage.asp", "_blank");
}