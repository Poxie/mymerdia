import styles from '../../../styles/Feed.module.scss';
import { useAuth } from "../../../contexts/auth/AuthProvider";
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { UserPostSkeleton } from '../../user-post/UserPostSkeleton';
import { setPosts } from '../../../redux/posts/actions';
import { addFeedPostIds } from '../../../redux/feed/actions';
import { Post } from '../../../types';
import { LoginPrompt } from '../../login-prompt/LoginPrompt';
import { useTranslation } from 'next-i18next';
import { EmptyPrompt } from '../../empty-prompt/EmptyPrompt';
import { selectFeedPostIds } from '../../../redux/feed/selectors';
import { RequestFinished, useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { AnimatePresence } from 'framer-motion';
import { UserPost } from '../../user-post';

const SCROLL_THRESHOLD = 500;
const FETCH_AMOUNT = 10;
const PLACEHOLDER_AMOUNT = 4;
export const Feed = () => {
    const { t } = useTranslation('home');
    const { token, loading } = useAuth();
    const dispatch = useAppDispatch();
    const postIds = useAppSelector(selectFeedPostIds);

    // Fetching feed post on mount and scroll
    const onRequestFinished: RequestFinished<Post[]> = (posts, reachedEnd) => {
        const filteredPosts = posts.filter(post => !postIds.includes(post.id));

        dispatch(setPosts(filteredPosts));
        dispatch(addFeedPostIds(filteredPosts.map(post => post.id)));
    };
    const { reachedEnd, loading: feedLoading } = useInfiniteScroll<Post[]>(
        `/feed?amount=${FETCH_AMOUNT}&start_at=${postIds.length}`,
        onRequestFinished,
        {
            threshold: SCROLL_THRESHOLD,
            fetchAmount: FETCH_AMOUNT,
            fetchOnMount: postIds.length === 0 && token !== null,
            identifier: 'feed'
        }
    )

    // Feed is empty
    if(!postIds.length && reachedEnd) {
        const searchInput = document.querySelector('[data-search-input="true"]') as HTMLInputElement | null;
        return(
            <EmptyPrompt
                header={t('feedEmptyHeader')}
                message={t('feedEmptyMessage')}
                buttons={[
                    { text: t('exploreMode'), type: 'default', path: '/home/explore' },
                    { text: t('searchMode'), type: 'secondary', onClick: () => searchInput?.focus() }
                ]}
            />
        )
    }

    // User is not logged in
    if(!loading && !token) return <LoginPrompt />;

    return(
        <>
            {postIds.length !== 0 && (
                <ul className={styles['container']}>
                    {postIds.map(id => <UserPost id={id} key={id} />)}
                </ul>
            )}

            <AnimatePresence>
                {feedLoading && (
                    <ul className={styles['container']}>
                        {Array.from(Array(PLACEHOLDER_AMOUNT)).map((_, key) => (
                            <UserPostSkeleton 
                                key={key}
                            />
                        ))}
                    </ul>
                )}
            </AnimatePresence>

            {reachedEnd && postIds.length !== 0 && (
                <span className={styles['end']}>
                    {t('reachedEnd')}
                </span>
            )}
        </>
    )
}