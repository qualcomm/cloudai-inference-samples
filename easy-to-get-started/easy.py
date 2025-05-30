# Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the conditions in LICENSE.txt are met

# import the SDK
from imagine import ChatMessage, ImagineClient 

# store endpoint and API key
myendpoint = "https://aisuite.cirrascale.com/apis/v2" 
myapikey = "paste your key here" 

# create a client
client = ImagineClient(endpoint=myendpoint, api_key=myapikey) 

# choose an LLM to use
mymodel = "Llama-3.1-8B" 

# a test piece of customer feedback
feedback = "Feedback: ' We loved this hotel, we will be coming back.'" 

# building the prompt
mycontent = "You are an expert at sentiment analysis. Please evaluate the following customer feedback and answer only with positive, negative, or neutral. Only answer positive, negative, or neutral in lowercase. " + feedback 

# setting up the chat message to the server
mymessage = ChatMessage(role="user", content=mycontent) 

# call the server
chat_response = client.chat( 
    messages=[mymessage], 
    model=mymodel, 
) 

# print out the response
print(chat_response.first_content) 
