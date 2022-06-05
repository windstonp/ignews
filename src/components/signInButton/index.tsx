import styles from './styles.module.scss';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { signIn, useSession, signOut } from 'next-auth/react';

export function SignInButton() {
  const { status: userIsLogged, data } = useSession();
  return (
    <button className={styles.signInButton} type="button" onClick={userIsLogged == 'unauthenticated' ? () => signIn() : () => { }}>
      <FaGithub color={userIsLogged == 'authenticated' ? '#04d361' : '#eba417'} />
      {userIsLogged == 'authenticated' ? data.user.name : 'Sign in with Github'}
      {userIsLogged == 'authenticated' ? <FiX className={styles.closeIcon} color="#737380" onClick={() => signOut()} /> : ''}
    </button>
  );
} 