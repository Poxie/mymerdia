import styles from '../../styles/Comments.module.scss';

export const CommentSkeleton = () => {
    return(
        <div className={styles['skeleton-comment']} aria-hidden="true">
            <div className={styles['skeleton-avatar']} />
            <div className={styles['comment-main']}>
                <div className={styles['skeleton-header']}>
                    <div className={styles['skeleton-author']} />
                    <div className={styles['skeleton-timestamp']} />
                </div>
                <div className={styles['skeleton-content']}>
                    <div />
                    <div />
                    <div />
                </div>
                <div className={styles['comment-footer']}>
                    <div className={styles['skeleton-footer-button']} />
                </div>
            </div>
        </div>
    )
}