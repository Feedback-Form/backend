const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
	{
		aiSuggestions: {
			type: Boolean,
		},
		questions: [
			{
				question: {
					type: String,
					required: true,
					trim: true,
				},
				responseType: {
					type: String,
					required: true,
					trim: true,
				},
				maxRating: {
					type: Number,
					required: true,
				},
			},
		],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	},

	{
		timestamps: true,
	}
);

formSchema.virtual("userResponses", {
	ref: "Response",
	localField: "_id",
	foreignField: "formId",
});

const Form = mongoose.model("Form", formSchema);
module.exports = Form;
