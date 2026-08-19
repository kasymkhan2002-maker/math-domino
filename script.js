// ==========================================
// РАЦИОНАЛ САНДАР - МАТЕМАТИКАЛЫҚ ДОМИНО
// ==========================================

const questions = [

    {
        question: "(-8) + 5",
        answer: "-3",
        options: ["-3", "3", "-13"],
        next: "(-6) + (-4)",
        hint: "Таңбалары әртүрлі сандарды қосқанда модульдерін азайт. Үлкен модульдің таңбасын сақта."
    },

    {
        question: "(-6) + (-4)",
        answer: "-10",
        options: ["10", "-2", "-10"],
        next: "7 - 12",
        hint: "Екі теріс санды қосқанда модульдерін қосып, алдына минус таңбасын қоямыз."
    },

    {
        question: "7 - 12",
        answer: "-5",
        options: ["5", "-5", "19"],
        next: "(-4) × 6",
        hint: "7 саны 12-ден кіші. Сондықтан нәтиже теріс сан болады."
    },

    {
        question: "(-4) × 6",
        answer: "-24",
        options: ["24", "-10", "-24"],
        next: "(-30) ÷ 5",
        hint: "Теріс санды оң санға көбейтсек, нәтиже теріс болады."
    },

    {
        question: "(-30) ÷ 5",
        answer: "-6",
        options: ["6", "-6", "-25"],
        next: "(-7) × (-3)",
        hint: "Теріс санды оң санға бөлсек, нәтиже теріс болады."
    },

    {
        question: "(-7) × (-3)",
        answer: "21",
        options: ["-21", "10", "21"],
        next: "15 + (-20)",
        hint: "Екі теріс санды көбейткенде нәтиже оң сан болады."
    },

    {
        question: "15 + (-20)",
        answer: "-5",
        options: ["35", "-5", "5"],
        next: "(-18) ÷ (-6)",
        hint: "Бұл 15 - 20 амалына тең."
    },

    {
        question: "(-18) ÷ (-6)",
        answer: "3",
        options: ["-3", "3", "12"],
        next: "-2.5 + 4",
        hint: "Теріс санды теріс санға бөлгенде нәтиже оң болады."
    },

    {
        question: "-2.5 + 4",
        answer: "1.5",
        options: ["-6.5", "1.5", "-1.5"],
        next: "3.5 - 5",
        hint: "4 санының модулі 2.5-тен үлкен. Сондықтан нәтиже оң болады."
    },

    {
        question: "3.5 - 5",
        answer: "-1.5",
        options: ["1.5", "-1.5", "8.5"],
        next: "(-2) × (-8)",
        hint: "3.5 саны 5-тен кіші болғандықтан, нәтиже теріс болады."
    },

    {
        question: "(-2) × (-8)",
        answer: "16",
        options: ["-16", "16", "-10"],
        next: "24 ÷ (-6)",
        hint: "Минус пен минусты көбейткенде плюс шығады."
    },

    {
        question: "24 ÷ (-6)",
        answer: "-4",
        options: ["4", "-4", "-18"],
        next: "Аяқталды!",
        hint: "Оң санды теріс санға бөлгенде нәтиже теріс болады."
    }

];


// Ойын айнымалылары

let currentQuestion = 0;
let score = 0;
let streak = 0;
let chainItems = [];
let mistakeCount = 0;
let totalMistakes = 0;

// ==========================================
// ЕСЕПТІ ЭКРАНҒА ШЫҒАРУ
// ==========================================

function loadQuestion() {
mistakeCount = 0;
    const q = questions[currentQuestion];

    document.getElementById("question").innerText =
        q.question + " = ?";

    document.getElementById("questionNumber").innerText =
        currentQuestion + 1;

    document.getElementById("message").innerText = "";

    document.getElementById("aiMessage").innerText =
        "Есеп қиын болса, көмек сұра.";

    const container =
        document.getElementById("dominoContainer");

    container.innerHTML = "";


    // Үш домино жасаймыз

    q.options.forEach(option => {

        const domino =
            document.createElement("div");

        domino.className = "domino";


        // Доминоның сол жағы - жауап

        const left =
            document.createElement("div");

        left.className = "domino-left";

        left.innerText = option;


        // Доминоның оң жағы - келесі есеп

        const right =
            document.createElement("div");

        right.className = "domino-right";

        // Дұрыс карточкада келесі есеп көрсетіледі
        if (option === q.answer) {

            right.innerText = q.next;

        } else {

            right.innerText = "❓";
        }


        domino.appendChild(left);
        domino.appendChild(right);


        domino.onclick = function() {

            checkAnswer(option);

        };


        container.appendChild(domino);

    });

}


// ==========================================
// ЖАУАПТЫ ТЕКСЕРУ
// ==========================================

async function checkAnswer(selectedAnswer) {

    const q = questions[currentQuestion];

    if (selectedAnswer === q.answer) {

        document.getElementById("message").innerText =
            "✅ Дұрыс! +10 ұпай";

        score += 10;
        streak++;

        document.getElementById("score").innerText = score;
        document.getElementById("streak").innerText = streak;

        chainItems.push(
            "[ " + q.answer + " | " + q.next + " ]"
        );

        updateChain();

        document.getElementById("aiMessage").innerText =
            "🤖 Жарайсың! Дұрыс жауап.";

        setTimeout(nextQuestion, 1200);

    } else {
mistakeCount++;
totalMistakes++;
        document.getElementById("message").innerText =
            "❌ Қате. ЖИ қатеңді талдап жатыр...";

        streak = 0;

        document.getElementById("streak").innerText = streak;

        const aiMessage =
            document.getElementById("aiMessage");

        aiMessage.innerText =
            "🤖 ЖИ ойланып жатыр...";

        try {

            const response = await fetch("/ai-help", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: q.question,
                    studentAnswer: selectedAnswer,
                    mistakeCount: mistakeCount
                  })

            });

            const data = await response.json();

            aiMessage.innerText =
                "🤖 ЖИ: " + data.help;

        } catch (error) {

            aiMessage.innerText =
                "❌ ЖИ-ге қосылу мүмкін болмады.";

            console.error(error);

        }

    }

}


// ==========================================
// КЕЛЕСІ ЕСЕП
// ==========================================

function nextQuestion() {

    currentQuestion++;

    if (currentQuestion < questions.length) {

        loadQuestion();

    }

    else {

        finishGame();

    }

}


// ==========================================
// ДОМИНО ТІЗБЕГІН КӨРСЕТУ
// ==========================================

function updateChain() {

    document.getElementById("chain").innerText =
        chainItems.join("  →  ");

}


// ==========================================
// ЖИ КӨМЕКШІ
// ==========================================

async function getAIHelp() {

    const q = questions[currentQuestion];

    const aiMessage = document.getElementById("aiMessage");

    aiMessage.innerText = "🤖 ЖИ ойланып жатыр...";

    try {

        const response = await fetch("/ai-help", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: q.question,
                studentAnswer: ""
            })
        });

        const data = await response.json();

        aiMessage.innerText =
            "🤖 ЖИ: " + data.help;

    } catch (error) {

        aiMessage.innerText =
            "❌ ЖИ-ге қосылу мүмкін болмады.";

        console.error(error);
    }

}


// ==========================================
// ОЙЫННЫҢ АЯҚТАЛУЫ
// ==========================================

function finishGame() {

    document.getElementById("question").innerText =
        "🎉 Ойын аяқталды!";

    document.getElementById("dominoContainer").innerHTML =
        "";

    document.getElementById("message").innerText =
        "Нәтиже: " + score + " / " +
        (questions.length * 10) + " ұпай";

document.getElementById("aiMessage").innerText =
    "🤖 ЖИ сенің нәтижеңді талдап жатыр...";

getFinalAIAnalysis();

}
async function getFinalAIAnalysis() {

    const aiMessage = document.getElementById("aiMessage");

    try {

        const response = await fetch("/ai-summary", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                score: score,
                maxScore: questions.length * 10,
                totalQuestions: questions.length,
                totalMistakes: totalMistakes
            })

        });

        const data = await response.json();

        aiMessage.innerText =
            "📊 ЖИ қорытындысы:\n\n" + data.summary;

    } catch (error) {

        aiMessage.innerText =
            "❌ ЖИ қорытындысын алу мүмкін болмады.";

        console.error(error);
    }
}



// ОЙЫНДЫ БАСТАУ

loadQuestion();