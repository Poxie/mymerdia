import styles from '../../styles/Messages.module.scss';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../contexts/auth/AuthProvider";
import { prependMessages, removeUnreadCount, setLastChannelId, setMessages } from "../../redux/messages/actions";
import { selectChannelUnreadCount, selectLastChannelId, selectMessageIds } from "../../redux/messages/hooks";
import { useAppSelector } from "../../redux/store";
import { Message } from "./Message";
import { User } from '../../types';
import Link from 'next/link';

const PREVENT_AUTO_SCROLL_THRESHOLD = 200;
const UPDATE_SCROLL_THRESHOLD = 600;
const MESSAGES_TO_LOAD = 50;
export const Messages: React.FC<{
    channelId: number;
    recipient: User;
}> = ({ channelId, recipient }) => {
    const dispatch = useDispatch();
    const { get, patch, loading } = useAuth();
    const messageIds = useAppSelector(state => selectMessageIds(state, channelId));
    const unreadCount = useAppSelector(state => selectChannelUnreadCount(state, channelId));
    const lastChannelId = useAppSelector(selectLastChannelId);
    const scrollContainer = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const loadingMore = useRef(false);
    const shouldScroll = useRef(messageIds === undefined);
    const [reachedEnd, setReachedEnd] = useState(false);

    // Function to fetch messages
    const fetchMessages = useCallback(async (amount=MESSAGES_TO_LOAD, startAt=0) => {
        const messages = await get(`/channels/${channelId}/messages?amount=${amount}&start_at=${startAt}`);
        return messages;
    }, [channelId]);

    // Fetching channel messages
    useEffect(() => {
        // Making sure not to make unnecessary requests
        if(messageIds || loading) return;

        // Getting messages
        fetchMessages().then(messages => {
            dispatch(setMessages(channelId, messages));
        })
    }, [channelId, messageIds, get, loading]);

    // Fetching more messages on scroll
    useEffect(() => {
        if(!messageIds?.length) return;

        // Listening to message list scroll
        const onScroll = async () => {
            if(!scrollContainer.current) return;

            // Checking if scroll meets threshold
            const scroll = scrollContainer.current.scrollTop;
            if(scroll < UPDATE_SCROLL_THRESHOLD) {
                if(loadingMore.current) return;
                loadingMore.current = true;

                // Fetching and displaying new messages
                const messages = await fetchMessages(MESSAGES_TO_LOAD, messageIds.length);
                dispatch(prependMessages(channelId, messages));

                // If messages are returned, allow re-fetch on scroll
                if(messages.length) {
                    loadingMore.current = false;
                } else {
                    setReachedEnd(true);
                }
            }
        }

        // Handling event listeners
        scrollContainer.current?.addEventListener('scroll', onScroll)
        return () => scrollContainer.current?.removeEventListener('scroll', onScroll);
    }, [messageIds?.length]);

    // Updating last channelId
    useEffect(() => {
        // On channel change, scroll to bottom
        shouldScroll.current = true;

        // Resetting states
        setReachedEnd(false);
        loadingMore.current = false;

        // Checking if last channel is same channel
        if(channelId === lastChannelId) return;

        // Dispatching new channelId
        dispatch(setLastChannelId(channelId));
    }, [channelId, lastChannelId]);

    // Resetting unread count
    useEffect(() => {
        if(!unreadCount) return;

        patch(`/channels/${channelId}/unread`, {
            unread_count: 0
        })
            .then(result => {
                dispatch(removeUnreadCount(channelId));
            })
    }, [unreadCount, channelId, patch]);

    // Scrolling to bottom
    const scrollToBottom = useCallback(() => {
        if(!list.current || !scrollContainer.current) return;
        scrollContainer.current.scrollTo({ top: list.current.clientHeight })
    }, [list, scrollContainer]);

    // Scrolling to bottom on render or new messages
    useEffect(() => {
        if(!scrollContainer.current || !list.current) return;

        // Scrolling to bottom on render
        if(messageIds && shouldScroll.current) {
            shouldScroll.current = false;
            return scrollToBottom();
        }
        
        // Getting scroll from bottom
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer.current;
        const scrollFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // Checking if scroll is within scroll threshold
        if(scrollFromBottom < PREVENT_AUTO_SCROLL_THRESHOLD) {
            scrollToBottom();
        }
    }, [list, scrollContainer, messageIds?.length]);

    return(
        <div className={styles['list-container']}>
            <div className={styles['scroll-container']} ref={scrollContainer}>
                <ul className={styles['list']} ref={list}>
                    {messageIds && !messageIds?.length && (
                        <span>
                            You don't have any messages with 
                            {' '}
                            <Link href={`/users/${recipient.id}`}>
                                <a>
                                    <strong>{recipient.display_name || recipient.username}</strong>
                                </a>
                            </Link>
                            {' '}
                            yet.
                        </span>
                    )}

                    {messageIds && messageIds.length !== 0 && reachedEnd && (
                        <span className={styles['list-label']}>
                            You have reached the end of the conversation with
                            {' '}
                            <Link href={`/users/${recipient.id}`}>
                                <a>
                                    <strong>{recipient.display_name || recipient.username}</strong>
                                </a>
                            </Link>
                            .
                        </span>
                    )}

                    {messageIds && messageIds.map((id, key) => (
                        <Message 
                            id={id}
                            prevId={messageIds.slice(key - 1, key)[0]}
                            nextId={messageIds.slice(key + 1, key + 2)[0]}
                            channelId={channelId}
                            key={id}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}