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
				response: {
					type: String,
					required: true,
					trim: true,
				},
				rating: {
					type: Number,
					required: true,
				},
			},
		],
		savedTags: [
			{
				type: String,
				required: true,
				trim: true,
			},
		],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
          },
	},
    
	{
		timestamps: true,
	}
);

userSchema.virtual('userResponses', {
	ref: 'Response',
	localField: '_id',
	foreignField: 'formId',
  });
  

const Form = mongoose.model("Form", formSchema);
module.exports = Form;
