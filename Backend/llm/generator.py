from openai import OpenAI
import json
import os
from dotenv import load_dotenv
from utils import helpers

load_dotenv()


class LLM:
    def __init__(self):

        self.api = os.getenv("OPENAI_API_KEY")

  
        self.client = OpenAI(api_key=self.api)

   
        self.model = "gpt-4o-mini"

        self.chat_history = []

   
    def _generate(self, system_prompt, user_input):

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content

            try:
                return json.loads(content)
            except Exception as e:
                print("JSON ERROR:", content)
                return {"error": "Invalid JSON", "raw": content}

        except Exception as e:
            return {
                "error": str(e)
            }

    
    def Query(self, query):

        system_prompt = helpers.Query_prompt

        data = self._generate(system_prompt, query)

        return data




    def generalQuery(self, user_question):

        system_prompt = helpers.generalPrompt

        result = self._generate(system_prompt, user_question)

        self.chat_history.append({
            "user": user_question,
            "assistant": result
        })

        return result
    
    def summary(self, prompt, chat_history):
        system_prompt = prompt
        result = self._generate(system_prompt, chat_history)

        return result
    
def UserQuestion(context, user_question, chat):
        api = os.getenv("OPENAI_API_KEY")

        client = OpenAI(api_key=api)
        model = "gpt-4o-mini"

        system_prompt = helpers.GenerateSystemPrompt(context, chat )
         
        response = client.chat.completions.create(
                model=model,
                messages= [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_question}
            ],
                response_format={"type": "json_object"}
            )
        
        content = response.choices[0].message.content

        

        # result = self._generate(system_prompt, user_question)

        return json.loads(content)

    

        
