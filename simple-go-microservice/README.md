# Using the Qualcomm AI Inference Suite behind a production microservice
The blog post is *here* and shows how easy it is to call the Qualcomm AI Inference Suite directly from a microservice.  This sample uses the Go programming language.

## Branches

**main**: Primary development branch. 
Contributors should develop submissions based on this branch, and submit pull requests to this branch.

## Requirements

To run this sample, one needs to obtain an account and API key from Cirrascale [here](https://aisuite.cirrascale.com/home).

## Installation Instructions

This sample runs from a local filesystem. Simply download to a local folder, install dependencies, **modify the .env file**, and run.

```bash
git clone https://github.com/qualcomm/cloudai-inference-samples/
cd .\cloudai-inference-samples\
cd .\simple-go-microservice\
go get github.com/joho/godotenv
go mod tidy
go run .\micro.go
```

## Development

Code samples are provided as purely samples and are not intended for production use. If you have suggestions for how to improve or directions you'd like to see, please see how to contribute via the [CONTRIBUTING.md file](../CONTRIBUTING.md).

## Getting in Contact

* [Report an Issue on GitHub](../../../issues)
* [Open a Discussion on GitHub](../../../discussions)
* [E-mail us](mailto:raysteph@qti.qualcomm.com) for general questions

## License

cloudai-inference-samples is licensed under the [BSD-3-clause License](https://spdx.org/licenses/BSD-3-Clause.html). See [LICENSE.txt](../LICENSE.txt) for the full license text.
