import { Channel, Message } from "../../types";
import { SET_CHANNELS, SET_MESSAGES } from "./constants";

export const setChannels = (channels: Channel[]) => ({
    type: SET_CHANNELS,
    payload: channels
})
export const setMessages = (messages: Message[]) => ({
    type: SET_MESSAGES,
    payload: messages
})