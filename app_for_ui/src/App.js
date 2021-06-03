import React, { Component } from "react";
import { Widget, addResponseMessage, addUserMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import "./App.css";
import { v4 as uuidv4 } from 'uuid';


//disable showing minor warning on console
console.log = console.warn = console.error = () => {};


class App extends Component {
  state = {};

  handleNewUserMessage = newMessage => {
    //this.communicateMessages(newMessage);
    // Now send the message to RASA server using the endpoint shown below
	  var sender_ID=sessionStorage.getItem('sender_ID');
	
    const url = "http://localhost:5005/webhooks/rest/webhook";
    var obj = { sender:sender_ID, message: newMessage };
    console.log(JSON.stringify(obj));
   //this fetch API call is used to forward the message typed as object 'obj' to the URL 
   //specified by url variable.
    fetch("http://localhost:5005/webhooks/rest/webhook", {
      method: "POST",
	    mode : 'cors',
      headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'charset':'UTF-8',
          },
      body: JSON.stringify(obj)
    })
      .then(resp =>resp.json())
      .then(res => {
		  res.forEach(item =>{
			  //addResponseMessage(item.recipient_id);
			  addResponseMessage(String(item.text));
		  });     
      })
      .catch(error =>
        //this means that there is no response coming from FETCH API whcih means the 
        //application server is not reachable therefore, the unavailabl response is sent to the user
        addResponseMessage(
          "I am unaviable right now. Please try again later. \nSorry for the inconvenience."
        )
      );
  };

 
  componentDidMount() {
	
	if (sessionStorage.getItem('sender_ID')==null)
	{
      var sender_ID=uuidv4();
      sessionStorage.setItem('sender_ID',sender_ID);
      addResponseMessage('Welcome to SkillBot Dummy chatbot');
		}
	else{
        var sender_ID=sessionStorage.getItem('sender_ID');
      
        const url = "http://localhost:8000/load_chat";
        var obj = { ID:String(sender_ID) };
      
      //this fetch API call is used to forward the message typed as object 'obj' to the URL 
      //specified by url variable.

        fetch(url, {
          method: "POST",
        mode : 'cors',
          headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
          body: JSON.stringify(obj)
        })
          .then(resp =>resp.json())
          .then(res => {
          console.log(res);
          res.forEach(item =>{
            if(item.events.event=="user"){
              addUserMessage(item.events.text);
            }
            else if(item.events.event=="bot"){
              addResponseMessage(item.events.text);
            }
          });
      })
          .catch(error =>
            //this means that there is no response coming from FETCH API whcih means the 
            //application server is not reachable therefore, the unavailabl response is sent to the user
            addResponseMessage(
              "I am unaviable right now. Please try again later. \nSorry for the inconvenience."
            )
          );
    }
  }

  render() {
    return (
      <div>
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          title="Virtual Assistant"
          subtitle=''
        />
      </div>
    );
  }
}

export default App;

