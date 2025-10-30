# How to build the simplest RAG system using the Qualcomm AI Inference Suite
Following the same method in our [other blog](https://www.qualcomm.com/developer/blog/2025/08/ai-inference-with-google-colab) that was using Google Colab, we'll show a simple RAG system that can be run as a Jupyter notebook. If you prefer, we show here how to use it from Google Colab.

## Prepare your environment
[Google Colab](https://colab.research.google.com/) allows you to write and use Python in your browser without having to install or configure it on a physical machine. While it also allows use of GPUs free of charge, we won't be needing any for this sample as the AI inference is done at Cirrascale.  You can use Google Colab freely with any existing Google account.

### Create a New Notebook
If you haven't already, create a new notebook by choosing **File > New Notebook**.

### Add secrets to hide your endpoint choice and API key
Google Colab offers a place to store 'secrets' which can be actual secrets or arbitrary pieces of data that you want to access from code without showing them to the end user on screen. 

To create the secrets for this exercise, click on the **key** icon in the left side menu and add two name-value pairs for API_KEY and ENDPOINT.  We'll be using these later in the code to retrieve the actual values. You'll need to sign up for an account at Cirrascale and retrieve the key from [your dashboard](https://aisuite.cirrascale.com/account/api-keys) if you don't already have one.

<img src="colab-key.png" style="border: 1px solid #333; box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.3); border-radius: 8px; max-width: 100%; height: auto; width: 300px;" alt="colab key menu on the left">

### Upload the Qualcomm Imagine SDK wheel file
This sample requires access to the Qualcomm Imagine SDK, which is provided as a wheel file. The easiest way to do this is to first [download the file locally](https://aisuite.cirrascale.com/sdk/_downloads/3433649516f5c32f3603ae6f98c65e48/imagine_sdk-0.4.2-py3-none-any.whl) to your machine, and then upload it to Google Colab.

To provide the file to Google Colab, you choose the **folder** icon in the left side menu, and choose to upload the wheel file from your local machine.  If successful, you should see the file listed in the UI.

<img src="colab-file-folder.png" style="border: 1px solid #333; box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.3); border-radius: 8px; max-width: 100%; height: auto; width: 300px;" alt="colab file menu on the left">

## Import SDKs and libraries 

Now that we have everything set up, we are ready to walk through the code running in a notebook, step by step. You can execute code a section at a time, or all at once.  To add new sections, choose the **+Code** command in the menu bar.

### Import SDK functions
First, we need to install the uploaded SDK into the running virtual environment on Google Colab.

```
!pip install imagine_sdk-0.4.2-py3-none-any.whl
```

To the left of code sections is a **play / go** button that you can click to execute the code snippet.  Do that now to ensure the Qualcomm Imagine SDK is loaded into the environment

> NOTE: If your environment times out because you weren't using it,</br> 
> you may need to re-upload the wheel file.


## Introduction
Although a lot has been written about Retrieval-Augmented Generation (RAG) as a valuable pattern for using AI, it continues to be magic for the average business user while being a bit unclear to technical implementers who haven’t used it before.  Conceptually one can use AI to query some defined set of documents and get an answer from the documents rather than having AI blather on about something outside the specific topic of interest.

In this blog post, we’ll showcase a super simple setup to show how RAG works, while using the [Qualcomm AI Inference Suite](https://www.qualcomm.com/developer/software/qualcomm-ai-inference-suite) to do all the AI parts. A diagram is useful to illustrate the steps we need to take.

<figure>
    <img src="rag-process.png" style="border: 1px solid #333; box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.3); border-radius: 8px; max-width: 100%; height: auto; width: 500px;" alt="simplified diagram of the RAG process">

    Figure 1

    For documents and/or data generate embeddings, store, and index them. 
    Use the index to compare the embedding of a query and return top k items.
    Feed query string plus returned top k items to LLM to generate an answer.

</figure>

## Steps

When you issue a query to a RAG system, the steps it takes are:
1.	Turn the user’s query into a ‘query embedding.’
2.	Compare the user’s query embedding to an index of previously computed embeddings for all target documents which may contain the ‘answer.’
3.	Retrieve some number of those documents or document fragments. This parameter is often denoted as the ‘top k documents.’
4.	Feed an LLM the user’s query with instructions to answer the question using the context of the data retrieved in the previous step.
5.	Optionally, specify that the LLM should answer in some standard way if the query can’t be answered with the given data. If the AI were a human, it would say something like, “I don’t have enough information to answer” rather than coming up with a wrong answer, aka ‘hallucination.’

One important point that might trip up first-timers is that you need to use the same embedding model, in this case BAAI/bge-large-en-v1.5, for both the initial step of processing your document set and for the embedding of the user’s query. If you don’t – you may still get an answer - but it will be wrong.  Practically, this means that if you decide to change embedding models, you will need to re-build your index and modify your code for processing the query to match.

## Scenario code walkthrough

Using the Qualcomm AI Inference Suite running on [Cirrascale](https://aisuite.cirrascale.com/home) infrastructure (powered by [Qualcomm Cloud AI accelerators](https://www.qualcomm.com/products/technology/processors/cloud-artificial-intelligence)), I’ll demonstrate how to build a simple RAG using Python in a Jupyter notebook.

The first bits of code are not too exciting and are similar to [other blogs](https://www.qualcomm.com/developer/blog/2025/08/ai-inference-with-google-colab) where we do the same things: install the Imagine SDK, import libraries, and set up environment variables to hold our API endpoint and API key. 

One addition to this RAG scenario is the use of the FAISS library. FAISS (Facebook AI Similarity Search) is an open-source library developed by Meta AI that enables efficient similarity search and clustering of data in the form of dense vectors.  

More simply stated, we need to be able to search the data inside our documents for similarity to a user’s query.  By identifying that data, we now have context to provide an LLM with so that it can answer based on your data rather than what it was trained on.

Installation of FAISS is as simple as using pip install to your environment and then importing it:

``` python
!pip install faiss-cpu

# at top of your python code import faiss
import faiss
```

## The document set

In a production environment, the document set that we are using with RAG might be in a filesystem, a database, or some other data store. If there is a lot of data, it is necessary to compute embeddings for each piece of data, possibly in chunks if it is too large to fit in our chosen embedding model’s context window and then store all results in a vector database for later retrieval and comparison.

For the purpose of understanding how RAG functions, all those steps add complexity that we will skip for this sample. We want to show the bare minimum of steps that make RAG work so that you can apply this learning to your own scenario, data sets, and capabilities. 

With that in mind, we create a small dataset of strings that represent our document set:

``` python
# create some data to test embedding
documents = [
    "Ray works at Qualcomm.",
    "Ray is a specialist in developer relations.",
    "Qualcomm AI Inference Suite is great for AI inference workloads",
]
```

## Generating embeddings

Embeddings are numerical representations of data—like words, images, or documents—that capture their meaning, context, or relationships in dimensional space. They allow machines to compare and understand inputs by measuring similarity between these representations.  

Next, we need to create embedding representations for our document set above and then create an index which will allow us to search for those documents with the closest similarity to a user query.  This is the key way that RAG provides context to an LLM to answer questions from specific data sets rather than answering from whatever data the LLM was originally trained on.

The following code sets up the embedding model we’ll use to generate the embeddings, does the actual embedding calculations, and creates our index using FAISS.  FAISS is a bit complicated to understand from code alone, so it is worthwhile to read the documentation if you want to really understand what is going on here.

``` python
# check installed models and grab one to use
all_models = client.get_available_models_by_type()
embedding_models = client.get_available_models_by_type(ModelType.EMBEDDING)
use_embed_model = embedding_models.get(ModelType.EMBEDDING, 0)[1]
pprint(use_embed_model)

# create embeddings and list
doc_embeddings = client.embeddings(documents, model=use_embed_model)
doc_embeddings = doc_embeddings.data
for item in doc_embeddings:
    pprint(item)

# get embeddings into the right format for FAISS use
embeddings_only = []
for item in doc_embeddings:
    embeddings_only.append(item.embedding)
doc_embeddings = np.array(embeddings_only).astype("float32")
pprint(doc_embeddings.shape)

# create FAISS index
dimension = doc_embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(doc_embeddings)
```

## Find relevant data given a user query

To see if we have relevant data from our document set to answer a user query, we create an embedding of the user’s question, and then search our index for the closest answer.  Note, it is possible that the user query is about something that isn’t in the data set.  This step simply returns the top N number of data pieces as context for an LLM to answer the question.

``` python
# query and retrieve relevant document
query = "How can I do AI inference?"
query_embedding = client.embeddings([query], model=use_embed_model).data[0].embedding

query_vector = np.array(query_embedding).astype("float32")
query_vector = query_vector.reshape(1, -1) # Reshape to (1, dimension)
D, I = index.search(query_vector, k=1)

retrieved_doc = documents[I[0][0]]
```

## Ask an LLM to answer the user query with context

The final step is to provide an LLM with a system prompt containing guardrails and instructions on what to do if the context doesn’t answer the question.  We also provide the user’s question, and any data retrieved as context.

``` python
# Let's call an LLM to have it answer with the provided data
payload = {
    "model": "Llama-3.1-8B", # can try other models as well
    "messages": [
        {"role": "system", "content": "Answer the question using the provided context.  If you can't answer using the provided context, say that the data is not in the document set."},
        {"role": "user", "content": f"Context: {retrieved_doc}\nQuestion: {query}"}
    ]
}
chat_response = client.chat(messages=payload["messages"], model=payload["model"])
pprint(chat_response.first_content)
```

## Try it out yourself

Using the sample code in a Jupyter notebook, you can give it a go yourself. Try changing the data set to include different information, making it as long as you like. Try changing the query to both things you know are in the data set and things that aren’t.  Try changing the guardrails to modify the output of the LLM at the end.

After using this sample, let us know over on the [Qualcomm Cloud AI Discord channel](https://discord.com/channels/1095352552096268288/1238568397105795113) what you’ve created for your own scenarios. Be sure to [sign up for free tokens and retrieve your API key](https://aisuite.cirrascale.com/home) from our partner Cirrascale. Explore other topics in the [Cloud AI blog series](https://www.qualcomm.com/developer/blog?tags=Cloud).



**[Star this repo](https://github.com/qualcomm/cloudai-inference-samples)** to follow updates in the future as we create more code samples.

## Requirements

To run this sample, one needs to obtain an account and API key from Cirrascale [here](https://aisuite.cirrascale.com/home).

## Installation Instructions

The sample runs in Python and uses the latest stable version of the Qualcomm Imagine SDK. You can install it by downloading the [wheel file](https://aisuite.cirrascale.com/sdk/_downloads/3433649516f5c32f3603ae6f98c65e48/imagine_sdk-0.4.2-py3-none-any.whl) into an environment with Python 3.9 or higher. After downloading the file, install it with:

```
pip install imagine_sdk-0.4.2-py3-none-any.whl
```

## Development

Code samples are provided as purely samples and are not intended for production use. If you have suggestions for how to improve or directions you'd like to see, please see how to contribute via the [CONTRIBUTING.md file](../CONTRIBUTING.md).

## Getting in Contact

* [Report an Issue on GitHub](../../../issues)
* [Open a Discussion on GitHub](../../../discussions)
* [E-mail us](mailto:raysteph@qti.qualcomm.com) for general questions

## License

cloudai-inference-samples is licensed under the [BSD-3-clause License](https://spdx.org/licenses/BSD-3-Clause.html). See [LICENSE.txt](../LICENSE.txt) for the full license text.
