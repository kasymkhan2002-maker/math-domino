const express = require("express");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});
async function createStudentsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Оқушылар кестесі дайын!");
    } catch (error) {
        console.error("Кесте жасау қатесі:", error);
    }
}

createStudentsTable();
app.use(express.json());
app.use(express.static(__dirname));
// ОҚУШЫНЫ ТІРКЕУ
app.post("/register", async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: "Аты-жөні мен құпия сөзді енгізіңіз."
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: "Құпия сөз кемінде 4 таңбадан тұрсын."
            });
        }

        const existing = await pool.query(
            "SELECT id FROM students WHERE name = $1",
            [name]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Бұл оқушы бұрын тіркелген."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO students (name, password_hash) VALUES ($1, $2)",
            [name, passwordHash]
        );

        res.json({
            success: true,
            message: "✅ Тіркелу сәтті! Енді «Кіру» батырмасын басыңыз."
        });

    } catch (error) {
        console.error("Тіркелу қатесі:", error);

        res.status(500).json({
            success: false,
            message: "❌ Тіркелу кезінде қате шықты."
        });
    }
});
// ОҚУШЫНЫҢ КІРУІ
app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: "Аты-жөні мен құпия сөзді енгізіңіз."
            });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE name = $1",
            [name]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "❌ Мұндай оқушы тіркелмеген."
            });
        }

        const student = result.rows[0];

        const passwordCorrect = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "❌ Құпия сөз дұрыс емес."
            });
        }

        res.json({
            success: true,
            message: "✅ Кіру сәтті!",
            student: {
                id: student.id,
                name: student.name
            }
        });

    } catch (error) {
        console.error("Кіру қатесі:", error);

        res.status(500).json({
            success: false,
            message: "❌ Кіру кезінде қате шықты."
        });
    }
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ЖИ көмекші
app.post("/ai-help", async (req, res) => {

    try {

        const { question, studentAnswer, mistakeCount } = req.body;

        const response = await openai.responses.create({
            model: "gpt-5-mini",

            input: `
Сен 6-сынып оқушысына көмектесетін қазақ тіліндегі
математика мұғалімісің.

Тақырып: Рационал сандарға арифметикалық амалдар қолдану.

Есеп:
${question}

Оқушының жауабы:
${studentAnswer || "Оқушы көмек сұрады"}

Оқушы осы есепте ${mistakeCount || 0} рет қателесті.

Міндетің:

Егер оқушы 0 рет қателессе:
- Оқушы өзі ЖИ көмегін сұрап отыр.
- Дұрыс жауапты бірден айтпа.
- Ережені еске түсіретін бір сұрақ қой.

Егер оқушы 1 рет қателессе:
- Дұрыс жауапты айтпа.
- Қандай математикалық ереже қолдану керегін түсіндір.
- Бір бағыттаушы сұрақ қой.

Егер оқушы 2 рет қателессе:
- Есептің бірінші шешу қадамын көрсет.
- Соңғы жауабын айтпа.
- Келесі қадамды оқушының өзіне орындат.

Егер оқушы 3 немесе одан көп рет қателессе:
- Есепті қадамдап түсіндір.
- Соңында дұрыс жауабын көрсет.

Барлық жағдайда:
- Қазақ тілінде жауап бер.
- 6-сынып оқушысына түсінікті жаз.
- Қысқа әрі нақты түсіндір.
`
        });

        res.json({
            help: response.output_text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            help: "ЖИ көмекшісіне қосылу кезінде қате шықты."
        });
    }

});
// ОЙЫН СОҢЫНДАҒЫ ЖИ ҚОРЫТЫНДЫСЫ

app.post("/ai-summary", async (req, res) => {

    try {

        const {
            score,
            maxScore,
            totalQuestions,
            totalMistakes
        } = req.body;

        const response = await openai.responses.create({

            model: "gpt-5-mini",

            input: `
Сен 6-сынып математика мұғалімісің.

Оқушы "Рационал сандарға арифметикалық амалдар қолдану"
тақырыбындағы математикалық домино ойынын аяқтады.

Оқушының нәтижесі:
Ұпайы: ${score} / ${maxScore}
Есеп саны: ${totalQuestions}
Жалпы қате саны: ${totalMistakes}

Осы нәтижеге қысқа педагогикалық қорытынды жаса.

Міндетің:
- Қазақ тілінде жаз.
- Оқушының нәтижесін бағала.
- Жақсы жағын атап өт.
- Қате көп болса, нені қайталау керегін айт.
- Бір нақты ұсыныс бер.
- 4-5 сөйлемнен асырма.
`
        });

        res.json({
            summary: response.output_text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            summary: "ЖИ қорытындысын жасау кезінде қате шықты."
        });

    }

});

// Серверді іске қосу

app.listen(3000, () => {

    console.log("Математикалық домино іске қосылды!");
    console.log("http://localhost:3000");

});