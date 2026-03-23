import requests
import json

def main():
    url = "http://localhost:1234/v1/chat/completions"
    headers = {"Content-Type": "application/json"}

    # The schema definition
    schema = {
        "type": "object",
        "properties": {
            "destinations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string"},
                        "best_time_to_visit": {"type": "string"},
                        "estimated_budget_in_USD": {"type": "number"}
                    },
                    "required": ["destination", "best_time_to_visit", "estimated_budget_in_USD"]
                },
                "minItems": 3,
                "maxItems": 3
            }
        },
        "required": ["destinations"]
    }

    # The OpenAI-compatible payload structure
    payload = {
        "model": "local-model", # LM Studio will use whatever model is currently loaded
        "messages": [
            {"role": "system", "content": "You are a travel assistant that is conversational and friendly and always starts with a greeting and uses lots of formatting to have pretty text."},
            {"role": "user", "content": "Suggest 3 budget-friendly travel spots in Europe."}
        ],
        "temperature": 0.7,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "budget_destinations",
                "schema": schema,
                "strict": True
            }
        }
    }

    print("Sending request to LM Studio API via requests...")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status() 
        
        # Navigate the response dictionary to find the model's text output
        result_data = response.json()
        content = result_data["choices"][0]["message"]["content"]
        
        # Parse and print
        parsed_content = json.loads(content)
        print(json.dumps(parsed_content, indent=4))
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to LM Studio. Is the local server running on port 1234?")
    except json.JSONDecodeError:
        print("Error: The model did not return valid JSON. Raw output:")
        print(content)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()