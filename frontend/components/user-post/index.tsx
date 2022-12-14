import React from 'react';
import styles from './UserPost.module.scss';
import { UserPostHeader } from './UserPostHeader';
import { UserPostContent } from './UserPostContent';
import { UserPostFooter } from './UserPostFooter';
import Link from 'next/link';
import { useAppSelector } from '../../redux/store';
import { selectPostById } from '../../redux/posts/selectors';
import { UserPostAttachments } from './UserPostAttachments';

export const UserPost: React.FC<{
    id: number;
}> = React.memo(({ id }) => {
    const post = useAppSelector(state => selectPostById(state, id));
    if(!post) return null;

    const { author, timestamp, content } = post;
    return(
        <li className={styles['container']}>
            <UserPostHeader 
                user={author}
                postId={id}
                timestamp={timestamp}
                privacy={post.privacy}
            />
            <UserPostContent content={content} />
            <UserPostAttachments authorId={post.author_id} id={id} />
            <UserPostFooter authorId={post.author_id} id={id} />
            <Link href={`/posts/${id}`}>
                <a aria-label="Go to post" className={styles['post-link']}/>
            </Link>
        </li>
    )
});
UserPost.displayName = 'UserPost';