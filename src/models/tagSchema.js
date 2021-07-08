const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
	{
		tags: [
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

const Tag = mongoose.model("Tag", tagSchema);
module.exports = Tag;
