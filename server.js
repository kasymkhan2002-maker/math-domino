const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

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