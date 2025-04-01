import { useState } from "react";
import { Box, TextField, IconButton, Typography, Paper, Container, Divider, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const Chat = () => {
    const url = "https://api.openai.com/v1/chat/completions";
    const apiKey = import.meta.env.VITE_OPEN_AI_API_KEY;

    const [convos, setConvos] = useState([]);
    const [currentConvo, setCurrentConvo] = useState([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
    const [activeConvoIndex, setActiveConvoIndex] = useState(null);
    const [input, setInput] = useState("");

    const callOpenApi = async (userMsg) => {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    messages: [
                        ...currentConvo.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMsg }
                    ],
                    model: "gpt-4o-mini",
                    temperature: 0.8
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error?.message}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            setCurrentConvo(prev => [...prev, { role: "assistant", content: botResponse }]);
            return botResponse;

        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newConvo = [...currentConvo, { role: "user", content: input }];
        setCurrentConvo(newConvo);
        if (currentConvo.length === 1) {
            setConvos(prev => [
                ...prev,
                { title: input.slice(0, 20), messages: newConvo }
            ]);
            setActiveConvoIndex(convos.length);
        }
        setInput("");
        callOpenApi(input);
    };

    const startNewConversation = () => {
        if (currentConvo.length > 1) {
            if (activeConvoIndex !== null) {
                setConvos(prev => {
                    const updatedConvos = [...prev];
                    updatedConvos[activeConvoIndex].messages = currentConvo;
                    return updatedConvos;
                });
            } else {
                setConvos(prev => [
                    ...prev,
                    { title: currentConvo[1]?.content.slice(0, 20) || `Conversation ${prev.length + 1}`, messages: currentConvo }
                ]);
            }
        }
        setCurrentConvo([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
        setActiveConvoIndex(null);
    };

    const selectConversation = (index) => {
        setCurrentConvo(convos[index].messages);
        setActiveConvoIndex(index);
    };

    return (
        <Box sx={{ display: "flex", height: "100vh", bgcolor: "#181818" }}>
            <Box
                sx={{
                    width: "300px",
                    bgcolor: "#222",
                    color: "#ddd",
                    display: "flex",
                    flexDirection: "column",
                    p: 2,
                    borderRight: "1px solid #333",
                    overflowY: "auto",
                }}
            >
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, textAlign: "center", color: "#fff" }}>
                    Chat History
                </Typography>
                <Button onClick={startNewConversation} variant="contained" sx={{ mb: 2, bgcolor: "#005BBB" }}>
                    New Conversation
                </Button>
                <Divider sx={{ bgcolor: "#444", mb: 2 }} />

                {convos.map((convo, index) => (
                    <Paper
                        key={index}
                        sx={{
                            p: 1,
                            mb: 1,
                            bgcolor: "#333",
                            color: "#fff",
                            borderRadius: 1,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#3A3A3A" },
                        }}
                        onClick={() => selectConversation(index)}
                    >
                        <Typography variant="body2" noWrap>
                            {convo.title}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            <Container
                maxWidth="md"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "800px",
                        height: "70vh",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 3,
                        bgcolor: "#1E1E1E",
                        borderRadius: 3,
                        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                        overflowY: "auto",
                    }}
                >
                    {currentConvo.map((msg, index) => (
                        <Paper
                            key={index}
                            sx={{
                                p: 2,
                                maxWidth: "75%",
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                bgcolor: msg.role === "user" ? "#005BBB" : "#3A3A3A",
                                color: "white",
                                borderRadius: msg.role === "user" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                                boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            {msg.content}
                        </Paper>
                    ))}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: "840px",
                        mt: 2,
                        bgcolor: "#222",
                        p: 1,
                        borderRadius: 3,
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        sx={{
                            bgcolor: "#333",
                            borderRadius: 2,
                            input: { color: "#fff" },
                        }}
                    />
                    <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1, bgcolor: "#005BBB" }}>
                        <SendIcon sx={{ color: "#fff" }} />
                    </IconButton>
                </Box>
            </Container>
        </Box>
    );
};

export default Chat;
