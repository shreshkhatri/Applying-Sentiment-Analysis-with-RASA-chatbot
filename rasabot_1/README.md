1. First Python virtual environment needs to be created as RASA has dependencies with
specific versions. Virtual environment can be created using the command below.

- python -m venv [folder_name]

where 
	- folder_name is the name of the folder that will be used as virtual environment

2. Activate the virtual environment

3. copy the requirements.txt file present inside 'rasabot_1' and paste it inside the virtual environment.

4. Then open command prompt and activate virtual environment then install all the requirements 
using specified in 'requirements.txt' file using the command below.
	- pip install -r requirements.txt  
	
	this command will install rasa and its every dependencies

5. now copy 'rasabot_1' folder and paste it inside the virtual environment created.

6. Inside previous command prompt, switch directory to 'rasabot_1' and activate the chat server created using the command
	below.
	-rasa run -m models --enable-api --cors "*" --debug 
	