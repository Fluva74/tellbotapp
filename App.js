import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Button, Input } from 'react-native-elements';
import {API_KEY} from "@env"

const CHATBOT_USER_ID = 'chatbot_user_id';

const systemMessage = {
  _id: 1,
  text: "Explain things like you're talking to a software professional with 1 year of experience.",
  createdAt: new Date(),
  system: true,
};

const App = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 0,
        text: "Hello, I'm ChatGPT! Ask me anything!",
        createdAt: new Date(),
        user: {
          _id: CHATBOT_USER_ID,
          name: 'ChatGPT',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = async (newMessages = []) => {
    console.log('newMessages:', newMessages);
    console.log()
    const userMessage = newMessages[0];

    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, newMessages),
    );

    const chatbotResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `User: ${userMessage.text}\nChatGPT:`,
        max_tokens: 50,
        n: 1,
        stop: '\n',
      }),
    });

    const chatbotResponseJson = await chatbotResponse.json();
    const chatbotResponseText = chatbotResponseJson.choices[0].text;

    const chatbotMessage = {
      _id: Math.random().toString(36).substring(7),
      text: chatbotResponseText,
      createdAt: new Date(),
      user: {
        _id: CHATBOT_USER_ID,
        name: 'ChatGPT',
        avatar: 'https://placeimg.com/140/140/any',
      },
    };

    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, [chatbotMessage]),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: 1,
        }}
        placeholder="Type your message here..."
        renderSend={(props) => (
          <Button
            title="Send"
            type="outline"
            onPress={() => props.onPress()}
            buttonStyle={{ height: 48 }}
          />
        )}
        renderComposer={(props) => (
          <Input
          multiline
          placeholder="Type your message here..."
          onChangeText={(text) => console.log(text)}
          defaultValue={props.text}
          containerStyle={{ paddingHorizontal: 8, marginBottom: 4 }}
          inputContainer {...props}
        />
        
        
          )}
          renderAvatar={null}
          renderUsernameOnMessage={true}
          scrollToBottom={true}
          alwaysShowSend={true}
          textInputProps={{
            returnKeyType: 'send',
            onSubmitEditing: (event) => {
              const newMessage = [{
                _id: Math.random().toString(36).substring(7),
                text: event.nativeEvent.text,
                createdAt: new Date(),
                user: {
                  _id: 1,
                  name: 'User',
                  avatar: 'https://placeimg.com/140/140/any',
                },
              }];
              onSend(newMessage);
            },
          }}
        />
      </SafeAreaView>
      );
      };
      
      const styles = StyleSheet.create({
      container: {
      flex: 1,
      backgroundColor: '#fff',
      },
      });
      
      export default App;
