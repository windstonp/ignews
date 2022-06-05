import styles from './styles.module.scss';
import { SignInButton } from '../signInButton';
import { ActiveLink } from '../activeLink';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="Ignews" />
        <nav>
          <ActiveLink activeClassName={styles.active} href='/'>
            <a>home</a>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href='/posts'>
            <a>posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  )
}