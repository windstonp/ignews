import { predicate } from '@prismicio/client';
import Head from 'next/head';
import style from './styles.module.scss';
import { getPrismic } from '../../services/prismic';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
type post = {
  slug: string,
  title: string,
  excerpt: string,
  updatedAt: string
}
interface PostsProps {
  posts: post[]
}
export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={style.container}>
        <div className={style.posts}>
          {posts.map(post => (
            <Link href={`posts/${post.slug}`} key={post.slug}>
              <a>
                <time>
                  {post.updatedAt}
                </time>
                <strong>
                  {post.title}
                </strong>
                <p>
                  {post.excerpt}
                </p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismic();
  const response = await prismic.get({
    predicates: predicate.at('document.type', 'publication'),
    pageSize: 100
  })

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-br', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: { posts }
  }
}