let questions = [];
let currentQuestion = 0;
let answers = {};
let marked = {};
let visited = {};
let timeLeft = 3 * 60 * 60; // 3 hours

fetch("questions.json")
.then(res => res.json())
.then(data => {
    questions = data;
    createPalette();
    loadQuestion();
    startTimer();
});

// ================= TIMER =================
function startTimer() {
    const timer = document.getElementById("timer");

    setInterval(() => {
        if (timeLeft <= 0) {
            alert("Time Over!");
            submitExam();
        }

        let hrs = Math.floor(timeLeft / 3600);
        let mins = Math.floor((timeLeft % 3600) / 60);
        let secs = timeLeft % 60;

        timer.innerText =
            String(hrs).padStart(2, '0') + ":" +
            String(mins).padStart(2, '0') + ":" +
            String(secs).padStart(2, '0');

        timeLeft--;
    }, 1000);
}

// ================= LOAD QUESTION =================
function loadQuestion() {
    const q = questions[currentQuestion];
    visited[currentQuestion] = true;

    document.getElementById("question-info").innerText =
        "Question " + (currentQuestion + 1);

    document.getElementById("question-text").innerText =
        q.question;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach((opt, index) => {
        const checked = answers[currentQuestion] === index ? "checked" : "";
        optionsDiv.innerHTML += `
            <div>
                <input type="radio" name="option" value="${index}" ${checked}>
                ${opt}
            </div>
        `;
    });

    updatePalette();
}

// ================= SAVE & NEXT =================
function saveNext() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (selected) {
        answers[currentQuestion] = parseInt(selected.value);
    }
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

// ================= MARK FOR REVIEW =================
function markForReview() {
    marked[currentQuestion] = true;
    saveNext();
}

// ================= CLEAR =================
function clearResponse() {
    delete answers[currentQuestion];
    loadQuestion();
}

// ================= CREATE PALETTE =================
function createPalette() {
    const palette = document.getElementById("palette");

    questions.forEach((q, index) => {
        const box = document.createElement("div");
        box.innerText = index + 1;
        box.classList.add("palette-box", "notVisited");
        box.onclick = () => {
            currentQuestion = index;
            loadQuestion();
        };
        palette.appendChild(box);
    });
}

// ================= UPDATE PALETTE =================
function updatePalette() {
    const boxes = document.querySelectorAll(".palette-box");

    boxes.forEach((box, index) => {
        box.classList.remove("notVisited", "notAnswered", "answered", "marked");

        if (!visited[index]) {
            box.classList.add("notVisited");
        } else if (marked[index]) {
            box.classList.add("marked");
        } else if (answers[index] !== undefined) {
            box.classList.add("answered");
        } else {
            box.classList.add("notAnswered");
        }
    });
}

// ================= SUBMIT =================
function submitExam() {

    // attach selected answers into questions array
    let finalResult = questions.map((q, index) => {
        return {
            question: q.question,
            answer: q.answer,
            marks: q.marks,
            negative: q.negative,
            selected: answers[index] !== undefined ? answers[index] : null
        };
    });

    localStorage.setItem("gateResult", JSON.stringify(finalResult));

    // redirect to result page
    window.location.href = "result.html";
}