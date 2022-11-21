import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { OptionsIcon } from '../../assets/icons/OptionsIcon';
import { useAuth } from '../../contexts/auth/AuthProvider';
import { useMenu } from '../../contexts/menu/MenuProvider';
import { MenuGroup } from '../../contexts/menu/types';
import { useModal } from '../../contexts/modal/ModalProvider';
import { useToast } from '../../contexts/toast/ToastProvider';
import { ConfirmModal } from '../../modals/confirm/ConfirmModal';
import { removeComment } from '../../redux/posts/actions';
import { selectCommentAuthor } from '../../redux/posts/selectors';
import { useAppSelector } from '../../redux/store';
import styles from '../../styles/Post.module.scss';

export const CommentOptions: React.FC<{
    id: number;
}> = ({ id }) => {
    const { t } = useTranslation('common');
    const { profile, destroy } = useAuth();
    const { setModal, close } = useModal();
    const { setToast } = useToast();
    const { setMenu } = useMenu();
    const router = useRouter();
    const dispatch = useDispatch();
    const author = useAppSelector(state => selectCommentAuthor(state, id));
    const ref = useRef<HTMLButtonElement>(null);

    const goToAuthor = () => router.push(`/users/${author?.id}`);
    const onClick = () => {
        const items: MenuGroup[] = [[
            { text: t('goToAuthor'), onClick: goToAuthor }
        ]]

        // If user is author of comment, allow extra options
        if(profile?.id === author?.id) {
            const deleteComment = () => {
                destroy(`/comments/${id}`)
                    .then(() => {
                        setToast(t('commentRemoveSuccess'), 'success');
                        dispatch(removeComment(id));
                        close();
                    })
                    .catch(error => {
                        setToast(t('commentRemoveError'), 'error');
                    })
            }

            const confirmDeletion = () => {
                setModal(
                    <ConfirmModal 
                        header={t('commentRemoveHeader')}
                        subHeader={t('commentRemoveSubHeader')}
                        onCancel={close}
                        onConfirm={deleteComment}
                    />
                );
            }

            items.push([
                { text: t('commentRemove'), onClick: confirmDeletion, type: 'danger' }
            ])
        }

        setMenu(items, ref);
    }

    return(
        <div className={styles['comment-options']}>
            <button 
                onClick={onClick}
                ref={ref}
            >
                <OptionsIcon />
            </button>
        </div>
    )
}