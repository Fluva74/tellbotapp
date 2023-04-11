import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { Button, Input } from "react-native-elements";



const CHATBOT_USER_ID = "chatbot_user_id";

const systemMessage = {
  _id: 1,
  text:
    "Explain things like you're talking to a software professional with 1 year of experience.",
  createdAt: new Date(),
  system: true,
};

const CustomInputToolbar = (props) => {
  const [inputText, setInputText] = useState("");

  return (
    <View style={{ 
      padding: 30
       }}>
      <TextInput
        style={{
          padding: 10,
          marginTop: -10,
          borderColor: "red",
          borderWidth: 1,
          borderRadius: 4,
        }}
        placeholder="Type your message here..."
        onChangeText={(text) => setInputText(text)}
        value={inputText}
        onSubmitEditing={(event) => {
          const newMessage = [
            {
              _id: Math.random()
                .toString(36)
                .substring(7),
              text: event.nativeEvent.text,
              createdAt: new Date(),
              user: {
                _id: 1,
                name: "User",
                avatar: "https://placeimg.com/140/140/any",
              },
            },
          ];
          props.onSend(newMessage);
          setInputText("");
        }}
        blurOnSubmit
        {...props}
      />
    </View>
  );
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 0,
        text: "Hello, I'm ChatGPT! Ask me anything!",
        createdAt: new Date(),
        user: {
          _id: CHATBOT_USER_ID,
          name: "ChatGPT",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
    ]);
  }, []);

  const onSend = async (newMessages = []) => {
    console.log("newMessages:", newMessages);
    const userMessage = newMessages[0];
    setIsLoading(true);

    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));

    try {
      const chatbotResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer <<<API KEY GOES HERE>>>`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: userMessage.text,
              },
            ],
            max_tokens: 50,
            n: 1,
            stop: "\n",
          }),
        }
      );

      const chatbotResponseJson = await chatbotResponse.json();
      setIsLoading(false);
      console.log("chatbotResponseJson:", chatbotResponseJson);

      if (
        chatbotResponseJson.choices &&
        chatbotResponseJson.choices.length > 0
      ) {
        const chatbotResponseText =
          chatbotResponseJson.choices[0].message.content;

        const chatbotMessage = {
          _id: Math.random()
            .toString(36)
            .substring(7),
          text: chatbotResponseText,
          createdAt: new Date(),
          user: {
            _id: CHATBOT_USER_ID,
            name: "ChatGPT",
            avatar: "https://placeimg.com/140/140/any",
          },
        };

        setMessages((prevMessages) =>
          GiftedChat.append(prevMessages, [chatbotMessage])
        );
      } else {
        console.log("No choices found in the API response");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching chatbot response:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
        renderInputToolbar={(toolbarProps) => (
          <CustomInputToolbar
            onSend={(newMessages) => onSend(newMessages)}
            {...toolbarProps}
          />
        )}
        renderAvatar={null}
        renderUsernameOnMessage={true}
        scrollToBottom={true}
        alwaysShowSend={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default App;
