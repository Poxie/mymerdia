import styles from './MessagesLayout.module.scss';
import { useAppSelector } from "../../redux/store"
import { MessageSidebarChannel } from "./MessageSidebarChannel";
import { MessageSidebarChannelLoading } from "./MessageSidebarChannelLoading";
import { AddIcon } from "../../assets/icons/AddIcon";
import { useModal } from "../../contexts/modal/ModalProvider";
import { SelectUserModal } from "../../modals/select-user/SelectUserModal";
import Button from '../../components/button';
import { useTranslation } from 'next-i18next';
import { HasTooltip } from '../../components/tooltip/HasTooltip';
import { selectChannelIds, selectChannelsLoading } from '../../redux/messages/selectors';

export const MessagesSidebar = () => {
    const { t } = useTranslation('messages');
    const { setModal } = useModal();
    const channels = useAppSelector(selectChannelIds);
    const channelsLoading = useAppSelector(selectChannelsLoading);

    // Function to open start conversation modal
    const openConvoModal = () => {
        setModal(<SelectUserModal />);
    }

    // Showing loading skeleton
    if(channelsLoading) {
        return(
            <div className={styles['sidebar']} aria-hidden="true">
                <div className={styles['sidebar-header']}>
                    <div className={styles['sidebar-header-text']} />
                    <div className={styles['sidebar-header-button']} />
                </div>
                <ul className={styles['tabs']}>
                    {Array.from(Array(8)).map((_, key) => (
                        <MessageSidebarChannelLoading key={key} />
                    ))}
                </ul>
            </div>
        )
    }

    return(
        <div className={styles['sidebar']}>
            <div className={styles['sidebar-header']}>
                <span>
                    {t('directMessages')}
                </span>

                <HasTooltip 
                    tooltip={t('startConversation')}
                    onClick={openConvoModal}
                >
                    <AddIcon />
                </HasTooltip>
            </div>

            {!channels.length && (
                <div className={styles['sidebar-empty']}>
                    <span>
                        {t('emptyChannels')}
                    </span>
                    <Button 
                        className={styles['empty-button']}
                        onClick={openConvoModal}
                    >
                        {t('startConversation')}
                    </Button>
                </div>
            )}

            <ul className={styles['tabs']}>
                {channels.map(id => (
                    <MessageSidebarChannel 
                        id={id}
                        key={id}
                    />
                ))}
            </ul>
        </div>
    )
}