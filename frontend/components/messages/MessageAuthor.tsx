import styles from '../../styles/Messages.module.scss';
import Image from "next/image";
import { HasPopout } from "../../popouts/HasPopout";
import { UserPopout } from "../../popouts/user/UserPopout";
import { User } from "../../types"
import Link from 'next/link';

export const MessageAuthor: React.FC<{
    author: User;
}> = ({ author }) => {
    return(
        <HasPopout popout={<UserPopout {...author} />} className={styles['avatar']}>
            <Link href={`/users/${author.id}`}>
                <a className={styles['author']}>
                    <Image
                        src={`${process.env.NEXT_PUBLIC_AVATAR_ENDPOINT}/${author.avatar}`}
                        alt={`${author.display_name || author.username}'s avatar`}
                        layout={'fill'}
                    />
                </a>
            </Link>
        </HasPopout>
    )
}