# Comparing LLM models with the Qualcomm AI Inference Suite

As a consumer using closed AI models, there are not many parameters for one to adjust other than model choice, and perhaps the verbal tone of responses.  When using an open-source AI model served up through any typical inference layer, including the [Qualcomm AI Inference Suite](https://www.qualcomm.com/developer/software/qualcomm-ai-inference-suite), one can choose to modify several parameters that affect the output.  

Temperature, Top P, Top K, Repetition Penalty, and Max Tokens: what do they all mean and when should they be adjusted?  If you were to look at the API, there are even more parameters to adjust, but these are the ones that most developer playgrounds expose through a chat UI.  If one were tuning a prompt to do actual work, how should these parameters be set?  Are the defaults the best ones to stick with?

In this sample, we create a way to compare two different LLM models, but also the ability to independently modify the parameters of each. The idea is to help understand how different models and parameters affect the output given the same prompt.  You can use this to stick with the defaults and simply compare models or go further to tweak settings for your use case.

A blog post describing the use of this sample is available *here*.

## Prepare your environment

This sample is composed entirely of HTML, vanilla JavaScript, and a small bit of CSS styling to make the UI easy to use. The only preparation required is to change the endpoints.js file to contain your own chosen API key for our partner Cirrascale. [Sign up for free tokens and retrieve your API key](https://aisuite.cirrascale.com/home) here.

After using this sample, let us know over on the [Qualcomm Cloud AI Discord channel](https://discord.com/channels/1095352552096268288/1238568397105795113) how this sample has helped you to test out prompts. Be sure to  Explore other topics in the [Cloud AI blog series](https://www.qualcomm.com/developer/blog?tags=Cloud).

**[Star this repo](https://github.com/qualcomm/cloudai-inference-samples)** to follow updates in the future as we create more code samples.

## Requirements

To run this sample, one needs to obtain an account and API key from Cirrascale [here](https://aisuite.cirrascale.com/home).

## Development

Code samples are provided as purely samples and are not intended for production use. If you have suggestions for how to improve or directions you'd like to see, please see how to contribute via the [CONTRIBUTING.md file](../CONTRIBUTING.md).

## Getting in Contact

* [Report an Issue on GitHub](../../../issues)
* [Open a Discussion on GitHub](../../../discussions)
* [E-mail us](mailto:raysteph@qti.qualcomm.com) for general questions

## License

cloudai-inference-samples is licensed under the [BSD-3-clause License](https://spdx.org/licenses/BSD-3-Clause.html). See [LICENSE.txt](../LICENSE.txt) for the full license text.
