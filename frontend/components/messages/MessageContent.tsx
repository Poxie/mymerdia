import { Fragment } from 'react';
import styles from '../../styles/Messages.module.scss';

const linkExpression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
const linkRegex = new RegExp(linkExpression);

export const MessageContent: React.FC<{
    content: string;
}> = ({ content }) => {
    const newContent = content.split(' ').map((word, key) => {
        // Checking if content includes link
        if(word.match(linkRegex)) {
            return (
                <a 
                    href={word} 
                    target="_blank"
                    rel="noreferrer"
                    className={styles['link']}
                    key={key}
                >
                    {word}
                </a>
            )
        }
        return <Fragment key={key}>{word}</Fragment>;
    })

    return(
        <div className={styles['message-content']}>
            <span>
                {newContent.map((part, key) => (
                    <Fragment key={key}>
                        {part}
                        {' '}
                    </Fragment>
                ))}
            </span>
        </div>
    )
}