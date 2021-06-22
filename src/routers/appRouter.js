const express = require("express");
const appRouter = new express.Router();
const chalk = require("chalk");
const OpenAI = require("./modules/openai");
const app = require("../app");
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const {sendEmail} = require("./modules/email/sendEmail");

appRouter.post("/generate/feedback", async (req, res) => {

	const { question, customerSentiment, productServiceDescription } = req.body;
    /*
            very happy
            happy
            neutral
            unhappy
            very unhappy
*/  

	try {
  
        const gptCommand = "Create insightful feedback, from the customer's personal view, according to the service/product description and according to the customer's sentiment.";
		const gptConfig = {
			engine: "davinci-instruct-beta",
			prompt: `${gptCommand}\n\nservice/product description:\n${productServiceDescription}\n\nquestion for the customer:\n${question}\n\ncustomer's sentiment:\n${customerSentiment}\n\nthe customer feedback:\n`,
			maxTokens: 100,
			temperature: 0.7,
			topP: 1,
			presencePenalty: 0,
			frequencyPenalty: 1,
			bestOf: 1,
			n: 1,
			stream: false,
			userId: "1a69aa0c-cb7b-11eb-b8bc-0242ac130003",
			stop: ["\n\n"],
		};

		// config to evaluate the risk group of the given input
		const gptSafetyConfig = {
			engine: "content-filter-alpha-c4",
			prompt: `<|endoftext|>${question}\n--\nLabel:`,
			maxTokens: 1,
			temperature: 0,
			topP: 1,
			logProps: 10,
			presencePenalty: 0,
			frequencyPenalty: 0,
			userId: "1a69aa0c-cb7b-11eb-b8bc-0242ac130003",
		};

		// flag the input text for it's risk group
		const gptSafetyFlag = await openai.complete(gptSafetyConfig);

		// throws an Error if the input is flagged a 2
		if (gptSafetyFlag.data.choices[0].text === "2") {
			throw new Error("The Input is too risky!");
		}
		    // complete the text according to the user's config.
            const gptOutput = await openai.complete(gptConfig);
            const output = gptOutput.data.choices[0].text;

		res.status(200).send({
			payload: {
				feedbackSuggestion: output
			},
		});
	} catch (err) {
		res.status(400).send({ error: { message: err.message } });
	}
});


/* questionAnswers {OBJECT}
   

{
        question: string,
        userSentiment: string,
        answer: string
    }

*/

/* candidateInformation {OBJECT}
    
{
    name: string,
    jobTitle: string,
    currentCompany: string,
    linkedInPorfile: string
}


*/
appRouter.post("/send/feedback", async (req, res) => {

	 const { feedbackArray, candidateInformation} = req.body;
	 const {noSenderInfo} = req.query;

	

	try {

		if (noSenderInfo) {
			await sendEmailAnonymous(feedbackArray)
		} else {
			await sendEmail(feedbackArray,candidateInformation);
		}


		res.status(200).send({
			payload: {
				message: 'successfully submitted feedback!'
			}
		})


	} catch (err) {
		res.status(400).send({ error: { message: err.message } });
	}
})

module.exports = appRouter;
