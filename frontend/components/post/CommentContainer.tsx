import { useState } from "react";
import { Filters } from "../filters/Filters"
import styles from '../../styles/Post.module.scss';
import { usePostId } from "../../hooks/usePostId";
import { useAppSelector } from "../../redux/store";
import { selectCommentIds, selectPostIsFetched } from "../../redux/posts/selectors";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Comment as CommentType } from "../../types";
import { useDispatch } from "react-redux";
import { setPostComments } from "../../redux/posts/actions";
import { Comment } from "./Comment";
import { CommentSkeleton } from "./CommentSkeleton";
import { useTranslation } from "next-i18next";

const FETCH_AMOUNT = 15;
const SCROLL_THRESHOLD = 400;
const LOADING_SKELETON_COUNT = 4;
export const CommentContainer = () => {
    const { t } = useTranslation('post');
    const postId = usePostId();
    const dispatch = useDispatch();
    const [orderType, setOrderType] = useState<CommentType['orderType']>('top');
    const postIsFetched = useAppSelector(state => selectPostIsFetched(state, postId));
    const commentIds = useAppSelector(state => selectCommentIds(state, postId, orderType));

    // Fetching comments
    const onRequestFinished = (result: CommentType[]) => {
        dispatch(setPostComments(postId, result, orderType));
    }
    const { loading } = useInfiniteScroll(
        `/posts/${postId}/comments?amount=${FETCH_AMOUNT}&start_at=${commentIds.length}&order_by=${orderType}`,
        onRequestFinished,
        {
            fetchAmount: FETCH_AMOUNT,
            threshold: SCROLL_THRESHOLD,
            identifier: `${postId}-${orderType}`,
            fetchOnMount: !commentIds.length,
            standBy: postIsFetched === false
        }
    )

    return(
        <>
            <Filters 
                items={[
                    { text: 'Top', id: 'top' },
                    { text: 'Latest', id: 'latest' }
                ]}
                defaultActive={orderType}
                containerClassName={styles['filters']}
                onChange={id => setOrderType(id as CommentType['orderType'])}
            />

            {commentIds.length !== 0 && (
                <ul>
                    {commentIds.map(id => (
                        <Comment 
                            id={id}
                            postId={postId}
                            key={id}
                        />
                    ))}
                </ul>
            )}

            {!loading && postIsFetched && !commentIds.length && (
                <span>
                    {t('noComments')}
                </span>
            )}

            {(loading || !postIsFetched) && Array.from(Array(LOADING_SKELETON_COUNT)).map((_, key) => (
                <CommentSkeleton key={key} />
            ))}
        </>
    )
}